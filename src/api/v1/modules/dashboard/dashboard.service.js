const { models, sequelize } = require('../../../../config/database');
const { Op } = require('sequelize');
const boom = require('@hapi/boom');
const logger = require('../../../../utils/logger');

/**
 * Calculates the total sales for a given date range.
 * @param {number} businessId - The ID of the business.
 * @param {number} branchId - The ID of the branch.
 * @param {Date} startDate - The start of the date range.
 * @param {Date} endDate - The end of the date range.
 * @returns {Promise<number>} The total sales amount.
 */
const calculateTotalSales = async (businessId, branchId, startDate, endDate) => {
  const totalSales = await models.orders.sum('subtotal', {
    where: {
      business_id: businessId,
      branch_id: branchId,
      status: 'COMPLETED',
      created_date: {
        [Op.between]: [startDate, endDate],
      },
    },
  });
  return totalSales || 0;
};

/**
 * Gets the sales summary for today and the previous day.
 * @param {number} businessId - The ID of the business.
 * @param {number} userBranchId - The branch ID from the user's session.
 * @param {number} queryBranchId - The branch ID from the query parameters.
 * @returns {Promise<object>} An object with sales data and comparison.
 */
const getSalesSummary = async (businessId, userBranchId, queryBranchId) => {
  const targetBranchId = queryBranchId || userBranchId;

  if (!targetBranchId) {
    throw boom.badRequest('A branch ID must be provided either in your user session or as a query parameter.');
  }

  // Security check: ensure the target branch belongs to the user's business
  const branch = await models.branches.findOne({
    where: { id: targetBranchId, business_id: businessId },
  });

  if (!branch) {
    throw boom.forbidden('You do not have access to this branch.');
  }

  logger.info(`Fetching sales summary for business ${businessId} and branch ${targetBranchId}`);

  // Define date ranges
  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0));
  const todayEnd = new Date(today.setHours(23, 59, 59, 999));

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStart = new Date(yesterday.setHours(0, 0, 0, 0));
  const yesterdayEnd = new Date(yesterday.setHours(23, 59, 59, 999));

  // Calculate sales in parallel
  const [todaySales, previousDaySales] = await Promise.all([
    calculateTotalSales(businessId, targetBranchId, todayStart, todayEnd),
    calculateTotalSales(businessId, targetBranchId, yesterdayStart, yesterdayEnd),
  ]);

  // Calculate percentage change
  let percentageChange = 0;
  if (previousDaySales > 0) {
    percentageChange = ((todaySales - previousDaySales) / previousDaySales) * 100;
  } else if (todaySales > 0) {
    percentageChange = 100; // If yesterday was 0 and today is > 0, it's a 100% increase from nothing.
  }

  let trend = 'same';
  if (percentageChange > 0) {
    trend = 'up';
  } else if (percentageChange < 0) {
    trend = 'down';
  }

  return {
    todaySales: parseFloat(todaySales.toFixed(2)),
    previousDaySales: parseFloat(previousDaySales.toFixed(2)),
    percentageChange: parseFloat(percentageChange.toFixed(2)),
    trend,
    branch: {
      id: branch.id,
      name: branch.name,
    },
  };
};

module.exports = {
  getSalesSummary,
};
