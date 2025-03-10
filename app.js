const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config();

const app = express();

// Session middleware
app.use(session({
    secret: '41384154',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
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
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/login', (req, res) => {
    res.render('login');
});

// Register Route
app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.send('User already exists! Try logging in.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.redirect('/login');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Server error');
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.send('Invalid email or password');
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.send('Invalid email or password');
        }

        req.session.user = {
            id: user._id,
            email: user.email,
            verified: true
        };

        res.redirect('/home');
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Server error');
    }
});

// Home Route
app.get('/home', (req, res) => {
    if (!req.session.user || !req.session.user.verified) {
        return res.redirect('/login'); // ✅ Redirects to login instead of looping
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
