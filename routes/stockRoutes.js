const express = require('express');
const {
  getStock,
  updateStockItem,
} = require('../controllers/stockController');
const { protect, pharmacist } = require('../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * /api/stock:
 *   get:
 *     summary: Get pharmacist stock
 *     tags: [Stock]
 *     responses:
 *       200:
 *         description: Pharmacist stock
 *       404:
 *         description: Stock not found
 */
router.get('/', protect, pharmacist, getStock);

/**
 * @swagger
 * /api/stock:
 *   put:
 *     summary: Update stock item quantity
 *     tags: [Stock]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Item quantity updated
 *       404:
 *         description: Stock or product not found
 */
router.put('/', protect, pharmacist, updateStockItem);

module.exports = router;
