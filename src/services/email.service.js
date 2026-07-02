require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
      auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});



// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Banking Management System" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

async function sendRegisterEmail(userEmail, name) {
  const subject = "Welcome to Banking Management System!";

  const text = `Hello ${name},

Thank you for registering with the Banking Management System.

We're excited to have you on board! You can now securely manage your account and perform transactions with ease.

Best Regards,
Banking Management System Team`;

  const html = `
    <p>Hello <strong>${name}</strong>,</p>

    <p>Thank you for registering with the <strong>Banking Management System</strong>.</p>

    <p>We're excited to have you on board! You can now securely manage your account and perform transactions with ease.</p>

    <p>
      Best Regards,<br>
      <strong>Banking Management System Team</strong>
    </p>
  `;

  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Successful";

  const text = `Hello ${name},

Your transaction has been completed successfully.

Amount: ${amount}
Transferred To: ${toAccount}

Thank you for using Banking Management System.

Best Regards,
Banking Management System Team`;

  const html = `
    <p>Hello <strong>${name}</strong>,</p>

    <p>Your transaction has been completed successfully.</p>

    <ul>
      <li><strong>Amount:</strong> ${amount}</li>
      <li><strong>Transferred To:</strong> ${toAccount}</li>
    </ul>

    <p>Thank you for using <strong>Banking Management System</strong>.</p>

    <p>
      Best Regards,<br>
      <strong>Banking Management System Team</strong>
    </p>
  `;

  await sendEmail(userEmail, subject, text, html);
}

async function failTransactionEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Failed";

  const text = `Hello ${name},

Unfortunately, your transaction could not be completed.

Amount: ${amount}
Intended Recipient: ${toAccount}

Please verify your account balance and recipient details, then try again. If the problem persists, contact support.

Best Regards,
Banking Management System Team`;

  const html = `
    <p>Hello <strong>${name}</strong>,</p>

    <p>Unfortunately, your transaction could not be completed.</p>

    <ul>
      <li><strong>Amount:</strong> ${amount}</li>
      <li><strong>Intended Recipient:</strong> ${toAccount}</li>
    </ul>

    <p>Please verify your account balance and recipient details, then try again. If the problem persists, contact support.</p>

    <p>
      Best Regards,<br>
      <strong>Banking Management System Team</strong>
    </p>
  `;

  await sendEmail(userEmail, subject, text, html);
}

module.exports = {sendRegisterEmail , sendTransactionEmail , failTransactionEmail}