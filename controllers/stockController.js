const asyncHandler = require('express-async-handler');
const Stock = require('../models/Stock');
const Product = require('../models/Product');

// @desc    Get pharmacist stock
// @route   GET /api/stock
// @access  Private (Pharmacist only)
const getStock = asyncHandler(async (req, res) => {
  const stock = await Stock.findOne({ pharmacist: req.user._id })
    .populate('items.product', 'name')
    .exec();

  if (stock) {
    // Map the stock items to only include product name and quantity
    const response = {
      _id: stock._id,
      pharmacist: stock.pharmacist,
      items: stock.items.map(item => ({
        product: {
          _id: item.product._id,
          name: item.product.name
        },
        quantity: item.quantity
      })),
      createdAt: stock.createdAt,
      updatedAt: stock.updatedAt
    };

    res.json(response);
  } else {
    res.status(404).json({ message: 'Stock not found' });
  }
});

// @desc    Update stock item quantity
// @route   PUT /api/stock
// @access  Private (Pharmacist only)
const updateStockItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  const stock = await Stock.findOne({ pharmacist: req.user._id });

  if (stock) {
    const itemIndex = stock.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
      stock.items[itemIndex].quantity = quantity;

      if (quantity <= 0) {
        stock.items.splice(itemIndex, 1);
      }

      const updatedStock = await stock.save();
      // Map the stock items to only include product name and quantity
      const response = {
        _id: updatedStock._id,
        pharmacist: updatedStock.pharmacist,
        items: updatedStock.items.map(item => ({
          product: {
            _id: item.product._id,
            name: item.product.name
          },
          quantity: item.quantity
        })),
        createdAt: updatedStock.createdAt,
        updatedAt: updatedStock.updatedAt
      };

      res.status(200).json(response);
    } else {
      res.status(404).json({ message: 'Product not found in stock' });
    }
  } else {
    res.status(404).json({ message: 'Stock not found' });
  }
});

module.exports = {
  getStock,
  updateStockItem,
};
