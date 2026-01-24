const SuppliersService = require('./suppliers.service');
const service = new SuppliersService();

const listSuppliers = async (req, res, next) => {
  try {
    const { business_id } = req.user;
    const suppliers = await service.findAll(business_id);
    res.json(suppliers);
  } catch (error) {
    next(error);
  }
};

const getSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { business_id } = req.user;
    const supplier = await service.findOne(id, business_id);
    res.json(supplier);
  } catch (error) {
    next(error);
  }
};

const createSupplier = async (req, res, next) => {
  try {
    const body = req.body;
    const { business_id } = req.user;
    const newSupplier = await service.create(body, business_id);
    res.status(201).json(newSupplier);
  } catch (error) {
    next(error);
  }
};

const updateSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const { business_id } = req.user;
    const updatedSupplier = await service.update(id, body, business_id);
    res.json(updatedSupplier);
  } catch (error) {
    next(error);
  }
};

const deleteSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { business_id } = req.user;
    await service.remove(id, business_id);
    res.status(201).json({ id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
