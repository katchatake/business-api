const { models } = require('../../../../config/database');
const logger = require('../../../../utils/logger');

/**
 * Finds a user by their username.
 * @param {string} username - The username to search for.
 * @returns {Promise<User|null>} - The Sequelize user object or null if not found.
 */
const findUserByUsername = async (username) => {
  try {
    const user = await models.users.findOne({ where: { username } });
    return user;
  } catch (error) {
    logger.error('Error in findUserByUsername DAO:', error);
    // Re-throw the error to be handled by the service layer
    throw error;
  }
};

module.exports = {
  findUserByUsername,
};