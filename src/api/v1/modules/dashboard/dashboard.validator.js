const Joi = require('joi');

const branchId = Joi.number().integer();

const getSalesSummarySchema = Joi.object({
  branchId: branchId.optional(),
});

module.exports = {
  getSalesSummarySchema,
};
