const Joi = require('joi');

const id = Joi.number().integer();
const amount = Joi.number().precision(2).min(0.01);

const orderItemSchema = Joi.object({
  productId: id.required(),
  quantity: Joi.number().min(0.0001).required(),
  variantId: id.optional(),
  attributes: Joi.object().optional(), // For modifiers
});

const paymentSchema = Joi.object({
  payment_method: Joi.string().valid('CASH', 'CARD', 'TRANSFER', 'CREDIT_STORE').required(),
  amount: amount.required(),
});

const createOrderSchema = Joi.object({
  branchId: id.required(),
  customerId: id.optional().allow(null),
  orderType: Joi.string().valid('INSTORE', 'TAKEAWAY', 'DINE_IN').required(),
  items: Joi.array().items(orderItemSchema).min(1).required(),
  payments: Joi.array().items(paymentSchema).min(1).optional(), // New: Payments array
  metadata: Joi.object().optional(),
});

const listOrdersSchema = Joi.object({
  branchId: id.optional(),
  customerId: id.optional(),
  status: Joi.string().valid('PENDING', 'COMPLETED', 'CANCELLED').optional(),
  orderType: Joi.string().valid('INSTORE', 'TAKEAWAY', 'DINE_IN').optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  // Add pagination if needed
  // limit: Joi.number().integer().min(1).default(10),
  // offset: Joi.number().integer().min(0).default(0),
});

module.exports = {
  createOrderSchema,
  listOrdersSchema,
};
