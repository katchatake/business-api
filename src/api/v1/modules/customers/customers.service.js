const boom = require('@hapi/boom');
const { sequelize, models } = require('../../../../config/database');
const logger = require('../../../../utils/logger');

class CustomerService {
  async create(data, businessId) {
    logger.info(`Creating customer for business ${businessId}`);
    const newCustomer = await models.customers.create({
      ...data,
      business_id: businessId,
    });
    return newCustomer;
  }

  async find(businessId) {
    logger.info(`Fetching all customers for business ${businessId}`);
    const customers = await models.customers.findAll({
      where: { business_id: businessId },
    });
    return customers;
  }

  async findOne(id, businessId) {
    logger.info(`Fetching customer ${id} for business ${businessId}`);
    const customer = await models.customers.findOne({
      where: { id, business_id: businessId },
    });
    if (!customer) {
      throw boom.notFound('Customer not found');
    }
    return customer;
  }

  async update(id, changes, businessId) {
    logger.info(`Updating customer ${id} for business ${businessId}`);
    const customer = await this.findOne(id, businessId);
    const updatedCustomer = await customer.update(changes);
    return updatedCustomer;
  }

  async remove(id, businessId) {
    logger.info(`Deleting customer ${id} for business ${businessId}`);
    const customer = await this.findOne(id, businessId);
    await customer.destroy();
    return { message: 'Customer deleted successfully', id };
  }
}

module.exports = CustomerService;
