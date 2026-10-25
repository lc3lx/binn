const nodemailer = require('nodemailer');

// Nodemailer
const sendEmail = async (options) => {
  const port = Number(process.env.EMAIL_PORT) || 587;
  const isSecure = process.env.EMAIL_SECURE === 'true' || port === 465;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port,
    secure: isSecure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD,
    },
  });

  const sender = process.env.EMAIL_FROM
    ? `ETG RIDE <${process.env.EMAIL_FROM}>`
    : 'ETG RIDE <support@etg-ride.com>';

  const mailOpts = {
    from: sender,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOpts);
};

module.exports = sendEmail;
