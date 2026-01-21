const express = require('express');
const businessTypesController = require('./business-types.controller');
const { createBusinessTypeSchema, getBusinessTypeSchema } = require('./business-types.validator');
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

// GET /api/v1/business-types - List all available business types
router.get(
  '/',
  businessTypesController.getAll
);

// GET /api/v1/business-types/:id - Get a single business type by ID
router.get(
  '/:id',
  validate(getBusinessTypeSchema, 'params'),
  businessTypesController.getById
);


module.exports = router;
