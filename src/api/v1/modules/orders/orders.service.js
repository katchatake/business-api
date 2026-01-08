const boom = require('@hapi/boom');
const { Op } = require('sequelize');
const { models, sequelize } = require('../../../../config/database');
const logger = require('../../../../utils/logger');

// Fixed tax rate for now. This should be moved to business settings later.
const TAX_RATE = 0.16; 

/**
 * Creates a new order, including items, and calculates totals, discounts, and taxes.
 * @param {object} orderData - The order data from the request body.
 * @param {object} userInfo - Information about the authenticated user (userId, businessId).
 * @returns {Promise<object>} The newly created order with all its details.
 */
const create = async (orderData, userInfo) => {
  const { branchId, customerId, items } = orderData;
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
      status: 'PENDING',
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

      let linePrice = product.price; // Start with the base price
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
          model: models.products,
          as: 'product_id_products',
          where: { id: item.productId },
        }],
      });

      if (promotion) {
        promotionId = promotion.id;
        if (promotion.type === 'PERCENTAGE_ITEM') {
          lineDiscount = linePrice * (promotion.value / 100);
        } else if (promotion.type === 'FIXED_ITEM') {
          lineDiscount = promotion.value;
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
    }

    // --- Final Update to Parent Order ---
    const finalTotal = subtotal - totalDiscountAmount + totalTaxAmount;
    await parentOrder.update({
      subtotal,
      total_discount_amount: totalDiscountAmount,
      total_tax_amount: totalTaxAmount,
      total: finalTotal,
    }, { transaction: t });

    await t.commit();
    logger.info(`Order ${parentOrder.id} created successfully.`);

    // Return the full order
    const fullOrder = await models.orders.findByPk(parentOrder.id, {
      include: ['order_items']
    });
    return fullOrder;

  } catch (error) {
    await t.rollback();
    logger.error(`Order creation failed: ${error.message}`, { stack: error.stack });
    if (boom.isBoom(error)) throw error;
    throw boom.internal('Failed to create order.', error);
  }
};

module.exports = {
  create,
};
