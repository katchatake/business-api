const boom = require('@hapi/boom');
const { models } = require('../../../../config/database');
const logger = require('../../../../utils/logger');

class ProductCategoriesService {
  async create(data, businessId) {
    logger.info(`Creating product category for business ${businessId}`);
    const newCategory = await models.product_categories.create({
      ...data,
      business_id: businessId,
    });
    return newCategory;
  }

  async findAll(businessId) {
    logger.info(`Fetching all product categories for business ${businessId}`);
    const categories = await models.product_categories.findAll({
      where: { business_id: businessId },
    });
    return categories;
  }

  async findOne(id, businessId) {
    logger.info(`Fetching product category ${id} for business ${businessId}`);
    const category = await models.product_categories.findOne({
      where: { id, business_id: businessId },
    });
    if (!category) {
      throw boom.notFound('Product category not found');
    }
    return category;
  }

  async update(id, changes, businessId) {
    logger.info(`Updating product category ${id} for business ${businessId}`);
    const category = await this.findOne(id, businessId);
    const updatedCategory = await category.update(changes);
    return updatedCategory;
  }

  async remove(id, businessId) {
    logger.info(`Deleting product category ${id} for business ${businessId}`);
    const category = await this.findOne(id, businessId);
    await category.destroy();
    return { id };
  }
}

module.exports = ProductCategoriesService;
