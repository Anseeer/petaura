const Product = require("../model/productSchema");
const Category = require("../model/categorySchema");
const { findById } = require("../model/userSchema");

const loadOffer = async(req,res)=>{
    try {
        const products = await Product.find({});
        const categories = await Category.find({});
        const offers = await Product.find({Offer:{$gt:0}});
        res.render("offer",{products,categories,offers});
    } catch (error) {
        res.status(400).json({success:true,message:"Error in loadOffer"});
    }
}


const addProductOffer = async(req,res)=>{
    try {
        const {productId,productOff} = req.body;
        console.log(req.body);

        const product = await Product.findById(productId);
        console.log("The Product:",product);

        product.Offer = productOff;
        product.finalPrice = product.salePrice - ( product.salePrice * productOff/100 );
        await product.save();
        res.status(200).json({success:true,message:"Success"});
    } catch (error) {
        res.status(200).json({success:false,message:"Error in addProductOffer"});
    }
}


module.exports = {
    loadOffer,
    addProductOffer
}