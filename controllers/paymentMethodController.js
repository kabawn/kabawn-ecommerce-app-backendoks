const asyncHandler = require('express-async-handler');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

// @desc    Add a payment method
// @route   POST /api/payment-methods
// @access  Private
const addPaymentMethod = asyncHandler(async (req, res) => {
  const { paymentMethodId } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Attach the payment method to the customer
  const paymentMethod = await stripe.paymentMethods.attach(
    paymentMethodId,
    { customer: user.stripeCustomerId }
  );

  // Update the default payment method
  await stripe.customers.update(user.stripeCustomerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });

  // Save the payment method ID in the user's record (optional)
  user.paymentMethods = user.paymentMethods || [];
  user.paymentMethods.push(paymentMethodId);
  await user.save();

  res.status(201).json({ message: 'Payment method added successfully' });
});

// @desc    Get all payment methods for the logged-in user
// @route   GET /api/payment-methods
// @access  Private
const getPaymentMethods = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const paymentMethods = await stripe.paymentMethods.list({
    customer: user.stripeCustomerId,
    type: 'card',
  });

  res.json(paymentMethods.data);
});

// @desc    Delete a payment method
// @route   DELETE /api/payment-methods/:id
// @access  Private
const deletePaymentMethod = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    await stripe.paymentMethods.detach(req.params.id);

    // Ensure paymentMethods is initialized as an array
    user.paymentMethods = user.paymentMethods || [];
    user.paymentMethods = user.paymentMethods.filter(
      (methodId) => methodId !== req.params.id
    );
    await user.save();

    res.json({ message: 'Payment method deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment method:', error); // Improved logging
    res.status(500).json({ message: 'Internal server error' }); // Send a proper error message
  }
});

module.exports = {
  addPaymentMethod,
  getPaymentMethods,
  deletePaymentMethod,
};
