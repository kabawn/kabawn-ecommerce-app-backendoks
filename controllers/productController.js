const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Create a new product
// @route   POST /api/products
// @access  Public
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, lambdaUserPrice, pharmacistPrice, size, datasheet, qty, categoryId } = req.body;
  const images = req.files.map(file => file.path);

  const category = await Category.findById(categoryId);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  const product = new Product({
    name,
    description,
    images,
    lambdaUserPrice,
    pharmacistPrice,
    size,
    datasheet,
    qty,
    category: category._id,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Get all products
// @route   GET /api/products
// @access  Protected
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).populate('category');

  const userRole = req.user.role;
  const responseProducts = products.map(product => {
    const price = userRole === 'pharmacist' ? product.pharmacistPrice : product.lambdaUserPrice;
    const { lambdaUserPrice, pharmacistPrice, ...otherFields } = product._doc;
    return {
      ...otherFields,
      price,
    };
  });

  res.json(responseProducts);
});

// @desc    Get a product by ID
// @route   GET /api/products/:id
// @access  Protected
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category');

  if (product) {
    const userRole = req.user.role;
    const price = userRole === 'pharmacist' ? product.pharmacistPrice : product.lambdaUserPrice;
    const { lambdaUserPrice, pharmacistPrice, ...otherFields } = product._doc;
    res.json({
      ...otherFields,
      price,
    });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Update a product by ID
// @route   PUT /api/products/:id
// @access  Protected
const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, lambdaUserPrice, pharmacistPrice, size, datasheet, qty, categoryId } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.description = description || product.description;
    if (req.files.length > 0) {
      product.images = req.files.map(file => file.path);
    }
    product.lambdaUserPrice = lambdaUserPrice || product.lambdaUserPrice;
    product.pharmacistPrice = pharmacistPrice || product.pharmacistPrice;
    product.size = size || product.size;
    product.datasheet = datasheet || product.datasheet;
    product.qty = qty || product.qty;

    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        res.status(404);
        throw new Error('Category not found');
      }
      product.category = category._id;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product by ID
// @route   DELETE /api/products/:id
// @access  Protected
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
