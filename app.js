const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const flash = require('connect-flash'); // ✅ Added for flash messages
require('dotenv').config();

const authRoutes = require('./routes/authRoutes'); // ✅ Import auth routes

const app = express();

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'supersecretkey', // ✅ Use env variable
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Flash messages middleware
app.use(flash());

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Make flash messages available in all views
app.use((req, res, next) => {
    res.locals.message = req.flash();
    next();
});

// Set view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://HighRon:41384154@cluster0.tqi1t.mongodb.net/HighRonTech?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

// User Schema
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    verified: { type: Boolean, default: false } // ✅ Ensure email verification is tracked
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Use Auth Routes
app.use('/auth', authRoutes); // ✅ Use routes

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/register', (req, res) => {
    res.render('register', { message: req.flash('error') });
});

app.get('/login', (req, res) => {
    res.render('login', { message: req.flash('error') });
});

// Register Route
app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash('error', 'User already exists! Try logging in.');
            return res.redirect('/register');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        req.flash('success', 'Registration successful. Please log in.');
        res.redirect('/login');
    } catch (error) {
        console.error('Error registering user:', error);
        req.flash('error', 'Server error. Please try again.');
        res.redirect('/register');
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/login');
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/login');
        }

        if (!user.verified) {
            req.flash('error', 'Please verify your email before logging in.');
            return res.redirect('/login');
        }

        req.session.user = { 
            id: user._id, 
            email: user.email, 
            verified: user.verified
        };

        res.redirect('/home');
    } catch (error) {
        console.error('Error logging in:', error);
        req.flash('error', 'Server error. Please try again.');
        res.redirect('/login');
    }
});

// Home Route
app.get('/home', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    if (!req.session.user.verified) {
        req.flash('error', 'Please verify your email before accessing this page.');
        return res.redirect('/login');
    }
    res.render('home', { user: req.session.user });
});

// Login Successful Page
app.get('/login-successful', (req, res) => {
    res.render('login-success', { user: req.session.user });
});

// Logout Route
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
