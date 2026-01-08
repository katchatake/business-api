const boom = require('@hapi/boom');
const logger = require('../utils/logger');

function logError(err, req, res, next) {
  logger.error(err);
  next(err);
}

function wrapError(err, req, res, next) {
  if (!err.isBoom) {
    next(boom.internal(err));
  }
  next(err);
}

function errorHandler(err, req, res, next) {
  const { output: { statusCode, payload } } = err;
  res.status(statusCode).json(payload);
}

module.exports = {
  logError,
  wrapError,
  errorHandler,
};
