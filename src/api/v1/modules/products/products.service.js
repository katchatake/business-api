const boom = require('@hapi/boom');
const { models } = require('../../../../config/database');
const logger = require('../../../../utils/logger');

/**
 * Creates a new product for a specific business.
 * @param {object} productData - The data for the new product.
 * @param {number} businessId - The ID of the business.
 * @returns {Promise<object>} The newly created product.
 */
const createProduct = async (productData, businessId) => {
  logger.info(`Creating product for business ${businessId}`);

  const product = await models.products.create({
    ...productData,
    business_id: businessId,
  });

  logger.info(`Product ${product.id} created successfully for business ${businessId}`);
  return product;
};

/**
 * Lists all products for a given business, including their stock for a specific branch.
 * It also validates that the user has access to the requested branch.
 * @param {number} businessId - The ID of the business from the user's token.
 * @param {number} userBranchId - The ID of the branch from the user's token.
 * @param {number} queryBranchId - The optional branchId from the query params.
 * @returns {Promise<Array>} A list of products with their stock.
 */
const listByBusiness = async (businessId, userBranchId, queryBranchId) => {
  const targetBranchId = queryBranchId || userBranchId;

  if (!targetBranchId) {
    throw boom.badRequest('A branch ID must be provided either in your user session or as a query parameter.');
  }

  // Security check: ensure the target branch belongs to the user's business
  const branch = await models.branches.findOne({
    where: { id: targetBranchId, business_id: businessId },
  });

  if (!branch) {
    throw boom.forbidden('You do not have access to this branch.');
  }

  logger.info(`Fetching all products for business ${businessId} including stock for branch ${targetBranchId}`);

  const products = await models.products.findAll({
    where: { business_id: businessId },
    include: [
      {
        model: models.inventory,
        as: 'stock',
        where: { branch_id: targetBranchId },
        required: false, // Use LEFT JOIN to include products without an inventory record
        attributes: ['quantity'] // Only include the quantity field
      },
      {
        model: models.product_categories,
        as: 'category',
        attributes: ['id', 'name'],
      },
      {
        model: models.product_brands,
        as: 'brand',
        attributes: ['id', 'name'],
      },
      {
        model: models.suppliers,
        as: 'supplier',
        attributes: ['id', 'name'],
      }
    ],
    order: [['name', 'ASC']],
  });

  // Clean up the response to have a consistent structure
  return products.map(product => {
    const plainProduct = product.get({ plain: true });
    // If stock is null (no inventory record), present it as { quantity: 0 }
    plainProduct.stock = plainProduct.stock || { quantity: '0.0000' };
    return plainProduct;
  });
};

/**
 * Updates an existing product for a specific business.
 * @param {number} productId - The ID of the product to update.
 * @param {number} businessId - The ID of the business from the user's token.
 * @param {object} updateData - The data to update the product with.
 * @returns {Promise<object>} The updated product.
 */
const updateProduct = async (productId, businessId, updateData) => {
  logger.info(`Updating product ${productId} for business ${businessId}`);

  const product = await models.products.findOne({
    where: { id: productId, business_id: businessId },
  });

  if (!product) {
    throw boom.notFound('Product not found or does not belong to your business.');
  }

  await product.update(updateData);

  logger.info(`Product ${productId} updated successfully for business ${businessId}`);
  return product.get({ plain: true });
};

module.exports = {
  createProduct,
  listByBusiness,
  updateProduct,
};
