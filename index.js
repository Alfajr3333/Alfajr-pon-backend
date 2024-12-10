const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const https = require('https');

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
    origin: 'https://alfajr3333.github.io/', // GitHub Pages URL
    methods: ['GET', 'POST'],
    allowedHeaders: 'Content-Type',
    credentials: true,
}));
app.use(express.json()); // To parse JSON data

// MongoDB connection
mongoose.connect("mongodb+srv://Elmariam3333:3bHW3G8UmLDaPpm9@alfajr.g3xw4.mongodb.net/?retryWrites=true&w=majority&appName=Alfajr", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// User Signup Route
const jwt = require('jsonwebtoken');

app.post('/signup', async (req, res) => {
    try {
        const { name, password, userType } = req.body;

        if (!name || !password || !userType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const user = new User({ name, password, userType });
        await user.save();

        const token = jwt.sign({ id: user._id, userType }, 'your_secret_key', { expiresIn: '1h' });
        res.status(201).json({ message: 'User created successfully', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// User Login Route
const bcrypt = require('bcryptjs');

app.post('/login', async (req, res) => {
    try {
        const { name, password } = req.body;

        // Find user by name
        const user = await User.findOne({ name });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare the entered password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT with user details
        const token = jwt.sign(
            { id: user._id, userType: user.userType },
            'your-secret-key',
            { expiresIn: '1h' }
        );

        // After generating the token in your login route
        res.cookie('token', token, { httpOnly: true, secure: true });


        // Return token along with user data
        res.status(200).json({ message: 'Login successful', token, user });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    jwt.verify(token, 'your-secret-key', (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Forbidden' });
        req.user = decoded;
        next();
    });
};

app.get('/protected', authenticate, (req, res) => {
    res.status(200).json({ message: 'Welcome to the protected route', user: req.user });
});



// Example route
app.get('/', (req, res) => {
    res.send('Hello World');
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
