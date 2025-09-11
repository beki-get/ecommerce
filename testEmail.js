require('dotenv').config();
const sendEmail = require('./utils/sendEmail');

sendEmail({
  to: 'recipient@example.com',
  subject: 'Test Email',
  text: 'Hello! This is a test email.',
}).then(() => {
  console.log('Email successfully sent!');
}).catch((err) => {
  console.error('Failed to send email:', err);
});
