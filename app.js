const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const path = require('path'); // Added this line

// Load environment variables
require('dotenv').config();

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views')); // Added this line
app.set('view engine', 'ejs');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://HighRon:nebx889%40@cluster0.tqi1t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0s', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Error connecting to MongoDB:', err));

// Routes
app.use('/auth', authRoutes);

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

// Home Route
app.get('/', (req, res) => {
    res.render('index');
});

// Dashboard Route
app.get('/dashboard', (req, res) => {
    if (!req.session.user || !req.session.user.verified) {
        return res.redirect('/'); // Redirect to login if not authenticated or verified
    }
    res.render('dashboard', { user: req.session.user });
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