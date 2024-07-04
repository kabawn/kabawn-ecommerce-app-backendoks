const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

  if (cart) {
    res.json(cart);
  } else {
    res.status(404).json({ message: 'Cart not found' });
  }
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const product = await Product.findById(productId);

  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (cart) {
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
  } else {
    cart = new Cart({
      user: req.user._id,
      items: [{ product: productId, quantity }],
    });
  }

  const updatedCart = await cart.save();
  res.status(201).json(updatedCart);
});

// @desc    Update item quantity in cart
// @route   PUT /api/cart
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });

  if (cart) {
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;

      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      }

      const updatedCart = await cart.save();
      res.status(200).json(updatedCart);
    } else {
      res.status(404).json({ message: 'Product not found in cart' });
    }
  } else {
    res.status(404).json({ message: 'Cart not found' });
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });

  if (cart) {
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
      cart.items.splice(itemIndex, 1);

      const updatedCart = await cart.save();
      res.status(200).json(updatedCart);
    } else {
      res.status(404).json({ message: 'Product not found in cart' });
    }
  } else {
    res.status(404).json({ message: 'Cart not found' });
  }
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
};
