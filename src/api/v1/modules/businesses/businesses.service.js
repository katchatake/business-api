const boom = require('@hapi/boom');
const bcrypt = require('bcryptjs');
const { sequelize, models } = require('../../../../config/database');
const logger = require('../../../../utils/logger');

/**
 * Registers a new business, its first branch, and its owner user.
 * This operation is transactional.
 * @param {object} data - The registration data.
 * @returns {Promise<object>} The newly created business and user.
 */
const register = async (data) => {
  const { businessName, businessTypeId, saas_plan_id, branchName, owner, fiscal } = data;

  const t = await sequelize.transaction();

  try {
    // 1. Find the business type to get the config template
    const businessType = await models.business_types.findByPk(businessTypeId, { transaction: t });
    if (!businessType) {
      throw boom.badRequest('The specified business type does not exist.');
    }

    // Calculate subscription end date (15 days from now)
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 15);

    // 2. Create the business
    const newBusiness = await models.businesses.create({
      name: businessName,
      business_type_id: businessTypeId,
      settings: businessType.config_template, // Inherit settings from template
      rfc: fiscal?.rfc,
      legal_name: fiscal?.legalName,
      tax_system_code: fiscal?.taxSystemCode,
      postal_code: fiscal?.postalCode,
      saas_plan_id: saas_plan_id,
      status: 'TRIAL',
      subscription_end_date: subscriptionEndDate,
    }, { transaction: t });

    // 3. Create the first branch
    const newBranch = await models.branches.create({
      name: branchName,
      business_id: newBusiness.id,
    }, { transaction: t });

    // 4. Hash password and create the owner user
    const hashedPassword = await bcrypt.hash(owner.password, 10);
    const newUser = await models.users.create({
      username: owner.username,
      email: owner.email,
      password_hash: hashedPassword,
      role: 'OWNER',
      business_id: newBusiness.id,
      branch_id: newBranch.id,
    }, { transaction: t });

    // If everything is successful, commit the transaction
    await t.commit();

    logger.info(`New business "${newBusiness.name}" (ID: ${newBusiness.id}) registered successfully.`);

    // Return a clean object, excluding the password hash
    const { password_hash, ...userWithoutPassword } = newUser.get({ plain: true });

    return {
      business: newBusiness.get({ plain: true }),
      user: userWithoutPassword,
    };

  } catch (error) {
    // If any step fails, roll back the transaction
    await t.rollback();
    logger.error(`Business registration failed: ${error.message}`, { stack: error.stack });
    // Re-throw the original error or a generic one
    if (boom.isBoom(error)) {
      throw error;
    }
    throw boom.internal('Failed to register business.', error);
  }
};

/**
 * Updates an existing business.
 * @param {number} businessId - The ID of the business to update.
 * @param {object} updateData - The data to update the business with.
 * @returns {Promise<object>} The updated business.
 */
const updateBusiness = async (businessId, updateData) => {
  try {
    const business = await models.businesses.findByPk(businessId);

    if (!business) {
      return null; // Or throw a boom.notFound error, depending on desired error handling
    }

    // Update the business with the provided data
    await business.update(updateData);

    logger.info(`Business with ID: ${businessId} updated successfully.`);

    return business.get({ plain: true });
  } catch (error) {
    logger.error(`Error updating business with ID ${businessId}: ${error.message}`, { stack: error.stack });
    if (boom.isBoom(error)) {
      throw error;
    }
    throw boom.internal('Failed to update business.', error);
  }
};

module.exports = {
  register,
  updateBusiness, // Export the new updateBusiness method
};
