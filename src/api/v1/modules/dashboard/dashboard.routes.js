const express = require('express');
const dashboardController = require('./dashboard.controller');
const authMiddleware = require('../../../../middlewares/auth.middleware');
const { getSalesSummarySchema } = require('./dashboard.validator');
const { validate } = require('../../../../middlewares/validator.middleware');

const router = express.Router();

router.get(
  '/sales-summary',
  authMiddleware.checkJwt,
  authMiddleware.checkRoles('OWNER', 'MANAGER'),
  validate(getSalesSummarySchema, 'query'),
  dashboardController.getSalesSummary
);

module.exports = router;
