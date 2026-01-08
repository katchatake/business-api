const express = require('express');
const promotionsController = require('./promotions.controller');
const { createPromotionSchema } = require('./promotions.validator');
const { validate } = require('../../../../middlewares/validator.middleware');
const { checkJwt, checkRoles } = require('../../../../middlewares/auth.middleware');

const router = express.Router();

// Define roles that can manage promotions
const PROMOTION_MANAGERS = ['OWNER', 'MANAGER'];

router.post(
  '/',
  checkJwt,
  checkRoles(...PROMOTION_MANAGERS),
  validate(createPromotionSchema, 'body'),
  promotionsController.create
);

router.get(
  '/',
  checkJwt,
  checkRoles(...PROMOTION_MANAGERS),
  promotionsController.list
);

// Other routes like PATCH /:id, GET /:id, DELETE /:id would go here

module.exports = router;
