const express = require('express');
const {
  registerUser,
  verifyEmail,
  authUser,
  forgotPassword,
  renderResetPasswordForm,
  handleResetPassword,
} = require('../controllers/userController');
const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered, please verify your email
 *       400:
 *         description: User already exists
 */
router.post('/', registerUser);

/**
 * @swagger
 * /api/users/verify/{token}:
 *   get:
 *     summary: Verify user email
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */
router.get('/verify/:token', verifyEmail);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Authenticate user and get token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User authenticated successfully
 *       401:
 *         description: Invalid email or password / Email not verified
 */
router.post('/login', authUser);

/**
 * @swagger
 * /api/users/forgotpassword:
 *   post:
 *     summary: Request password reset
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email sent
 *       404:
 *         description: User not found
 *       500:
 *         description: Email could not be sent
 */
router.post('/forgotpassword', forgotPassword);

/**
 * @swagger
 * /api/users/resetpassword/{token}:
 *   get:
 *     summary: Render reset password form
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Reset password token
 *     responses:
 *       200:
 *         description: Rendered reset password form
 *       400:
 *         description: Invalid or expired token
 */
router.get('/resetpassword/:token', renderResetPasswordForm);

/**
 * @swagger
 * /api/users/resetpassword/{token}:
 *   post:
 *     summary: Handle reset password form submission
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Reset password token
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post('/resetpassword/:token', handleResetPassword);

module.exports = router;
