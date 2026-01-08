const express = require('express');
const authController = require('./auth.controller');
const { validate } = require('../../../../middlewares/validator.middleware');
const { loginSchema } = require('./auth.validator');

const router = express.Router();

router.post('/login', validate(loginSchema), authController.login);

module.exports = router;
