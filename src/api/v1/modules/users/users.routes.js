const express = require('express');
const userController = require('./users.controller');
const { validate } = require('../../../../middlewares/validator.middleware');
const { createUserSchema, updateUserSchema, getUserSchema, listUsersSchema } = require('./users.validator');
const { checkJwt, checkRoles } = require('../../../../middlewares/auth.middleware');

const router = express.Router();

// Apply JWT check to all user routes
router.use(checkJwt);

router.get(
  '/',
  checkRoles('OWNER', 'MANAGER'), // Only owners and managers can see all users
  validate(listUsersSchema, 'query'),
  userController.list
);

router.get(
  '/:id',
  validate(getUserSchema, 'params'),
  checkRoles('OWNER', 'MANAGER'), // Or a user can see their own profile (add logic later)
  userController.findOne
);

router.post(
  '/',
  validate(createUserSchema),
  checkRoles('OWNER', 'MANAGER'), // Only owners and managers can create users
  userController.create
);

router.patch(
  '/:id',
  validate(getUserSchema, 'params'),
  validate(updateUserSchema),
  checkRoles('OWNER', 'MANAGER'), // Or a user can edit their own profile
  userController.update
);

router.delete(
  '/:id',
  validate(getUserSchema, 'params'),
  checkRoles('OWNER'), // Only owners can delete users
  userController.remove
);

module.exports = router;
