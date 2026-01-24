const express = require('express');
const ProductCategoriesService = require('./product-categories.service');
const {
  createCategorySchema,
  updateCategorySchema,
  getCategorySchema,
} = require('./product-categories.validator');
const { validate } = require('../../../../middlewares/validator.middleware');
const { checkJwt } = require('../../../../middlewares/auth.middleware');
// const { checkRoles } = require('../../../../middlewares/roles.middleware'); // TODO: Implement roles middleware if needed

const router = express.Router();
const service = new ProductCategoriesService();

router.get('/',
  checkJwt,
  // checkRoles('OWNER', 'MANAGER', 'CASHIER'),
  async (req, res, next) => {
    try {
      const { business_id } = req.user;
      const categories = await service.findAll(business_id);
      res.json(categories);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id',
  checkJwt,
  // checkRoles('OWNER', 'MANAGER', 'CASHIER'),
  validate(getCategorySchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { business_id } = req.user;
      const category = await service.findOne(id, business_id);
      res.json(category);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  checkJwt,
  // checkRoles('OWNER', 'MANAGER'),
  validate(createCategorySchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const { business_id } = req.user;
      const newCategory = await service.create(body, business_id);
      res.status(201).json(newCategory);
    } catch (error) {
      next(error);
    }
  }
);

router.patch('/:id',
  checkJwt,
  // checkRoles('OWNER', 'MANAGER'),
  validate(getCategorySchema, 'params'),
  validate(updateCategorySchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const { business_id } = req.user;
      const updatedCategory = await service.update(id, body, business_id);
      res.json(updatedCategory);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  checkJwt,
  // checkRoles('OWNER', 'MANAGER'),
  validate(getCategorySchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { business_id } = req.user;
      await service.remove(id, business_id);
      res.status(201).json({ id });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
