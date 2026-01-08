const Joi = require('joi');

const id = Joi.number().integer();

const orderItemSchema = Joi.object({
  productId: id.required(),
  quantity: Joi.number().min(0.0001).required(),
  variantId: id.optional(),
  attributes: Joi.object().optional(), // For modifiers
});

const createOrderSchema = Joi.object({
  branchId: id.required(),
  customerId: id.optional().allow(null),
  orderType: Joi.string().valid('INSTORE', 'TAKEAWAY', 'DINE_IN').required(),
  items: Joi.array().items(orderItemSchema).min(1).required(),
  metadata: Joi.object().optional(),
});

module.exports = {
  createOrderSchema,
};
