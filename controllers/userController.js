const asyncHandler = require('express-async-handler');
const dotenv = require("dotenv");
dotenv.config(); // Load environment variables
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const { verificationEmailTemplate } = require('../utils/emailTemplates');
const crypto = require('crypto');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

console.log('Stripe Secret Key:', process.env.STRIPE_SECRET_KEY); // This should print the correct key

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    role,
  } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).json({ message: "L'utilisateur existe déjà" });
    return;
  }

  // Create Stripe customer
  try {
    const customer = await stripe.customers.create({
      email: email,
      name: `${firstName} ${lastName}`,
      phone: phone,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
      stripeCustomerId: customer.id,  // Save Stripe customer ID
    });

    const verificationToken = crypto.randomBytes(20).toString('hex');
    user.isVerified = false;
    user.verificationToken = verificationToken;
    await user.save();

    console.log(`Generated Token: ${verificationToken}`);

    const verificationUrl = `${req.protocol}://${req.get('host')}/api/users/verify/${verificationToken}`;

    const message = verificationEmailTemplate(verificationUrl);

    await sendEmail({
      email: user.email,
      subject: 'Vérification de votre adresse e-mail',
      html: message,
    });

    res.status(201).json({
      message: 'User registered, please verify your email',
    });
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    res.status(500).json({ message: 'Error creating Stripe customer' });
  }
});

// @desc    Verify email
// @route   GET /api/users/verify/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  console.log(`Token received for verification: ${req.params.token}`);

  const user = await User.findOne({
    verificationToken: req.params.token,
  });

  if (!user) {
    console.log('Token is invalid or expired');
    return res.status(400).send(`
      <html>
        <body>
          <div style="text-align: center; font-family: Arial, sans-serif; color: #333;">
            <h2>Le lien de vérification est invalide ou expiré</h2>
            <p>Veuillez retourner à l'application pour réessayer.</p>
          </div>
        </body>
      </html>
    `);
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();

  console.log('Email verified successfully');
  res.status(200).send(`
    <html>
      <body>
        <div style="text-align: center; font-family: Arial, sans-serif; color: #333;">
          <h2>Votre adresse e-mail a été vérifiée avec succès</h2>
          <p>Vous pouvez maintenant vous connecter à l'application.</p>
        </div>
      </body>
    </html>
  `);
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    if (!user.isVerified) {
      res.status(401);
      throw new Error('Email not verified');
    }
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Forgot password
// @route   POST /api/users/forgotpassword
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  const resetUrl = `${req.protocol}://${req.get('host')}/api/users/resetpassword/${resetToken}`;

  const message = `
    <html>
      <body>
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Réinitialisation du mot de passe</h2>
          <p>Vous recevez cet e-mail parce que vous (ou quelqu'un d'autre) avez demandé la réinitialisation d'un mot de passe. Veuillez cliquer sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
          <p>
            <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer;">Réinitialiser le mot de passe</a>
          </p>
          <p>Ou copiez et collez ce lien dans votre navigateur :</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>Merci,</p>
          <p>L'équipe de notre service</p>
        </div>
      </body>
    </html>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Réinitialisation du mot de passe',
      html: message,
    });

    res.status(200).json({ message: 'Email sent' });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(500).json({ message: 'Email could not be sent' });
  }
});

// @desc    Render reset password form
// @route   GET /api/users/resetpassword/:token
// @access  Public
const renderResetPasswordForm = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).send(`
      <html>
        <body>
          <div style="text-align: center; font-family: Arial, sans-serif; color: #333;">
            <h2>Le lien de réinitialisation du mot de passe est invalide ou expiré</h2>
            <p>Veuillez retourner à l'application pour réessayer.</p>
          </div>
        </body>
      </html>
    `);
  }

  res.send(`
    <html>
      <body>
        <div style="text-align: center; font-family: Arial, sans-serif; color: #333;">
          <h2>Réinitialisation du mot de passe</h2>
          <form action="/api/users/resetpassword/${req.params.token}" method="POST">
            <label for="password">Nouveau mot de passe:</label><br>
            <input type="password" id="password" name="password" required><br><br>
            <button type="submit" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer;">Réinitialiser le mot de passe</button>
          </form>
        </div>
      </body>
    </html>
  `);
});

// @desc    Handle reset password form submission
// @route   POST /api/users/resetpassword/:token
// @access  Public
const handleResetPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).send(`
      <html>
        <body>
          <div style="text-align: center; font-family: Arial, sans-serif; color: #333;">
            <h2>Le lien de réinitialisation du mot de passe est invalide ou expiré</h2>
            <p>Veuillez retourner à l'application pour réessayer.</p>
          </div>
        </body>
      </html>
    `);
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).send(`
    <html>
      <body>
        <div style="text-align: center; font-family: Arial, sans-serif; color: #333;">
          <h2>Votre mot de passe a été réinitialisé avec succès</h2>
          <p>Vous pouvez maintenant vous connecter à l'application avec votre nouveau mot de passe.</p>
          <a href="http://localhost:3000/login" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer;">Se connecter</a>
        </div>
      </body>
    </html>
  `);
});

module.exports = {
  registerUser,
  verifyEmail,
  authUser,
  forgotPassword,
  renderResetPasswordForm,
  handleResetPassword,
};
