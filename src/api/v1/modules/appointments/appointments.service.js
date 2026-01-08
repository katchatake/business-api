const boom = require('@hapi/boom');
const { Op } = require('sequelize');
const { models, sequelize } = require('../../../../config/database');
const logger = require('../../../../utils/logger');

/**
 * Creates a new appointment after performing validation and conflict checks.
 * @param {object} data - The appointment data.
 * @param {number} businessId - The ID of the business from the user's token.
 * @returns {Promise<object>} The newly created appointment.
 */
const create = async (data, businessId) => {
  const { customerId, branchId, userId, productId, startTime, durationMinutes, notes } = data;

  // Calculate end time
  const startDate = new Date(startTime);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

  // Use a transaction to ensure atomicity
  const t = await sequelize.transaction();
  try {
    // --- Security and Existence Checks ---
    const entitiesToVerify = [
      models.customers.findOne({ where: { id: customerId, business_id: businessId } }),
      models.branches.findOne({ where: { id: branchId, business_id: businessId } }),
      models.users.findOne({ where: { id: userId, business_id: businessId } }),
      models.products.findOne({ where: { id: productId, business_id: businessId, product_type: 'SERVICE' } }),
    ];
    const [customer, branch, user, product] = await Promise.all(entitiesToVerify);

    if (!customer) throw boom.badRequest('Invalid customer.');
    if (!branch) throw boom.badRequest('Invalid branch.');
    if (!user) throw boom.badRequest('Invalid user (employee).');
    if (!product) throw boom.badRequest('Invalid product (service).');

    // --- Conflict Detection ---
    const conflictingAppointment = await models.appointments.findOne({
      where: {
        user_id: userId,
        status: { [Op.ne]: 'CANCELLED' }, // Don't check against cancelled appointments
        [Op.or]: [
          { start_time: { [Op.lt]: endDate, [Op.gte]: startDate } }, // Starts during new appt
          { end_time: { [Op.gt]: startDate, [Op.lte]: endDate } }, // Ends during new appt
          { start_time: { [Op.lte]: startDate }, end_time: { [Op.gte]: endDate } }, // Spans over new appt
        ],
      },
      transaction: t,
    });

    if (conflictingAppointment) {
      throw boom.conflict(`The employee is already booked at this time (conflicts with appointment ${conflictingAppointment.id}).`);
    }

    // --- Create Appointment ---
    const newAppointment = await models.appointments.create({
      business_id: businessId,
      branch_id: branchId,
      customer_id: customerId,
      user_id: userId,
      product_id: productId,
      start_time: startDate,
      end_time: endDate,
      notes: notes,
    }, { transaction: t });

    await t.commit();
    logger.info(`Appointment ${newAppointment.id} created successfully for business ${businessId}.`);
    return newAppointment;

  } catch (error) {
    await t.rollback();
    logger.error(`Appointment creation failed: ${error.message}`, { stack: error.stack });
    if (boom.isBoom(error)) throw error;
    throw boom.internal('Failed to create appointment.', error);
  }
};

/**
 * Lists appointments for a business based on filters.
 * @param {object} filters - Query filters (branchId, userId, etc.).
 * @param {number} businessId - The ID of the business from the user's token.
 * @returns {Promise<Array>} A list of appointments.
 */
const list = async (filters, businessId) => {
  const { branchId, userId, customerId, startDate, endDate, status } = filters;
  const where = { business_id: businessId };

  if (branchId) where.branch_id = branchId;
  if (userId) where.user_id = userId;
  if (customerId) where.customer_id = customerId;
  if (status) where.status = status;
  if (startDate && endDate) {
    where.start_time = { [Op.between]: [new Date(startDate), new Date(endDate)] };
  } else if (startDate) {
    where.start_time = { [Op.gte]: new Date(startDate) };
  }

  const appointments = await models.appointments.findAll({
    where,
    include: [
      { model: models.customers, as: 'customer', attributes: ['id', 'name'] },
      { model: models.users, as: 'user', attributes: ['id', 'username'] },
      { model: models.products, as: 'product', attributes: ['id', 'name'] },
      { model: models.branches, as: 'branch', attributes: ['id', 'name'] },
    ],
    order: [['start_time', 'ASC']],
  });

  return appointments;
};

module.exports = {
  create,
  list,
};
