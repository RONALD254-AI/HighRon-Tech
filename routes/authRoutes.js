const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

// Registration Route
router.post('/register', authController.register);

// Login Route
router.post('/login', authController.login);

//logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error logging out');
        }
        res.redirect('/');
    });
});
// Verification Route
router.get('/verify/:token', async (req, res) => {
    try {
        const { token } = req.params;

        // Find the user with the matching verification token
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).send('Invalid or expired verification token');
        }

        // Mark the user as verified
        user.verified = true;
        user.verificationToken = undefined; // Clear the token
        await user.save();

        res.send('Email verified successfully. You can now log in.');
    } catch (err) {
        res.status(400).send('Error verifying email');
    }
});
// Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send('Invalid email or password');
        }

        // Check if the user is verified
        if (!user.verified) {
            return res.status(400).send('Please verify your email before logging in');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Invalid email or password');
        }

        req.session.user = user; // Save user in session
        res.redirect('/dashboard'); // Redirect to the dashboard after login
    } catch (err) {
        res.status(400).send('Error logging in');
    }
});
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;

        // Find the user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send('User not found');
        }

        if (user.verified) {
            return res.status(400).send('Email already verified');
        }

        // Generate a new verification token
        const verificationToken = uuidv4();
        user.verificationToken = verificationToken;
        await user.save();

        // Send verification email
        sendVerificationEmail(email, verificationToken);

        res.status(200).send('Verification email sent. Please check your email.');
    } catch (err) {
        res.status(400).send('Error resending verification email');
    }
});

module.exports = router;