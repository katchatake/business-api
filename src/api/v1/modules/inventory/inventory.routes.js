const express = require('express');
const inventoryController = require('./inventory.controller');
const { updateProductInventorySchema, getProductInventoryParamsSchema } = require('./inventory.validator');
const { validate } = require('../../../../middlewares/validator.middleware');
const authMiddleware = require('../../../../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /inventory/products/{productId}/branches/{branchId}:
 *   patch:
 *     summary: Adjust product inventory for a specific branch
 *     description: Updates the quantity of a product in a specific branch's inventory by applying an adjustment.
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the product.
 *       - in: path
 *         name: branchId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the branch.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - adjustment
 *             properties:
 *               adjustment:
 *                 type: number
 *                 format: float
 *                 description: The amount to add or subtract from the current stock. Can be positive or negative.
 *               reason:
 *                 type: string
 *                 description: Optional reason for the inventory adjustment.
 *     responses:
 *       '200':
 *         description: Inventory adjusted successfully
 *       '400':
 *         description: Bad Request (Validation Error)
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: Product or Branch not found
 *       '500':
 *         description: Internal Server Error
 */
router.patch(
  '/products/:productId/branches/:branchId',
  authMiddleware.checkJwt,
  authMiddleware.checkRoles('OWNER', 'MANAGER'),
  validate(getProductInventoryParamsSchema, 'params'),
  validate(updateProductInventorySchema, 'body'),
  inventoryController.updateProductInventory
);

module.exports = router;
