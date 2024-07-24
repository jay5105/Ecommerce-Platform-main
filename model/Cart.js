const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String ,default: null },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    subtotal: { type: Number, required: true, default: 0 }
});

const CartSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    products: [ProductSchema],
    totalAmount: { type: Number, required: true, default: 0 }
});

CartSchema.methods.calculateTotal = function() {
    this.totalAmount = this.products.reduce((sum, product) => {
        return sum + product.subtotal;
    }, 0);
    return this.totalAmount;
};

CartSchema.pre('save', function(next) {
    this.products.forEach(product => {
        product.subtotal = product.price * product.quantity;
    });
    this.calculateTotal();
    next();
});

module.exports = mongoose.model('Cart', CartSchema);
