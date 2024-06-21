const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  paymentMethodId: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  last4: {
    type: String,
    required: true,
  },
  expMonth: {
    type: Number,
    required: true,
  },
  expYear: {
    type: Number,
    required: true,
  },
});

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);

module.exports = PaymentMethod;
