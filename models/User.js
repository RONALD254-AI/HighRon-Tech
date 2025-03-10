const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Ensure consistency
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false },
    verificationToken: { type: String, default: uuidv4 } // Auto-generate token
});

// Hash the password before saving the user
userSchema.pre('save', async function (next) {
    if (this.isModified('password') || this.isNew) { // Fix: Ensure password hashes for new users
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
