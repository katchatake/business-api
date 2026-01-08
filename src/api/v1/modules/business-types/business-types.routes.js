const express = require('express');
const businessTypesController = require('./business-types.controller');
const { createBusinessTypeSchema } = require('./business-types.validator');
const { validate } = require('../../../../middlewares/validator.middleware');
const { checkJwt, checkRoles } = require('../../../../middlewares/auth.middleware');

const router = express.Router();

router.post(
  '/',
  checkJwt,
  checkRoles('OWNER'), // Only owners can create new business types
  validate(createBusinessTypeSchema, 'body'),
  businessTypesController.create
);

module.exports = router;
