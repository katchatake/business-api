const Joi = require('joi');

const id = Joi.number().integer();
const name = Joi.string().max(100);
const type = Joi.string().valid('PERCENTAGE_ITEM', 'FIXED_ITEM', 'BOGO');
const value = Joi.number().precision(2);
const date = Joi.date().iso();
const isActive = Joi.boolean();

const createPromotionSchema = Joi.object({
  name: name.required(),
  description: Joi.string().optional().allow(null, ''),
  type: type.required(),
  value: value.required(),
  start_date: date.optional().allow(null),
  end_date: date.optional().allow(null),
  is_active: isActive.optional().default(true),
  productIds: Joi.array().items(id).min(1).required(), // Array of product IDs to associate
});

const updatePromotionSchema = Joi.object({
  name: name.optional(),
  description: Joi.string().optional().allow(null, ''),
  type: type.optional(),
  value: value.optional(),
  start_date: date.optional().allow(null),
  end_date: date.optional().allow(null),
  is_active: isActive.optional(),
  productIds: Joi.array().items(id).min(1).optional(),
});

const getPromotionSchema = Joi.object({
  id: id.required(),
});

module.exports = {
  createPromotionSchema,
  updatePromotionSchema,
  getPromotionSchema,
};
