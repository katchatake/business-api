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
  return newBusinessType;
};

module.exports = {
  create,
};
