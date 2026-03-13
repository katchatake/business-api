const Joi = require('joi');

const id = Joi.number().integer();
const name = Joi.string().max(150);
const rfc = Joi.string().max(13);
const legalName = Joi.string().max(255);
const emailInvoice = Joi.string().email();

const createCustomerSchema = Joi.object({
  name: name.required(),
  rfc: rfc.optional().allow(null, ''),
  legalName: legalName.optional().allow(null, ''),
  emailInvoice: emailInvoice.optional().allow(null, ''),
});

const updateCustomerSchema = Joi.object({
  name: name,
  rfc: rfc.optional().allow(null, ''),
  legalName: legalName.optional().allow(null, ''),
  emailInvoice: emailInvoice.optional().allow(null, ''),
});

const getCustomerSchema = Joi.object({
  id: id.required(),
});

module.exports = {
  createCustomerSchema,
  updateCustomerSchema,
  getCustomerSchema,
};
