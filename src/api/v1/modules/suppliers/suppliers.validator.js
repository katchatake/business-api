const Joi = require('joi');

const id = Joi.number().integer();
const name = Joi.string().max(150);
const contactPerson = Joi.string().max(150).allow(null, '');
const phone = Joi.string().max(50).allow(null, '');
const email = Joi.string().email().allow(null, '');
const address = Joi.string().allow(null, '');

const createSupplierSchema = Joi.object({
  name: name.required(),
  contact_person: contactPerson.optional(),
  phone: phone.optional(),
  email: email.optional(),
  address: address.optional(),
});

const updateSupplierSchema = Joi.object({
  name: name.optional(),
  contact_person: contactPerson.optional(),
  phone: phone.optional(),
  email: email.optional(),
  address: address.optional(),
});

const getSupplierSchema = Joi.object({
  id: id.required(),
});

module.exports = {
  createSupplierSchema,
  updateSupplierSchema,
  getSupplierSchema,
};
