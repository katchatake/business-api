const boom = require('@hapi/boom');
const { models } = require('../../../../config/database');
const logger = require('../../../../utils/logger');

class SuppliersService {
  async create(data, businessId) {
    logger.info(`Creating supplier for business ${businessId}`);
    const newSupplier = await models.suppliers.create({
      ...data,
      business_id: businessId,
    });
    return newSupplier;
  }

  async findAll(businessId) {
    logger.info(`Fetching all suppliers for business ${businessId}`);
    const suppliers = await models.suppliers.findAll({
      where: { business_id: businessId },
    });
    return suppliers;
  }

  async findOne(id, businessId) {
    logger.info(`Fetching supplier ${id} for business ${businessId}`);
    const supplier = await models.suppliers.findOne({
      where: { id, business_id: businessId },
    });
    if (!supplier) {
      throw boom.notFound('Supplier not found');
    }
    return supplier;
  }

  async update(id, changes, businessId) {
    logger.info(`Updating supplier ${id} for business ${businessId}`);
    const supplier = await this.findOne(id, businessId);
    const updatedSupplier = await supplier.update(changes);
    return updatedSupplier;
  }

  async remove(id, businessId) {
    logger.info(`Deleting supplier ${id} for business ${businessId}`);
    const supplier = await this.findOne(id, businessId);
    await supplier.destroy();
    return { id };
  }
}

module.exports = SuppliersService;
