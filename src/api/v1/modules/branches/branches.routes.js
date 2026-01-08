const express = require('express');
const branchesController = require('./branches.controller');
const { checkJwt, checkRoles } = require('../../../../middlewares/auth.middleware');

const router = express.Router();

router.get(
  '/',
  checkJwt,
  checkRoles('OWNER', 'MANAGER'), // Only admins can see the list of all branches
  branchesController.list
);

module.exports = router;
