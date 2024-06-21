const express = require('express');
const {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
  getOrders,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - orderItems
 *         - shippingAddress
 *         - paymentMethod
 *         - itemsPrice
 *         - taxPrice
 *         - shippingPrice
 *         - totalPrice
 *       properties:
 *         user:
 *           type: string
 *           description: User ID
 *         orderItems:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               qty:
 *                 type: integer
 *               image:
 *                 type: string
 *               price:
 *                 type: number
 *               product:
 *                 type: string
 *                 description: Product ID
 *         shippingAddress:
 *           type: object
 *           properties:
 *             address:
 *               type: string
 *             city:
 *               type: string
 *             postalCode:
 *               type: string
 *             country:
 *               type: string
 *         paymentMethod:
 *           type: string
 *         itemsPrice:
 *           type: number
 *         taxPrice:
 *           type: number
 *         shippingPrice:
 *           type: number
 *         totalPrice:
 *           type: number
 *         isPaid:
 *           type: boolean
 *           default: false
 *         paidAt:
 *           type: string
 *           format: date-time
 *         isDelivered:
 *           type: boolean
 *           default: false
 *         deliveredAt:
 *           type: string
 *           format: date-time
 *       example:
 *         user: "60c72b2f4f1a4e3a4c8b4e5c"
 *         orderItems:
 *           - name: "Product 1"
 *             qty: 1
 *             image: "/uploads/sample.jpg"
 *             price: 100
 *             product: "60c72b2f4f1a4e3a4c8b4e5d"
 *         shippingAddress:
 *           address: "123 Main St"
 *           city: "City"
 *           postalCode: "12345"
 *           country: "Country"
 *         paymentMethod: "Stripe"
 *         itemsPrice: 100
 *         taxPrice: 0
 *         shippingPrice: 10
 *         totalPrice: 110
 *         isPaid: false
 *         isDelivered: false
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid input
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
 *       401:
 *         description: Not authorized
 */
router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);

/**
 * @swagger
 * /api/orders/myorders:
 *   get:
 *     summary: Get logged in user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user orders
 *       401:
 *         description: Not authorized
 */
router.route('/myorders').get(protect, getMyOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 *       401:
 *         description: Not authorized
 */
router.route('/:id').get(protect, getOrderById);

/**
 * @swagger
 * /api/orders/{id}/pay:
 *   put:
 *     summary: Update order to paid
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               status:
 *                 type: string
 *               update_time:
 *                 type: string
 *                 format: date-time
 *               email_address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order updated to paid
 *       404:
 *         description: Order not found
 *       401:
 *         description: Not authorized
 */
router.route('/:id/pay').put(protect, updateOrderToPaid); // Ensure this route is defined

module.exports = router;
