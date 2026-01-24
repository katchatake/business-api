const express = require('express');
const ProductBrandsService = require('./product-brands.service');
const {
  createBrandSchema,
  updateBrandSchema,
  getBrandSchema,
} = require('./product-brands.validator');
const { validate } = require('../../../../middlewares/validator.middleware');
const { checkJwt } = require('../../../../middlewares/auth.middleware');

const router = express.Router();
const service = new ProductBrandsService();

router.get('/',
  checkJwt,
  async (req, res, next) => {
    try {
      const { business_id } = req.user;
      const brands = await service.findAll(business_id);
      res.json(brands);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id',
  checkJwt,
  validate(getBrandSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { business_id } = req.user;
      const brand = await service.findOne(id, business_id);
      res.json(brand);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  checkJwt,
  validate(createBrandSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const { business_id } = req.user;
      const newBrand = await service.create(body, business_id);
      res.status(201).json(newBrand);
    } catch (error) {
      next(error);
    }
  }
);

router.patch('/:id',
  checkJwt,
  validate(getBrandSchema, 'params'),
  validate(updateBrandSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const { business_id } = req.user;
      const updatedBrand = await service.update(id, body, business_id);
      res.json(updatedBrand);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  checkJwt,
  validate(getBrandSchema, 'params'),
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
