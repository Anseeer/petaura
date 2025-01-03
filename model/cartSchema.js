const mongoose = require("mongoose");
const {Schema} = mongoose;
const cartSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [{
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            default: 1
        },
        price: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }],
    totalPrice: {
        type: Number,
        required: true,
        default: 0
    },
    discount: {
        type: Number,
        default: 0 // Optional field
    }
}, { timestamps: true });


module.exports = mongoose.model('Cart', cartSchema);

const Cart = mongoose.model("Cart",cartSchema);
module.exports = Cart ;