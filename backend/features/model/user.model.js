const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    lastLogin: { type: Date },
    totalTimeSpent: { type: Number, default: 0 }, // in seconds
    isOnline: { type: Boolean, default: false },
    activeToken: { type: String }
}, {
    versionKey: false,
    timestamps: true
});

const userModel = mongoose.model('user', userSchema);
const testModel = mongoose.model('test', userSchema);

module.exports = { userModel, testModel };