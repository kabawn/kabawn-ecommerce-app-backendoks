const nodemailer = require('nodemailer');
const { verificationEmailTemplate } = require('./emailTemplates');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'SendGrid',
    auth: {
      user: 'apikey', // This is the string 'apikey' not your actual username
      pass: process.env.SENDGRID_API_KEY,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: options.email,
    subject: options.subject,
    text: options.text, // Send plain text email
    html: options.html, // Send HTML email
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
