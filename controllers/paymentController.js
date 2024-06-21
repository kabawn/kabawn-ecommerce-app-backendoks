const dotenv = require("dotenv");
dotenv.config(); // Load environment variables

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const User = require("../models/User"); // Ensure User model is imported

const createStripeCustomer = asyncHandler(async (user) => {
   const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
   });
   return customer.id;
});

const createPaymentIntent = asyncHandler(async (req, res) => {
   const { order_id, amount } = req.body;

   const order = await Order.findById(order_id);

   if (!order) {
      res.status(404);
      throw new Error("Order not found");
   }

   const user = await User.findById(order.user);
   if (!user) {
      res.status(404);
      throw new Error("User not found");
   }

   let stripeCustomerId = user.stripeCustomerId;
   if (!stripeCustomerId) {
      stripeCustomerId = await createStripeCustomer(user);
      user.stripeCustomerId = stripeCustomerId;
      await user.save();
   }

   const paymentIntent = await stripe.paymentIntents.create({
      amount, // Assume amount is already in cents from the frontend
      currency: "eur",
      payment_method_types: ["card"],
      customer: stripeCustomerId,
   });

   res.status(200).send({
      clientSecret: paymentIntent.client_secret,
      paymentIntentID: paymentIntent.id,
      customerId: stripeCustomerId,
   });
});

const confirmPayment = asyncHandler(async (req, res) => {
   const { paymentIntentId, paymentMethodId } = req.body;

   try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
         payment_method: paymentMethodId,
      });

      res.status(200).send({
         paymentIntent,
         message: "Payment confirmed successfully",
      });
   } catch (error) {
      res.status(400).send({
         error: error.message,
      });
   }
});

module.exports = { createPaymentIntent, confirmPayment };
