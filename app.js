const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const app = express();

// Session middleware
app.use(session({
    secret: '41384154', // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://HighRon:41384154@cluster0.tqi1t.mongodb.net/HighRonTech?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

// Define User Schema
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String // In production, hash passwords before storing
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Routes
app.use('/auth', authRoutes);

// Home Route
app.get('/', (req, res) => {
    res.render('index');
});

// Register Route (GET)
app.get('/register', (req, res) => {
    res.render('register');
});

// Login Route (GET)
app.get('/login', (req, res) => {
    res.render('login');
});

// Register Route (POST) - Now Saves to MongoDB
app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.send('User already exists! Try logging in.');
        }

        const newUser = new User({ username, password, email });
        await newUser.save();

        // Redirect automatically to the login page after successful registration
        res.redirect('/login');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Server error');
    }
});
app.get('/login-successful', (req, res) => {
    res.render('login-success'); // Ensure 'login-success.ejs' exists in the 'views' folder
});

// Login Route (POST) - Now Checks MongoDB
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email, password });

        if (!user) {
            return res.send('Invalid email or password');
        }

        // Set session
        req.session.user = {
            id: user._id,
            email: user.email,
            verified: true
        };

        res.redirect('/home'); // Redirect to home after login
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Server error');
    }
});

// FIX: Serve home.ejs instead of login.ejs
app.get('/home', (req, res) => {
    if (!req.session.user || !req.session.user.verified) {
        return res.redirect('/home');
    }
    res.render('home'); // Rendering home.ejs now
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
