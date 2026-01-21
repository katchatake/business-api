const Joi = require('joi');

const configTemplateSchema = Joi.object({
  modules: Joi.object().required(),
  ui: Joi.object().required(),
  business_rules: Joi.object().optional()
});

const createBusinessTypeSchema = Joi.object({
  name: Joi.string().max(50).required(),
  categoryId: Joi.number().integer().required(),
  icon: Joi.string().max(50).optional(),
  description: Joi.string().max(255).optional(),
  configTemplate: configTemplateSchema.required()
});

const getBusinessTypeSchema = Joi.object({
  id: Joi.number().integer().required()
});

module.exports = {
  createBusinessTypeSchema,
  getBusinessTypeSchema
};
