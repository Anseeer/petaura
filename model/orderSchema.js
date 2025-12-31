const mongoose = require("mongoose");
const { Schema } = mongoose;


const orderSchema = new Schema({
    orderId: {
        type: "String",
        required: true,
        unique: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    orderedItems: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        name: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            default: 1
        },
        price: {
            type: Number,
            default: 0
        },
        discount: {
            type: Number,
            default: 0
        },
        totalPrice: {
            type: Number,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true,
            enum: ["pending", "proccessing", "shipped", "delivered", "canceled", "return requested", "returned"],
            default: "pending"
        },
        returnDeadline: {
            type: Date,
        },
        returnRequest: {
            type: Boolean,
            required: true,
            default: false,
        },
    }],
    totalPrice: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    deliveryFee: {
        type: Number,
        default: 0,
    },
    finalPrice: {
        type: Number,
        required: true
    },
    address: [{
        name: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true
        },
        pincode: {
            type: Number,
            required: true
        },
        phone: {
            type: Number,
            required: true
        },
    }],
    paymentMethod: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ["pending", "proccessing", "shipped", "delivered", "canceled", "return request", "returned"],
        default: "pending"
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ["PAID", "UNPAID", "FAILED"],
        default: "UNPAID",
    },
    createdAT: {
        type: Date,
        default: Date.now,
        required: true
    },
    coupenApplied: {
        type: Boolean,
        default: false
    },
    returnDeadline: {
        type: Date,
    }
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
