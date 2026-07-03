const authService = require('./auth.service');
const boom = require('@hapi/boom');

const login = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.login(req);
    
    res.status(200).json({
      message: 'Login successful',
      data: {
        user,
        accessToken,
        refreshToken,
      }
    });
  } catch (error) {
    // The service layer throws a generic 'Invalid credentials' error.
    // The controller is responsible for translating that into a specific HTTP status.
    if (error.message === 'Invalid credentials') {
      next(boom.unauthorized('Invalid credentials'));
    } else {
      // Pass other errors to the centralized boom error handler
      next(error);
    }
  }
};

const refresh = async (req, res, next) => {
  try {
    const { accessToken } = await authService.refresh(req);
    
    res.status(200).json({
      message: 'Token refreshed successfully',
      data: {
        accessToken,
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  refresh,
};
