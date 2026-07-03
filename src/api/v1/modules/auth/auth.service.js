const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { models } = require('../../../../config/database');
const logger = require('../../../../utils/logger');
require('dotenv').config();
const boom = require('@hapi/boom'); // Import boom for error handling

const login = async (req) => {
  const { username, password } = req.body;
  logger.info(`Attempting login for user: ${username}`);

  // 1. Find user and include related business, type, category, and branch data
  const user = await models.users.findOne({
    where: { username },
    include: [
      {
        model: models.businesses,
        as: 'business',
        include: {
          model: models.business_types,
          as: 'business_type',
          include: {
            model: models.business_categories,
            as: 'category', // Correct alias
          },
        },
      },
      {
        model: models.branches,
        as: 'branch',
      },
    ],
  });

  if (!user || !user.business || !user.business.business_type || !user.business.business_type.category) {
    throw boom.unauthorized('Invalid credentials or incomplete business data'); // Use boom for consistency
  }

  // --- NEW: Check business status ---
  if (user.business.status === 'SUSPENDED_PAYMENT') {
    throw boom.forbidden('Your business account is suspended due to payment issues. Please contact support.');
  }
  if (user.business.status === 'BANNED') {
    throw boom.forbidden('Your business account has been banned. Please contact support.');
  }
  // --- END NEW ---

  // 2. Compare password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw boom.unauthorized('Invalid credentials'); // Use boom for consistency
  }

  // 3. Generate Tokens with enriched payload
  const payload = {
    userId: user.id,
    sub: user.id,
    role: user.role,
    branchId: user.branch_id,
    businessId: user.business.id,
    businessSettings: user.business.settings,
    businessType: user.business.business_type.name,
    businessCategory: user.business.business_type.category.name,
    businessStatus: user.business.status, // Include business status in payload
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ sub: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });

  // 4. Save User Session
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 1); // Assuming 7d expiry

  await models.user_sessions.create({
    user_id: user.id,
    refresh_token_hash: refreshTokenHash,
    ip_address: req.ip,
    user_agent: req.get('user-agent'),
    expires_at: expiresAt,
  });

  logger.info(`User ${username} logged in successfully`);

  // 5. Return enriched user data and tokens
  return {
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      branch: user.branch ? {
        id: user.branch.id,
        name: user.branch.name,
      } : null,
      business: {
        id: user.business.id,
        name: user.business.name,
        settings: user.business.settings,
        type: user.business.business_type.name,
        category: user.business.business_type.category.name,
        status: user.business.status, // Include business status in returned user data
      },
    },
    accessToken,
    refreshToken,
    expiresAt: expiresAt.toISOString(),
  };
};

const refresh = async (req) => {
  const { refreshToken } = req.body;
  logger.info('Attempting token refresh');

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw boom.unauthorized('Invalid or expired refresh token');
  }

  const userId = decoded.sub;

  // Find all active sessions for the user to match the refresh token hash
  const activeSessions = await models.user_sessions.findAll({
    where: {
      user_id: userId,
      is_revoked: false,
      expires_at: {
        [Op.gt]: new Date(),
      },
    },
  });

  let matchedSession = null;
  for (const session of activeSessions) {
    const isMatch = await bcrypt.compare(refreshToken, session.refresh_token_hash);
    if (isMatch) {
      matchedSession = session;
      break;
    }
  }

  if (!matchedSession) {
    throw boom.unauthorized('Session not found or revoked');
  }

  // Find user and include related business, type, category, and branch data
  const user = await models.users.findOne({
    where: { id: userId },
    include: [
      {
        model: models.businesses,
        as: 'business',
        include: {
          model: models.business_types,
          as: 'business_type',
          include: {
            model: models.business_categories,
            as: 'category',
          },
        },
      },
      {
        model: models.branches,
        as: 'branch',
      },
    ],
  });

  if (!user || !user.business || !user.business.business_type || !user.business.business_type.category) {
    throw boom.unauthorized('User not found or incomplete business data');
  }

  if (user.business.status === 'SUSPENDED_PAYMENT') {
    throw boom.forbidden('Your business account is suspended due to payment issues. Please contact support.');
  }
  if (user.business.status === 'BANNED') {
    throw boom.forbidden('Your business account has been banned. Please contact support.');
  }

  // Generate a new Access Token
  const payload = {
    userId: user.id,
    sub: user.id,
    role: user.role,
    branchId: user.branch_id,
    businessId: user.business.id,
    businessSettings: user.business.settings,
    businessType: user.business.business_type.name,
    businessCategory: user.business.business_type.category.name,
    businessStatus: user.business.status,
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

  return {
    accessToken,
  };
};

module.exports = {
  login,
  refresh,
};