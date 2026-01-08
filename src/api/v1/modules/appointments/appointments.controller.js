const appointmentService = require('./appointments.service');
const logger = require('../../../../utils/logger');

/**
 * Handles the request to create a new appointment.
 */
const create = async (req, res, next) => {
  try {
    const { body: appointmentData } = req;
    const { businessId } = req.user;

    logger.info(`Controller: Received request to create appointment for business ${businessId}`);

    const newAppointment = await appointmentService.create(appointmentData, businessId);

    res.status(201).json({
      message: 'Appointment created successfully',
      data: newAppointment,
    });
  } catch (error) {
    logger.error(`Error creating appointment: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

/**
 * Handles the request to list appointments.
 */
const list = async (req, res, next) => {
  try {
    const { query: filters } = req;
    const { businessId } = req.user;

    logger.info(`Controller: Received request to list appointments for business ${businessId}`);

    const appointments = await appointmentService.list(filters, businessId);

    res.status(200).json({
      message: 'Appointments listed successfully',
      data: appointments,
    });
  } catch (error) {
    logger.error(`Error listing appointments: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

module.exports = {
  create,
  list,
};
