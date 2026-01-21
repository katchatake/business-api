const Joi = require('joi');

const id = Joi.number().integer();
const name = Joi.string().max(150);
const productType = Joi.string().valid('SIMPLE', 'VARIANT_PARENT', 'SERVICE');
const price = Joi.number().precision(2);
const cost = Joi.number().precision(2);
const sku = Joi.string().max(50).allow(null, '');
const satProductCode = Joi.string().max(20);
const satUnitCode = Joi.string().max(20);
const taxObject = Joi.string().valid('01', '02', '03');

const createProductSchema = Joi.object({
  name: name.required(),
  product_type: productType.required(),
  price: price.required(),
  cost: cost.optional(),
  sku: sku.optional(),
  sat_product_code: satProductCode.optional().default('01010101'),
  sat_unit_code: satUnitCode.optional().default('H87'),
  tax_object: taxObject.optional().default('02'),
});

const updateProductSchema = Joi.object({
  name: name.optional(),
  price: price.optional(),
  cost: cost.optional(),
  sku: sku.optional(),
  sat_product_code: satProductCode.optional(),
  sat_unit_code: satUnitCode.optional(),
  tax_object: taxObject.optional(),
});

const getProductSchema = Joi.object({
  id: id.required(),
});

const listProductsSchema = Joi.object({
  branchId: id.optional(),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  getProductSchema,
  listProductsSchema,
};
