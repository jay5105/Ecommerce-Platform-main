const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const addressSchema = new mongoose.Schema(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: {
      type: String,
      required: true,
    },
    country: { type: String, required: true },
  },
  { _id: false }
);

const sellerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    storeName: { type: String, unique: true, trim: true, required: true },
    brandLogo: { type: String, default : null }, 
    storeDescription: { type: String, trim: true },
    gstNumber: { type: String },
    address: { type: addressSchema, required: true },
    contactNumber: { type: String, required: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    emailOTP: {
      code: { type: String },
      expiry: { type: Date },
      verified: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ['under process', 'approved','deactivate','rejected'],
      default: 'under process'
    }
  },
  { timestamps: true }
);

const Seller = mongoose.model("Seller", sellerSchema);

module.exports = Seller;
