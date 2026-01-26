const express = require('express');
const SuppliersService = require('./suppliers.service');
const {
  createSupplierSchema,
  updateSupplierSchema,
  getSupplierSchema,
} = require('./suppliers.validator');
const { validate } = require('../../../../middlewares/validator.middleware');
const { checkJwt } = require('../../../../middlewares/auth.middleware');

const router = express.Router();
const service = new SuppliersService();

router.get('/',
  checkJwt,
  async (req, res, next) => {
    try {
      const { businessId } = req.user;
      const suppliers = await service.findAll(businessId);
      res.json({ data: suppliers });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id',
  checkJwt,
  validate(getSupplierSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { businessId } = req.user;
      const supplier = await service.findOne(id, businessId);
      res.json(supplier);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  checkJwt,
  validate(createSupplierSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const { businessId } = req.user;
      const newSupplier = await service.create(body, businessId);
      res.status(201).json(newSupplier);
    } catch (error) {
      next(error);
    }
  }
);

router.patch('/:id',
  checkJwt,
  validate(getSupplierSchema, 'params'),
  validate(updateSupplierSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const { businessId } = req.user;
      const updatedSupplier = await service.update(id, body, businessId);
      res.json(updatedSupplier);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  checkJwt,
  validate(getSupplierSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { businessId } = req.user;
      await service.remove(id, businessId);
      res.status(201).json({ id });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
