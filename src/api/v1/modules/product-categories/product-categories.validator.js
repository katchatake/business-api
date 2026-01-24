const Joi = require('joi');

const id = Joi.number().integer();
const name = Joi.string().max(100);
const description = Joi.string().allow(null, '');

const createCategorySchema = Joi.object({
  name: name.required(),
  description: description.optional(),
});

const updateCategorySchema = Joi.object({
  name: name.optional(),
  description: description.optional(),
});

const getCategorySchema = Joi.object({
  id: id.required(),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  getCategorySchema,
};
