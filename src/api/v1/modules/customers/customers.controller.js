const CustomerService = require('./customers.service');
const service = new CustomerService();

const listCustomers = async (req, res, next) => {
  try {
    const { businessId } = req.user;
    const customers = await service.find(businessId);
    res.json(customers);
  } catch (error) {
    next(error);
  }
};

const getCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { businessId } = req.user;
    const customer = await service.findOne(id, businessId);
    res.json(customer);
  } catch (error) {
    next(error);
  }
};

const createCustomer = async (req, res, next) => {
  try {
    const body = req.body;
    const { businessId } = req.user;
    const newCustomer = await service.create(body, businessId);
    res.status(201).json({
      message: 'Customer created successfully',
      data: newCustomer,
    });
  } catch (error) {
    next(error);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const { businessId } = req.user;
    const updatedCustomer = await service.update(id, body, businessId);
    res.json({
      message: 'Customer updated successfully',
      data: updatedCustomer,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { businessId } = req.user;
    const result = await service.remove(id, businessId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
