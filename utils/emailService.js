const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendVerificationEmail = async (email, token) => {
    console.log(`➡ Attempting to send email to: ${email}`);
    console.log(`🔑 Verification link: https://highrontechcompany.onrender.com/auth/verify/${token}`);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify Your Email - Highron Tech',
        html: `<p>Click the link below to verify your email:</p>
               <a href="https://highrontechcompany.onrender.com/auth/verify/${token}">Verify Email</a>
               <p>If you did not request this, please ignore this email.</p>`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent: ${info.response}`);
    } catch (error) {
        console.error('❌ Error sending email:', error);
    }
};

module.exports = sendVerificationEmail;
