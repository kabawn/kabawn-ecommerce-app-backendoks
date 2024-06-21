const express = require('express');
const { createPaymentIntent, confirmPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentIntent:
 *       type: object
 *       required:
 *         - amount
 *         - customerId
 *       properties:
 *         amount:
 *           type: number
 *           description: Amount for the payment intent in euros
 *         customerId:
 *           type: string
 *           description: ID of the customer
 *       example:
 *         amount: 100
 *         customerId: cus_QK68fqZPl3ocZJ
 */

/**
 * @swagger
 * /api/payments/create-payment-intent:
 *   post:
 *     summary: Create a payment intent
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentIntent'
 *     responses:
 *       200:
 *         description: Payment intent created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 */
router.post('/create-payment-intent', protect, createPaymentIntent);

/**
 * @swagger
 * components:
 *   schemas:
 *     ConfirmPayment:
 *       type: object
 *       required:
 *         - paymentIntentId
 *         - paymentMethodId
 *       properties:
 *         paymentIntentId:
 *           type: string
 *           description: ID of the payment intent
 *         paymentMethodId:
 *           type: string
 *           description: ID of the payment method
 *       example:
 *         paymentIntentId: pi_1Jvdi2EzzPpQV8YD3E1r5zDx
 *         paymentMethodId: pm_1Jvdi3EzzPpQV8YD3E1r5zDy
 */

/**
 * @swagger
 * /api/payments/confirm-payment:
 *   post:
 *     summary: Confirm a payment intent
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConfirmPayment'
 *     responses:
 *       200:
 *         description: Payment confirmed successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 */
router.post('/confirm-payment', protect, confirmPayment);

module.exports = router;
