const mongoose = require("mongoose");
const { Schema } = mongoose;

const wishlistSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [{
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        addOn: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: () => new Date(), // Use a function to get the current date at the time of document creation
        required: true,
    }
    
});

const Wishlist = mongoose.model("Wishlist", wishlistSchema);
module.exports = Wishlist;
