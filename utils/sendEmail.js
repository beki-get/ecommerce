const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text }) => {
  try {
    // Create transporter with explicit SMTP settings for Gmail
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,         // SSL port
      secure: true,      // true for port 465
      auth: {
        user: process.env.EMAIL_USER,  // Your Gmail address
        pass: process.env.EMAIL_PASS,  // Your Gmail App Password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;  // Rethrow so caller can handle if needed
  }
};

module.exports = sendEmail;
