const inventoryService = require('./inventory.service');
const logger = require('../../../../utils/logger');

/**
 * Handles the request to update product inventory for a specific branch.
 */
const updateProductInventory = async (req, res, next) => {
  try {
    const { productId, branchId } = req.params;
    const { adjustment, reason } = req.body;
    const { businessId } = req.user; // Extracted from JWT by auth middleware

    logger.info(`Controller: Received request to adjust inventory for product ${productId} in branch ${branchId} by ${adjustment} for business ${businessId}`);

    const updatedInventory = await inventoryService.updateProductInventory(
      productId,
      branchId,
      businessId,
      adjustment,
      reason
    );

    res.status(200).json({
      message: 'Product inventory adjusted successfully',
      data: updatedInventory,
    });
  } catch (error) {
    logger.error(`Error adjusting product inventory: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

module.exports = {
  updateProductInventory,
};
