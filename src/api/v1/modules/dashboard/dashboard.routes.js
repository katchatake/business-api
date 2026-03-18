const express = require('express');
const dashboardController = require('./dashboard.controller');
const authMiddleware = require('../../../../middlewares/auth.middleware');
const {
  getSalesSummarySchema,
  getSalesByRangesSchema,
} = require('./dashboard.validator');
const { validate } = require('../../../../middlewares/validator.middleware');

const router = express.Router();

router.get(
  '/sales-summary',
  authMiddleware.checkJwt,
  authMiddleware.checkRoles('OWNER', 'MANAGER'),
  validate(getSalesSummarySchema, 'query'),
  dashboardController.getSalesSummary
);

router.get(
  '/sales-by-ranges',
  authMiddleware.checkJwt,
  authMiddleware.checkRoles('OWNER', 'MANAGER'),
  validate(getSalesByRangesSchema, 'query'),
  dashboardController.getSalesByRanges
);

module.exports = router;
