const Joi = require('joi');

const name = Joi.string().max(50);
const categoryId = Joi.number().integer();
const configTemplate = Joi.object();

const createBusinessTypeSchema = Joi.object({
  name: name.required(),
  categoryId: categoryId.required(),
  configTemplate: configTemplate.required(),
  icon: Joi.string().max(50).optional(),
  description: Joi.string().max(255).optional(),
});

module.exports = {
  createBusinessTypeSchema,
};
