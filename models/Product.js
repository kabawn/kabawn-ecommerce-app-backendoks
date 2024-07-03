const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    lambdaUserPrice: {
      type: Number,
      required: true,
    },
    pharmacistPrice: {
      type: Number,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    datasheet: {
      type: String,
    },
    qty: {
      type: Number,
      required: true,
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
