const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    index: true // Adding index for faster search
  },
  image: {
    type: [String]
  },
  price: {
    type: Number
  },
  quantity: {
    type: Number
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcategory',
    required: true 
  },
  status: {
    type: String,
    enum: ['under review', 'active', 'deactivate'],
    default: 'under review' 
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  features: {
    type: [String],
    default: [] 
  }
}, { timestamps: true });
  
module.exports = mongoose.model('Product', productSchema);
