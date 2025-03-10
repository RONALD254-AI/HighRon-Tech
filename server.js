const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const User = mongoose.model('User', userSchema);
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login'));
});
app.post('/submit', (req, res) => {
    const { email, name, phone, message } = req.body;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'highrontech@gmail.com', // Replace with your email
            pass: 'nebx889@'   // Replace with your email password
        }
    });

    const mailOptions = {
        from: email,
        to: 'ronaldsneekord001@gmail.com',
        subject: `New Contact Form Submission from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).json({ message: 'Error sending email' });
        } else {
            console.log('Email sent: ' + info.response);
            res.status(200).json({ message: 'Email sent successfully' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String // In production, hash the password before storing
});