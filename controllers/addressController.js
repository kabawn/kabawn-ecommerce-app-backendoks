const asyncHandler = require('express-async-handler');
const Address = require('../models/Address');

// @desc    Get all addresses for a user
// @route   GET /api/addresses
// @access  Private
const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id });
  res.json(addresses);
});

// @desc    Add a new address
// @route   POST /api/addresses
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
  console.log('Request user:', req.user); // Log the req.user object
  const { address, city, postalCode, country } = req.body;

  if (!req.user) {
    console.log('User not authenticated'); // Log if user is not authenticated
    res.status(401).json({ message: 'Not authorized, user not authenticated' });
    return;
  }

  const newAddress = new Address({
    user: req.user._id,
    address,
    city,
    postalCode,
    country,
  });

  const createdAddress = await newAddress.save();
  res.status(201).json(createdAddress);
});

// @desc    Update an address
// @route   PUT /api/addresses/:id
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
  const { address, city, postalCode, country } = req.body;

  const addressToUpdate = await Address.findById(req.params.id);

  if (addressToUpdate && addressToUpdate.user.toString() === req.user._id.toString()) {
    addressToUpdate.address = address || addressToUpdate.address;
    addressToUpdate.city = city || addressToUpdate.city;
    addressToUpdate.postalCode = postalCode || addressToUpdate.postalCode;
    addressToUpdate.country = country || addressToUpdate.country;

    const updatedAddress = await addressToUpdate.save();
    res.json(updatedAddress);
  } else {
    res.status(404);
    throw new Error('Address not found');
  }
});

// @desc    Delete an address
// @route   DELETE /api/addresses/:id
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
  const addressToDelete = await Address.findById(req.params.id);

  if (addressToDelete && addressToDelete.user.toString() === req.user._id.toString()) {
    await Address.deleteOne({ _id: req.params.id });
    res.json({ message: 'Address removed' });
  } else {
    res.status(404);
    throw new Error('Address not found');
  }
});

module.exports = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
};
