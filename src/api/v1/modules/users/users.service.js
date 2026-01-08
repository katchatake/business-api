const bcrypt = require('bcryptjs');
const boom = require('@hapi/boom');
const { models } = require('../../../../config/database');
const logger = require('../../../../utils/logger');

/**
 * Lists all users for a given business, with optional filters.
 * @param {number} businessId - The ID of the business.
 * @param {object} filters - Optional filters like branchId.
 * @returns {Promise<Array>} A list of users.
 */
const listByBusiness = async (businessId, filters = {}) => {
  const { branchId } = filters;
  const where = { business_id: businessId };

  if (branchId) {
    where.branch_id = branchId;
  }

  logger.info(`Fetching users for business ${businessId}`, { filters });

  const users = await models.users.findAll({
    where,
    attributes: { exclude: ['password_hash'] },
    include: [
      {
        model: models.branches,
        as: 'branch',
        attributes: ['id', 'name'],
      },
    ],
    order: [['username', 'ASC']],
  });

  return users;
};


/**
 * Get a single user by ID.
 * @param {number} id
 */
const findOne = async (id) => {
  const user = await models.users.findByPk(id, {
    attributes: { exclude: ['password_hash'] },
  });
  if (!user) {
    throw boom.notFound('User not found');
  }
  return user;
};

/**
 * Create a new user.
 * @param {object} data
 */
const create = async (data) => {
  const { password, ...userData } = data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await models.users.create({
    ...userData,
    password_hash: hashedPassword,
  });

  // Don't return the password hash
  delete newUser.dataValues.password_hash;
  return newUser;
};

/**
 * Update a user.
 * @param {number} id
 * @param {object} changes
 */
const update = async (id, changes) => {
  const user = await findOne(id); // Reuse findOne to check if user exists

  if (changes.password) {
    changes.password_hash = await bcrypt.hash(changes.password, 10);
    delete changes.password;
  }

  const updatedUser = await user.update(changes);

  delete updatedUser.dataValues.password_hash;
  return updatedUser;
};

/**
 * Delete a user.
 * @param {number} id
 */
const remove = async (id) => {
  const user = await findOne(id); // Reuse findOne to check if user exists
  await user.destroy();
  return { id };
};

module.exports = {
  listByBusiness,
  findOne,
  create,
  update,
  remove,
};
