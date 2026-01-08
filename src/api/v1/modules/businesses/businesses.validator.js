const Joi = require('joi');

// Schema for the owner user
const ownerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

// Schema for the main registration payload
const registerBusinessSchema = Joi.object({
  businessName: Joi.string().max(100).required(),
  businessTypeId: Joi.number().integer().required(),
  saas_plan_id: Joi.number().integer().required(),
  branchName: Joi.string().max(100).required(),
  owner: ownerSchema.required(),
  fiscal: Joi.object({
    rfc: Joi.string().max(13).allow(null, ''),
    legalName: Joi.string().max(255).allow(null, ''),
    taxSystemCode: Joi.string().max(10).allow(null, ''),
    postalCode: Joi.string().max(10).allow(null, ''),
  }).optional(),
});

// Schema for updating a business
const updateBusinessSchema = Joi.object({
  businessId: Joi.number().integer().required(), // Assuming businessId is passed in params or body for update
  name: Joi.string().max(100).optional(),
  businessTypeId: Joi.number().integer().optional(),
  settings: Joi.object().optional(), // Assuming settings can be updated as a JSON object
  rfc: Joi.string().max(13).allow(null, '').optional(),
  legalName: Joi.string().max(255).allow(null, '').optional(),
  taxSystemCode: Joi.string().max(10).allow(null, '').optional(),
  postalCode: Joi.string().max(10).allow(null, '').optional(),
  saas_plan_id: Joi.number().integer().optional(),
  status: Joi.string().valid('ACTIVE', 'SUSPENDED_PAYMENT', 'BANNED', 'TRIAL').optional(),
  subscription_end_date: Joi.date().iso().optional(), // ISO 8601 date format
});

module.exports = {
  registerBusinessSchema,
  updateBusinessSchema,
};
