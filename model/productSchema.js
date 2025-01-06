const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: false,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    regularPrice: {
      type: Number,
      required: true,
    },
    salePrice: {
      type: Number,
      required: true,
    },
    Offer: {
      type: Number,
      default: 0,
    },
    finalPrice:{
      type:Number,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    color: {
      type: String,
      required: true,
    },
    Image: {
      type: [String],
      required: true,
    },
    isBlocked: {
      type: String,
      required: true,
    },
    Status: {
      type: String,
      enum: ["Available", "Out of Stock", "Discounted"],
      default: "Available",
      required: true,
    },
    maxQuantity:{
      type:Number,
      default:5
    },
    saleCount:{
      type:Number,
      default:0
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
