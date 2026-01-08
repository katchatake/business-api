const Joi = require('joi');

const id = Joi.number().integer();
const username = Joi.string().min(3).max(50);
const email = Joi.string().email();
const password = Joi.string().min(8);
const role = Joi.string().valid('OWNER', 'MANAGER', 'CASHIER', 'WAITER');
const business_id = Joi.number().integer();
const branch_id = Joi.number().integer();

const createUserSchema = Joi.object({
  username: username.required(),
  email: email.required(),
  password: password.required(),
  role: role.required(),
  business_id: business_id.required(),
  branch_id: branch_id.optional(),
});

const updateUserSchema = Joi.object({
  username: username,
  email: email,
  password: password,
  role: role,
  branch_id: branch_id,
});

const getUserSchema = Joi.object({
  id: id.required(),
});

const listUsersSchema = Joi.object({
  branchId: branch_id.optional(),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  getUserSchema,
  listUsersSchema,
};
