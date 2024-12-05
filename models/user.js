const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Change `username` to `name`
    password: { type: String, required: true },
    userType: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
