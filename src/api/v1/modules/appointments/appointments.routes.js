const express = require('express');
const appointmentsController = require('./appointments.controller');
const { createAppointmentSchema, listAppointmentsSchema } = require('./appointments.validator');
const { validate } = require('../../../../middlewares/validator.middleware');
const { checkJwt, checkRoles } = require('../../../../middlewares/auth.middleware');

const router = express.Router();

// Define roles that can manage appointments
const APPOINTMENT_MANAGERS = ['OWNER', 'MANAGER', 'CASHIER'];

router.post(
  '/',
  checkJwt,
  checkRoles(...APPOINTMENT_MANAGERS),
  validate(createAppointmentSchema, 'body'),
  appointmentsController.create
);

router.get(
  '/',
  checkJwt,
  // All authenticated users of the business can view appointments
  checkRoles(...APPOINTMENT_MANAGERS, 'WAITER'), // Add any other relevant roles
  validate(listAppointmentsSchema, 'query'),
  appointmentsController.list
);

module.exports = router;
