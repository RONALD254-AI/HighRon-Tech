const nodemailer = require('nodemailer');
require('dotenv').config(); // Ensure you have .env for email credentials

// Create transporter using your email service provider
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email provider (Gmail, Outlook, etc.)
    auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS  // Your email password or app password
    }
});

// Function to send verification email
const sendVerificationEmail = async (email, token) => {
    const verificationLink = `http://localhost:3000/auth/verify/${token}`; // Adjust domain in production

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify Your Email',
        html: `<p>Click the link below to verify your email:</p>
               <a href="${verificationLink}">${verificationLink}</a>
               <p>If you did not request this, please ignore this email.</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${email}`);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Could not send verification email');
    }
};

module.exports = sendVerificationEmail;
