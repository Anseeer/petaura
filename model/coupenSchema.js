const mongoose = require("mongoose");
const { Schema } = mongoose;

const coupenSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    expiredAt: {
        type: Date,
        required: true
    },
    discountPercentage: {
        type: Number,
        required: true
    },
    minOrderValue: {
        type: Number,
        required: true
    },
    maxDiscount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    usageLimit: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true
    }
});

const Coupen = mongoose.model("Coupen", coupenSchema);
module.exports = Coupen;