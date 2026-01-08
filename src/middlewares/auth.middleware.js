const boom = require('@hapi/boom');
const jwt = require('jsonwebtoken');
require('dotenv').config();

function checkJwt(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(boom.unauthorized('No token provided'));
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(boom.unauthorized('Malformed token'));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      return next(boom.unauthorized('Invalid token'));
    }
    req.user = payload; // Attach payload to request
    next();
  });
}

function checkRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(boom.unauthorized('Authentication required'));
    }

    const userRole = req.user.role;
    if (!roles.includes(userRole)) {
      return next(boom.forbidden(`You do not have the required role. Needed: ${roles.join(' or ')}`));
    }
    
    next();
  };
}

module.exports = { checkJwt, checkRoles };
