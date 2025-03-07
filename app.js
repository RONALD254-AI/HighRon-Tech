const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');

// Load environment variables
require('dotenv').config();

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/loginRegisterApp')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });

// Routes
app.use('/auth', authRoutes);

app.get('/login', (req, res) => {
    res.render('login');
});

// Home Route
app.get('/', (req, res) => {
    res.render('index');
});
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
app.get('/dashboard', (req, res) => {
    if (!req.session.user || !req.session.user.verified) {
        return res.redirect('/'); // Redirect to login if not authenticated or verified
    }
    res.render('dashboard', { user: req.session.user });
});
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI);