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
 * Lists all products for a given business.
 * It also validates that the user has access to the requested branch.
 * @param {number} businessId - The ID of the business from the user's token.
 * @param {number} userBranchId - The ID of the branch from the user's token.
 * @param {number} queryBranchId - The optional branchId from the query params.
 * @returns {Promise<Array>} A list of products.
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

  logger.info(`Fetching all products for business ${businessId}`);

  const products = await models.products.findAll({
    where: { business_id: businessId },
    order: [['name', 'ASC']],
  });

  return products;
};

module.exports = {
  createProduct,
  listByBusiness,
};
