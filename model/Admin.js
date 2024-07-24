const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    Adminname: {
      type: String,
      required : false,
      unique : false
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    role: {
        type: String,
        enum: ['superadmin', 'admin', 'moderator'],
        default: 'admin'
      }
  });

module.exports = mongoose.model('Admin',adminSchema);
