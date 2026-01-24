const boom = require('@hapi/boom');
const { Op } = require('sequelize');
const { models, sequelize } = require('../../../../config/database');
const logger = require('../../../../utils/logger');

// Fixed tax rate for now. This should be moved to business settings later.
const TAX_RATE = 0.16;

/**
 * Creates a new order, including items, and calculates totals, discounts, and taxes.
 * Optionally processes payments and updates order status.
 * @param {object} orderData - The order data from the request body.
 * @param {object} userInfo - Information about the authenticated user (userId, businessId).
 * @returns {Promise<object>} The newly created order with all its details.
 */
const create = async (orderData, userInfo) => {
  const { branchId, customerId, items, payments } = orderData; // Added payments
  const { businessId, userId } = userInfo;

  const t = await sequelize.transaction();
  try {
    // --- Initial Validations ---
    const branch = await models.branches.findOne({ where: { id: branchId, business_id: businessId } });
    if (!branch) throw boom.badRequest('Invalid branch.');
    if (customerId) {
      const customer = await models.customers.findOne({ where: { id: customerId, business_id: businessId } });
      if (!customer) throw boom.badRequest('Invalid customer.');
    }

    // --- Create parent order to get an ID ---
    const parentOrder = await models.orders.create({
      business_id: businessId,
      branch_id: branchId,
      user_id: userId,
      customer_id: customerId,
      order_type: orderData.orderType,
      metadata: orderData.metadata,
      status: 'PENDING', // Initial status
    }, { transaction: t });

    let subtotal = 0;
    let totalDiscountAmount = 0;
    let totalTaxAmount = 0;

    // --- Process each item ---
    for (const item of items) {
      const product = await models.products.findByPk(item.productId);
      if (!product || product.business_id !== businessId) {
        throw boom.badRequest(`Product with ID ${item.productId} is invalid.`);
      }

      let linePrice = parseFloat(product.price); // Start with the base price
      let lineCost = parseFloat(product.cost || 0); // Get product cost
      let lineDiscount = 0;
      let promotionId = null;

      // --- Check for active promotions ---
      const promotion = await models.promotions.findOne({
        where: {
          business_id: businessId,
          is_active: true,
          start_date: { [Op.or]: { [Op.is]: null, [Op.lte]: new Date() } },
          end_date: { [Op.or]: { [Op.is]: null, [Op.gte]: new Date() } },
        },
        include: [{
          model: models.promotion_products,
          as: 'promotion_products',
          where: { product_id: item.productId },
          required: true // Only include promotions that apply to this product
        }],
      });

      if (promotion) {
        promotionId = promotion.id;
        if (promotion.type === 'PERCENTAGE_ITEM') {
          lineDiscount = linePrice * (parseFloat(promotion.value) / 100);
        } else if (promotion.type === 'FIXED_ITEM') {
          lineDiscount = parseFloat(promotion.value);
        }
        // BOGO logic would be more complex and might need changes to this flow
      }
      
      const priceAfterDiscount = linePrice - lineDiscount;
      let lineTax = 0;
      if (product.tax_object === '02') { // "Sí objeto de impuesto"
        lineTax = priceAfterDiscount * TAX_RATE;
      }

      const totalLine = (priceAfterDiscount + lineTax) * item.quantity;
      
      await models.order_items.create({
        order_id: parentOrder.id,
        product_id: item.productId,
        product_variant_id: item.variantId,
        promotion_id: promotionId,
        product_name: product.name, // Snapshot
        quantity: item.quantity,
        unit_price: product.price, // Original price
        discount_amount: lineDiscount * item.quantity,
        tax_amount: lineTax * item.quantity,
        total_line: totalLine,
        attributes: item.attributes,
      }, { transaction: t });

      // Aggregate totals
      subtotal += product.price * item.quantity;
      totalDiscountAmount += lineDiscount * item.quantity;
      totalTaxAmount += lineTax * item.quantity;

      // --- Decrement Inventory ---
      if (product.product_type === 'SIMPLE' || product.product_type === 'SERVICE' || product.product_type === 'VARIANT_PARENT') {
        let itemToDecrementId;
        let itemToDecrementType;

        if (product.product_type === 'VARIANT_PARENT' && item.product_variant_id) {
          itemToDecrementId = item.product_variant_id;
          itemToDecrementType = 'VARIANT';
        } else {
          itemToDecrementId = item.productId;
          itemToDecrementType = 'PRODUCT';
        }

        let inventoryRecord = await models.inventory.findOne({
          where: {
            item_id: itemToDecrementId,
            item_type: itemToDecrementType,
            branch_id: branchId,
          },
          transaction: t,
        });

        const quantityToDecrement = parseFloat(item.quantity);

        if (inventoryRecord) {
          const newQuantity = parseFloat(inventoryRecord.quantity) - quantityToDecrement;
          await inventoryRecord.update({ quantity: newQuantity }, { transaction: t });
          logger.info(`Inventory for ${itemToDecrementType} ${itemToDecrementId} in branch ${branchId} decremented by ${quantityToDecrement}. New quantity: ${newQuantity}.`);
        } else {
          // If no inventory record exists, create one with negative stock (or 0 if preferred)
          // For now, we'll create it with negative stock to reflect the sale
          await models.inventory.create({
            item_id: itemToDecrementId,
            item_type: itemToDecrementType,
            branch_id: branchId,
            quantity: -quantityToDecrement,
          }, { transaction: t });
          logger.warn(`Inventory record for ${itemToDecrementType} ${itemToDecrementId} in branch ${branchId} did not exist. Created with negative stock: ${-quantityToDecrement}.`);
        }
      } else {
        logger.warn(`Inventory decrement for product type ${product.product_type} (ID: ${product.id}) not yet implemented (e.g., RECIPE-based products).`);
      }
      // --- End Decrement Inventory ---
    }

    // --- Final Update to Parent Order ---
    const finalTotal = subtotal - totalDiscountAmount + totalTaxAmount;
    let orderStatus = 'PENDING';
    let totalPaidAmount = 0;

    if (payments && payments.length > 0) {
      for (const payment of payments) {
        await models.order_payments.create({
          order_id: parentOrder.id,
          payment_method: payment.payment_method,
          amount: payment.amount,
        }, { transaction: t });
        totalPaidAmount += parseFloat(payment.amount);
      }

      if (totalPaidAmount >= finalTotal) {
        orderStatus = 'COMPLETED';
      } else {
        // If payments are provided but don't cover the full amount, it's still pending or partially paid
        // For now, we'll leave it as PENDING if not fully paid.
        // A 'PARTIALLY_PAID' status could be added to the ENUM if needed.
        orderStatus = 'PENDING';
      }
    }

    await parentOrder.update({
      subtotal,
      total_discount_amount: totalDiscountAmount,
      total_tax_amount: totalTaxAmount,
      total: finalTotal,
      status: orderStatus, // Update status based on payments
    }, { transaction: t });

    await t.commit();
    logger.info(`Order ${parentOrder.id} created successfully with status ${orderStatus}.`);

    // Return the full order including items and payments
    const fullOrder = await models.orders.findByPk(parentOrder.id, {
      include: ['order_items', 'order_payments'] // Include payments
    });
    return fullOrder;

  } catch (error) {
    await t.rollback();
    logger.error(`Order creation failed: ${error.message}`, { stack: error.stack });
    if (boom.isBoom(error)) throw error;
    throw boom.internal('Failed to create order.', error);
  }
};

/**
 * Lists orders for a given business, with optional filters.
 * @param {number} businessId - The ID of the business from the user's token.
 * @param {object} filters - Query parameters for filtering orders.
 * @returns {Promise<Array>} A list of orders.
 */
const listOrders = async (businessId, filters) => {
  logger.info(`Service: Fetching orders for business ${businessId} with filters: ${JSON.stringify(filters)}`);

  const whereClause = { business_id: businessId };

  if (filters.branchId) {
    whereClause.branch_id = filters.branchId;
  }
  if (filters.customerId) {
    whereClause.customer_id = filters.customerId;
  }
  if (filters.status) {
    whereClause.status = filters.status;
  }
  if (filters.orderType) {
    whereClause.order_type = filters.orderType;
  }
  if (filters.startDate || filters.endDate) {
    whereClause.created_date = {};
    if (filters.startDate) {
      whereClause.created_date[Op.gte] = new Date(filters.startDate);
    }
    if (filters.endDate) {
      whereClause.created_date[Op.lte] = new Date(filters.endDate);
    }
  }

  const orders = await models.orders.findAll({
    where: whereClause,
    include: [
      { model: models.order_items, as: 'order_items' },
      { model: models.order_payments, as: 'order_payments' },
    ],
    order: [['created_date', 'DESC']],
    // Add pagination options if needed:
    // limit: filters.limit || 10,
    // offset: filters.offset || 0,
  });

  return orders;
};

module.exports = {
  create,
  listOrders,
};
