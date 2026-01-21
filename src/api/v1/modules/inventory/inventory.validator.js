const Joi = require('joi');

const productId = Joi.number().integer().required();
const branchId = Joi.number().integer().required();
const adjustment = Joi.number().precision(4).required();
const reason = Joi.string().max(255).optional();

const updateProductInventorySchema = Joi.object({
  adjustment: adjustment,
  reason: reason,
});

const getProductInventoryParamsSchema = Joi.object({
  productId: productId,
  branchId: branchId,
});

module.exports = {
  updateProductInventorySchema,
  getProductInventoryParamsSchema,
};
