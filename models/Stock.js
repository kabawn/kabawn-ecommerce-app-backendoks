const mongoose = require('mongoose');

const stockItemSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const stockSchema = mongoose.Schema(
  {
    pharmacist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [stockItemSchema],
  },
  {
    timestamps: true,
  }
);

const Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;
