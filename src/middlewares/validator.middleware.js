const Joi = require('joi');
const boom = require('@hapi/boom');
const logger = require('../utils/logger');

const validate = (schema, property = 'body') => (req, res, next) => {
  const data = req[property];
  const { error } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    logger.warn(`Validation error in ${property}: ${error.details.map(d => d.message).join(', ')}`);
    next(boom.badRequest(error));
  } else {
    next();
  }
};

module.exports = { validate };

