const boom = require('@hapi/boom');
const { models } = require('../../../../config/database');
const logger = require('../../../../utils/logger');

/**
 * Adjusts the inventory quantity for a specific product in a given branch.
 * If no inventory record exists, it creates one.
 * @param {number} productId - The ID of the product.
 * @param {number} branchId - The ID of the branch.
 * @param {number} businessId - The ID of the business (from user's token for security).
 * @param {number} adjustment - The amount to adjust the quantity by (can be positive or negative).
 * @param {string} reason - The reason for the adjustment (optional).
 * @returns {Promise<object>} The updated or created inventory record.
 */
const updateProductInventory = async (productId, branchId, businessId, adjustment, reason) => {
  // 1. Verify product exists and belongs to the business
  const product = await models.products.findOne({
    where: { id: productId, business_id: businessId },
  });

  if (!product) {
    throw boom.notFound('Product not found or does not belong to your business.');
  }

  // 2. Verify branch exists and belongs to the business
  const branch = await models.branches.findOne({
    where: { id: branchId, business_id: businessId },
  });

  if (!branch) {
    throw boom.notFound('Branch not found or does not belong to your business.');
  }

  // 3. Find or create the inventory record
  let inventoryRecord = await models.inventory.findOne({
    where: {
      item_id: productId,
      item_type: 'PRODUCT',
      branch_id: branchId,
    },
  });

  if (inventoryRecord) {
    // Update existing record
    const newQuantity = parseFloat(inventoryRecord.quantity) + parseFloat(adjustment);
    if (newQuantity < 0) {
      // Optional: Prevent negative stock if business rules require it
      // throw boom.badRequest('Inventory adjustment would result in negative stock.');
      logger.warn(`Inventory for product ${productId} in branch ${branchId} went negative (${newQuantity}).`);
    }
    await inventoryRecord.update({ quantity: newQuantity });
    logger.info(`Inventory for product ${productId} in branch ${branchId} adjusted by ${adjustment}. New quantity: ${newQuantity}. Reason: ${reason || 'N/A'}`);
  } else {
    // Create new record
    if (parseFloat(adjustment) < 0) {
      // Optional: Prevent creating a record with negative stock from a negative adjustment
      // throw boom.badRequest('Cannot create inventory record with a negative adjustment.');
      logger.warn(`Attempted to create inventory record for product ${productId} in branch ${branchId} with negative adjustment (${adjustment}).`);
    }
    inventoryRecord = await models.inventory.create({
      item_id: productId,
      item_type: 'PRODUCT',
      branch_id: branchId,
      quantity: adjustment,
    });
    logger.info(`New inventory record created for product ${productId} in branch ${branchId} with quantity: ${adjustment}. Reason: ${reason || 'N/A'}`);
  }

  // TODO: Implement audit logging for inventory changes (e.g., to platform_audit_logs or a dedicated inventory_log table)

  return inventoryRecord.get({ plain: true });
};

module.exports = {
  updateProductInventory,
};
