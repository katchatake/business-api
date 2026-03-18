const Joi = require('joi');

const id = Joi.number().integer();

const getSalesSummarySchema = Joi.object({
  branchId: id.optional(),
});

const getSalesByRangesSchema = Joi.object({
  branchId: id.optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
});

module.exports = {
  getSalesSummarySchema,
  getSalesByRangesSchema,
};
