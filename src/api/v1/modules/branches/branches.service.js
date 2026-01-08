const { models } = require('../../../../config/database');
const logger = require('../../../../utils/logger');

/**
 * Lists all branches for a given business.
 * @param {number} businessId - The ID of the business.
 * @returns {Promise<Array>} A list of branches.
 */
const listByBusiness = async (businessId) => {
  logger.info(`Fetching all branches for business ${businessId}`);
  
  const branches = await models.branches.findAll({
    where: { business_id: businessId },
    order: [['name', 'ASC']],
  });

  return branches;
};

module.exports = {
  listByBusiness,
};
