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
app.set('views', path.join(__dirname, 'views')); // Added this line
app.set('view engine', 'ejs');

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://HighRon:41384154@cluster0.tqi1t.mongodb.net/HighRonTech?retryWrites=true&w=majority&appName=Cluster0')
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Error connecting to MongoDB:', err));
// Routes
app.use('/auth', authRoutes);

// Home Route
app.get('/', (req, res) => {
    res.render('index');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Find the user in the mock data
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // Render a success message and redirect after 3 seconds
        res.render('login-success', { message: 'Login successful! Redirecting to dashboard...', redirectUrl: '/public/home.html' });
    } else {
        // Failed login: Show an error message
        res.send('Invalid username or password');
    }
});

app.post('/register', (req, res) => {
    const { username, password, email } = req.body;

    // Save the user to the database (mock example)
    const newUser = { username, password, email };
    users.push(newUser); // Replace with database logic

    // Show a success message and redirect to the login page
    res.render('register-success', { message: 'Registration successful! Redirecting to login...', redirectUrl: '/views/login.ejs'

     });
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