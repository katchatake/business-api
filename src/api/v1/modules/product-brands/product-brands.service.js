const boom = require('@hapi/boom');
const { models } = require('../../../../config/database');
const logger = require('../../../../utils/logger');

class ProductBrandsService {
  async create(data, businessId) {
    logger.info(`Creating product brand for business ${businessId}`);
    const newBrand = await models.product_brands.create({
      ...data,
      business_id: businessId,
    });
    return newBrand;
  }

  async findAll(businessId) {
    logger.info(`Fetching all product brands for business ${businessId}`);
    const brands = await models.product_brands.findAll({
      where: { business_id: businessId },
    });
    return brands;
  }

  async findOne(id, businessId) {
    logger.info(`Fetching product brand ${id} for business ${businessId}`);
    const brand = await models.product_brands.findOne({
      where: { id, business_id: businessId },
    });
    if (!brand) {
      throw boom.notFound('Product brand not found');
    }
    return brand;
  }

  async update(id, changes, businessId) {
    logger.info(`Updating product brand ${id} for business ${businessId}`);
    const brand = await this.findOne(id, businessId);
    const updatedBrand = await brand.update(changes);
    return updatedBrand;
  }

  async remove(id, businessId) {
    logger.info(`Deleting product brand ${id} for business ${businessId}`);
    const brand = await this.findOne(id, businessId);
    await brand.destroy();
    return { id };
  }
}

module.exports = ProductBrandsService;
