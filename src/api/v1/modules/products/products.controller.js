const productService = require('./products.service');
const logger = require('../../../../utils/logger');

/**
 * Handles the request to create a new product.
 */
const createProduct = async (req, res, next) => {
  try {
    const { body: productData } = req;
    const { businessId } = req.user; // Extracted from JWT by auth middleware

    logger.info(`Controller: Received request to create product for business ${businessId}`);

    const newProduct = await productService.createProduct(productData, businessId);

    res.status(201).json({
      message: 'Product created successfully',
      data: newProduct,
    });
  } catch (error) {
    logger.error(`Error creating product: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

/**
 * Handles the request to list products for a business.
 */
const listProducts = async (req, res, next) => {
  try {
    const { businessId, branchId: userBranchId } = req.user;
    const { branchId: queryBranchId } = req.query;

    logger.info(`Controller: Received request to list products for business ${businessId}`);

    const products = await productService.listByBusiness(businessId, userBranchId, queryBranchId);

    res.status(200).json({
      message: 'Products listed successfully',
      data: products,
    });
  } catch (error) {
    logger.error(`Error listing products: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

/**
 * Handles the request to update an existing product.
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id: productId } = req.params;
    const { body: updateData } = req;
    const { businessId } = req.user;

    logger.info(`Controller: Received request to update product ${productId} for business ${businessId}`);

    const updatedProduct = await productService.updateProduct(productId, businessId, updateData);

    res.status(200).json({
      message: 'Product updated successfully',
      data: updatedProduct,
    });
  } catch (error) {
    logger.error(`Error updating product: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

module.exports = {
  createProduct,
  listProducts,
  updateProduct,
};
