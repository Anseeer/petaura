const mongoose = require("mongoose");
const { Schema } = mongoose;

const referralSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    referralCode: {
        type: String,
        unique: true,
        required: true,
    },
    referredUsers: [
        {
            userId: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    bonus: {
        type: Number,
        default: 0,
    },
});


referralSchema.index({ referralCode: 1 }, { unique: true });

const Referral = mongoose.model("Referral", referralSchema);
module.exports = Referral;
