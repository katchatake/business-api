const userService = require('./users.service');
const logger = require('../../../../utils/logger');

const list = async (req, res, next) => {
  try {
    const { businessId } = req.user;
    const { query: filters } = req;

    logger.info(`Controller: Received request to list users for business ${businessId}`);

    const users = await userService.listByBusiness(businessId, filters);
    res.status(200).json({
      message: 'Users listed successfully',
      data: users,
    });
  } catch (error) {
    logger.error(`Error listing users: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

const findOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userService.findOne(id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const body = req.body;
    const newUser = await userService.create(body);
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const updatedUser = await userService.update(id, body);
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    await userService.remove(id);
    res.status(201).json({ id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  list,
  findOne,
  create,
  update,
  remove,
};
