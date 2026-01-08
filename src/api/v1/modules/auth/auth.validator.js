const Joi = require('joi');

const loginSchema = Joi.object({
  username: Joi.string().required().messages({
    'string.base': 'El nombre de usuario debe ser un texto.',
    'string.empty': 'El nombre de usuario no puede estar vacío.',
    'any.required': 'El nombre de usuario es obligatorio.',
  }),
  password: Joi.string().min(6).required().messages({
    'string.base': 'La contraseña debe ser un texto.',
    'string.empty': 'La contraseña не puede estar vacía.',
    'string.min': 'La contraseña debe tener al menos {#limit} caracteres.',
    'any.required': 'La contraseña es obligatoria.',
  }),
});

module.exports = {
  loginSchema,
};
