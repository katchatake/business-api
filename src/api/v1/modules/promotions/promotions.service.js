const boom = require('@hapi/boom');
const { models, sequelize } = require('../../../../config/database');
const logger = require('../../../../utils/logger');

/**
 * Creates a new promotion and associates it with products.
 * @param {object} data - The promotion data, including productIds.
 * @param {number} businessId - The ID of the business.
 * @returns {Promise<object>} The newly created promotion.
 */
const create = async (data, businessId) => {
  const { productIds, ...promoData } = data;

  const t = await sequelize.transaction();
  try {
    // 1. Create the promotion
    const newPromotion = await models.promotions.create({
      ...promoData,
      business_id: businessId,
    }, { transaction: t });

    // 2. Verify that all products exist and belong to the business
    const products = await models.products.findAll({
      where: {
        id: productIds,
        business_id: businessId,
      },
      transaction: t,
    });

    if (products.length !== productIds.length) {
      throw boom.badRequest('One or more products are invalid or do not belong to this business.');
    }

    // 3. Associate products with the promotion
    await newPromotion.addProducts(products, { transaction: t });

    await t.commit();
    logger.info(`Promotion ${newPromotion.id} created and associated with ${products.length} products.`);
    
    // Return the promotion with its associated products
    const result = await models.promotions.findByPk(newPromotion.id, {
      include: ['product_id_products']
    });

    return result;

  } catch (error) {
    await t.rollback();
    logger.error(`Promotion creation failed: ${error.message}`, { stack: error.stack });
    if (boom.isBoom(error)) throw error;
    throw boom.internal('Failed to create promotion.', error);
  }
};

/**
 * Lists all promotions for a business.
 * @param {number} businessId - The ID of the business.
 * @returns {Promise<Array>} A list of promotions.
 */
const listByBusiness = async (businessId) => {
  const promotions = await models.promotions.findAll({
    where: { business_id: businessId },
    include: [
      {
        model: models.products,
        as: 'product_id_products',
        attributes: ['id', 'name'],
        through: { attributes: [] } // Don't include the join table attributes
      }
    ],
    order: [['name', 'ASC']],
  });
  return promotions;
};

// ... other service functions like update, findOne, remove would go here ...

module.exports = {
  create,
  listByBusiness,
};
