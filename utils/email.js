const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service (e.g., Gmail, Outlook)
    auth: {
        user: 'highrontech@gmail.com', // Your email address
        pass: 'nebx889@' // Your email password or app-specific password
    }
});

const sendVerificationEmail = (email, verificationToken) => {
    const mailOptions = {
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Verify Your Email',
        text: `Click the link to verify your email: http://localhost:3000/auth/verify/${verificationToken}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

module.exports = { sendVerificationEmail };