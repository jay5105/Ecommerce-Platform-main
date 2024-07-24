const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  image: {
    type: String,
    required: false
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  description: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('Subcategory', subcategorySchema);
