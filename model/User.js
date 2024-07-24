// models/User.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Address sub-schema
const addressSchema = new mongoose.Schema({
    street: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    pinCode: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, { _id: false });

// User schema
const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profileImage: {
        type: String,
        default: null
    },
    mobileNumber: {
        type: String,
        required: true,
    },
    emailOTP: {
        code: {
            type: String,
            default: null 
        },
        expiry: {
            type: Date,
            default: null 
        },
        verified: {
            type: Boolean,
            default: false 
        }
    },
    addresses: [addressSchema]
}, { timestamps: true });

// Create the model
const User = mongoose.model('User', userSchema);

module.exports = User;
