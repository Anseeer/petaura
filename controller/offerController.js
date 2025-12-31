const Product = require("../model/productSchema");
const Category = require("../model/categorySchema");

const loadOffer = async (req, res) => {
    try {
        const products = await Product.find({});
        const categories = await Category.find({});
        const offers = await Product.find({ Offer: { $gt: 0 } });
        res.render("offer", { products, categories, offers });
    } catch (error) {
        res.status(400).json({ success: true, message: "Error in loadOffer" });
    }
}

const addProductOffer = async (req, res) => {
    try {
        const { productId, productOff } = req.body;
        const product = await Product.findById(productId);
        product.Offer = productOff;
        product.finalPrice = product.salePrice - (product.salePrice * productOff / 100);
        await product.save();
        res.status(200).json({ success: true, message: "Success" });
    } catch (error) {
        res.status(200).json({ success: false, message: "Error in addProductOffer" });
    }
}

module.exports = {
    loadOffer,
    addProductOffer
}