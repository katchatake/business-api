const Joi = require('joi');

const id = Joi.number().integer();
const name = Joi.string().max(100);

const createBrandSchema = Joi.object({
  name: name.required(),
});

const updateBrandSchema = Joi.object({
  name: name.optional(),
});

const getBrandSchema = Joi.object({
  id: id.required(),
});

module.exports = {
  createBrandSchema,
  updateBrandSchema,
  getBrandSchema,
};
