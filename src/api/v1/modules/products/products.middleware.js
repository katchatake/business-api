const boom = require('@hapi/boom');
const { models } = require('../../../../config/database');
const logger = require('../../../../utils/logger');

// (Existing checkProductPermissions function remains unchanged)
const PRODUCT_SELLING_CATEGORIES = [
  'Retail Rápido / Tienda', 'Retail', 'Retail / Comercio','Tienda de Abarrotes', 'Farmacia',
  'Ferretería', 'Retail Especializado', 'Alimentos y Bebidas', 'Suscripciones', 'Servicios'
];

function checkProductPermissions(req, res, next) {
  if (!req.user || !req.user.businessCategory) {
    logger.warn('Attempted action without user or businessCategory in token payload.');
    return next(boom.unauthorized('Missing authentication details.'));
  }
  const { businessCategory } = req.user;
  if (PRODUCT_SELLING_CATEGORIES.includes(businessCategory)) {
    return next();
  }
  logger.warn(`Forbidden attempt to create product by user from category: ${businessCategory}`);
  return next(boom.forbidden(`Your business category ('${businessCategory}') is not permitted to create products directly.`));
}

/**
 * Middleware to check if the product_type in the request is compatible with the
 * business's inventory strategy stored in the database.
 */
const checkProductTypeByBusinessStrategy = async (req, res, next) => {
  try {
    const { businessId } = req.user;
    const { product_type } = req.body;

    if (!product_type) {
      // Let the Joi validator handle the missing field error.
      return next();
    }

    // 1. Fetch the business from the database to get its settings
    const business = await models.businesses.findByPk(businessId, {
      attributes: ['settings'],
    });

    if (!business || !business.settings || !business.settings.inventory || !business.settings.inventory.strategy) {
      logger.warn(`Business ${businessId} has no inventory strategy defined. Allowing basic types only.`);
      if (product_type !== 'SIMPLE' && product_type !== 'SERVICE') {
        return next(boom.forbidden('Cannot create complex product types without a defined inventory strategy.'));
      }
      return next();
    }

    const { strategy } = business.settings.inventory;

    // 2. Validate product_type based on the strategy from the database
    let isAllowed = false;
    switch (strategy) {
      case 'simple':
      case 'consumables':
        isAllowed = (product_type === 'SIMPLE' || product_type === 'SERVICE');
        break;
      case 'variant':
        isAllowed = (product_type === 'VARIANT_PARENT');
        break;
      case 'recipe':
        isAllowed = (product_type === 'SIMPLE');
        break;
      default:
        isAllowed = false; // Block unknown strategies
    }

    if (isAllowed) {
      return next();
    } else {
      logger.warn(`Forbidden attempt to create product of type '${product_type}' for business ${businessId} with strategy '${strategy}'`);
      return next(boom.forbidden(`Your business strategy ('${strategy}') does not allow creating products of type '${product_type}'.`));
    }
  } catch (error) {
    logger.error('Error in checkProductTypeByBusinessStrategy middleware', { error });
    return next(boom.internal('Error validating product creation permissions.'));
  }
};

module.exports = {
  checkProductPermissions,
  checkProductTypeByBusinessStrategy,
};
