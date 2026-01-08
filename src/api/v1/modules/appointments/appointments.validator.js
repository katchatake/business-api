const Joi = require('joi');

const id = Joi.number().integer();
const notes = Joi.string().allow(null, '');
const startTime = Joi.date().iso();
const status = Joi.string().valid('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

// Schema for creating an appointment
const createAppointmentSchema = Joi.object({
  customerId: id.required(),
  branchId: id.required(),
  userId: id.required(), // The employee (e.g., barber)
  productId: id.required(), // The service
  startTime: startTime.required(),
  durationMinutes: Joi.number().integer().min(5).required(), // Duration to calculate end_time
  notes: notes.optional(),
});

// Schema for listing appointments (query params)
const listAppointmentsSchema = Joi.object({
  branchId: id.optional(),
  userId: id.optional(),
  customerId: id.optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  status: status.optional(),
});

module.exports = {
  createAppointmentSchema,
  listAppointmentsSchema,
};
