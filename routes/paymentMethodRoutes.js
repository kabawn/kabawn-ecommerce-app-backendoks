const express = require('express');
const {
  addPaymentMethod,
  getPaymentMethods,
  deletePaymentMethod,
} = require('../controllers/paymentMethodController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').post(protect, addPaymentMethod).get(protect, getPaymentMethods);
router.route('/:id').delete(protect, deletePaymentMethod);

module.exports = router;
