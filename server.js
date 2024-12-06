const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON data

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/mydb", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// User Signup Route
app.post('/signup', async (req, res) => {
    try {
        console.log('Request body:', req.body); // Log incoming data
        const { name, password, userType } = req.body;

        // Check for missing fields
        if (!name || !password || !userType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const user = new User({ name, password, userType });
        await user.save();
        res.status(201).send({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error during signup:', error); // Log error details
        res.status(500).send({ error: 'Internal server error' });
    }
});


// User Login Route
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username, password });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.status(200).json({ message: 'Login successful', user });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
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
