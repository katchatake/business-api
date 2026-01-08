const express = require('express');
const businessesController = require('./businesses.controller');
const { registerBusinessSchema, updateBusinessSchema } = require('./businesses.validator'); // Import updateBusinessSchema
const { validate } = require('../../../../middlewares/validator.middleware');
const { checkJwt, checkRoles } = require('../../../../middlewares/auth.middleware'); // Corrected import

const router = express.Router();

/**
 * @swagger
 * /businesses:
 *   post:
 *     summary: Register a new business
 *     description: Creates a new business, its main branch, and its owner user. This is a public endpoint for signing up.
 *     tags: [Businesses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterBusiness'
 *     responses:
 *       '201':
 *         description: Business registered successfully
 *       '400':
 *         description: Bad Request (Validation Error or business type does not exist)
 *       '500':
 *         description: Internal Server Error
 */
router.post(
  '/',
  validate(registerBusinessSchema, 'body'),
  businessesController.register
);

/**
 * @swagger
 * /businesses/{id}:
 *   put:
 *     summary: Update an existing business
 *     description: Updates the details of an existing business. Requires authentication and authorization.
 *     tags: [Businesses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the business to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBusiness'
 *     responses:
 *       '200':
 *         description: Business updated successfully
 *       '400':
 *         description: Bad Request (Validation Error)
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: Business not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  '/:id',
  checkJwt, // Authenticate the user (renamed from authenticate to checkJwt)
  checkRoles('OWNER', 'SUPER_ADMIN'), // Corrected usage: pass roles as separate arguments
  validate(updateBusinessSchema, 'body'), // Validate request body
  businessesController.update // Call the update controller method
);

module.exports = router;
