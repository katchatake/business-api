const express = require('express');
const authController = require('./auth.controller');
const { validate } = require('../../../../middlewares/validator.middleware');
const { loginSchema, refreshSchema } = require('./auth.validator');

const router = express.Router();

router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);

module.exports = router;
