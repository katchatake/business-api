const boom = require('@hapi/boom');
const { models } = require('../../../../config/database');
const logger = require('../../../../utils/logger');

/**
 * Creates a new business type.
 * @param {object} data - The data for the new business type.
 * @returns {Promise<object>} The newly created business type.
 */
const create = async (data) => {
  const { categoryId, ...restData } = data;

  // Verify that the parent category exists
  const category = await models.business_categories.findByPk(categoryId);
  if (!category) {
    throw boom.badRequest('The specified business category does not exist.');
  }

  logger.info(`Creating new business type "${data.name}" under category ${categoryId}`);

  const newBusinessType = await models.business_types.create({
    ...restData,
    category_id: categoryId,
  });

  logger.info(`Business type ${newBusinessType.id} created successfully.`);
  return newBusinessType.get({ plain: true });
};

/**
 * Retrieves all business types.
 * For public listing, we only return essential fields.
 * @returns {Promise<Array<object>>} A list of business types.
 */
const getAll = async () => {
  logger.info('Service: Fetching all business types for public listing.');
  const businessTypes = await models.business_types.findAll();
  return businessTypes;
};

/**
 * Retrieves a single business type by its ID, including its config template.
 * @param {number} id - The ID of the business type.
 * @returns {Promise<object>} The business type.
 */
const getById = async (id) => {
  logger.info(`Service: Fetching business type with ID: ${id}`);
  const businessType = await models.business_types.findByPk(id);

  if (!businessType) {
    throw boom.notFound('Business type not found.');
  }

  return businessType.get({ plain: true });
};

module.exports = {
  create,
  getAll,
  getById,
};
