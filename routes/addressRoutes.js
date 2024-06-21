const express = require('express');
const {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} = require('../controllers/addressController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Address:
 *       type: object
 *       required:
 *         - address
 *         - city
 *         - postalCode
 *         - country
 *       properties:
 *         address:
 *           type: string
 *         city:
 *           type: string
 *         postalCode:
 *           type: string
 *         country:
 *           type: string
 *       example:
 *         address: "123 Main St"
 *         city: "City"
 *         postalCode: "12345"
 *         country: "Country"
 */

/**
 * @swagger
 * /api/addresses:
 *   get:
 *     summary: Get all addresses for the logged-in user
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of addresses
 *       401:
 *         description: Not authorized
 *   post:
 *     summary: Add a new address for the logged-in user
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Address'
 *     responses:
 *       201:
 *         description: Address added
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 */
router.route('/').get(protect, getAddresses).post(protect, addAddress);

/**
 * @swagger
 * /api/addresses/{id}:
 *   put:
 *     summary: Update an address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Address ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Address'
 *     responses:
 *       200:
 *         description: Address updated
 *       404:
 *         description: Address not found
 *       401:
 *         description: Not authorized
 *   delete:
 *     summary: Delete an address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Address deleted
 *       404:
 *         description: Address not found
 *       401:
 *         description: Not authorized
 */
router.route('/:id').put(protect, updateAddress).delete(protect, deleteAddress);

module.exports = router;
