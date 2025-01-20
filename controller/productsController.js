const Product = require("../model/productSchema");
const Category = require("../model/categorySchema");
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const cloudinary = require("../helpers/cloudinary");
const loadproducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 8 ;
        const skip = (page -1) * limit;
        const searchTerm = req.query.Search; // Get the search term
        const query = {};

        if (searchTerm) {
            // Build a regex pattern for the search term
            const regex = { $regex: searchTerm, $options: "i" };

            // Build query to match product fields
            query.$or = [
                { name: regex }, // Match product name
                { brand: regex }, // Match product brand
                { Status: regex }, // Match product status
                { category: regex }, // Match product status
            ];
        }

        // Aggregate to fetch products and join category data
        const products = await Product.aggregate([
            {$sort:{createdAt:-1}},
            {
                $lookup: {
                    from: "categories", // Collection name for categories
                    localField: "category", // Field in Product model
                    foreignField: "_id", // Field in Category model
                    as: "categoryDetails", // Name for the joined data
                },
            },
            {
                $unwind: {
                    path: "$categoryDetails", // Unwind categoryDetails array
                    preserveNullAndEmptyArrays: true, // Allow products without a category
                },
            },
            {
                $match: searchTerm
                    ? {
                          $or: [
                              { "categoryDetails.name": { $regex: searchTerm, $options: "i" } },
                              ...query.$or,
                          ],
                      }
                    : {}, // Match search term if provided
            },
            {$skip:skip},
            {$limit:limit},
        ]);

        const totalProducts = await Product.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "categoryDetails",
                },
            },
            {
                $unwind: {
                    path: "$categoryDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $match: searchTerm
                    ? {
                          $or: [
                              { "categoryDetails.name": { $regex: searchTerm, $options: "i" } },
                              ...query.$or,
                          ],
                      }
                    : {},
            },
            {
                $count: "total",
            },
        ]);

        const totalPage = Math.ceil((totalProducts[0]?.total || 0) / limit);


        // Render the page and pass both products and category details
        res.render("product", { product: products, categories: products.map(p => p.categoryDetails) , totalPage, currentPage:page});
    } catch (error) {
        res.render("error-page", { message: "An error occurred while loading products." });
    }
};


const getaddProducts = async(req, res) => {
    try {
        const category = await Category.find({ isListed: true });
        
        return res.render("addProducts", { category });
    } catch (error) {
        // Handle the error and send only one response
        return res.render("error-page", { message: "Error occurred in loading addProducts" });
    }
};

  
const addProduct = async (req, res) => {
    try {
        const product = req.body;

        // Check if the product already exists
        const existingProduct = await Product.findOne({ name: product.name });
        if (existingProduct) {
            return res.status(500).send("ERROR, This Product Is Already Exist Please Try Other!");
        }

        // Check if the category exists
        const category = await Category.findOne({ name: product.category });
        if (!category) {
            return res.status(500).send("Invalid category");
        }

        
        // Ensure req.files is not empty
        if (req.files && req.files.length > 0) {
            let images = []; // Initialize images array to store image paths
            const supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/tiff'];

            for (let i = 0; i < req.files.length; i++) {
                try {
                    if (!supportedFormats.includes(req.files[i].mimetype)) {
                        res.status(500).send("Unsupported file foemat ");
                    }
                    // Define paths for the original and resized images
                    const originalImagePath = req.files[i].path;
                    
                    const uploadedImage = await cloudinary.uploader.upload(originalImagePath,{
                        folder:"Petaura_Product_Image"
                    });

                    images.push(uploadedImage.secure_url);


                } catch (err) {
                }
            }
        
            try {
                const newProduct = new Product({
                    name: product.name,
                    description: product.description,
                    quantity: product.quantity,
                    category: category._id,
                    color: product.color,
                    regularPrice: product.regularPrice,
                    salePrice: product.salePrice,
                    Status: product.quantity <= 0 ? "Out of Stock" : product.status,
                    Offer:product.offer,
                    Image: images, 
                    isBlocked: false,
                    finalPrice: product.salePrice - ( product.salePrice * product.offer/100),
                });
        
                await newProduct.save();
        
                // Redirect to the desired page after saving the product
                res.redirect("/admin/loadproducts");
            } catch (err) {
                res.status(500).send("Error saving product.");
            }
        } else {
            res.status(400).send("No files uploaded.");
        }
        
    } catch (error) {
        res.status(500).send("An error occurred while adding the product.");
    }
    };

    const loadEditProduct = async(req,res)=>{
        try {
            const id = req.query.id;
    
            const product = await Product.findById({_id:id}).populate("category",'name _id');
            const category = await Category.find({isListed:true});
            
            if(product){
                res.render("edit-product",{product,category});
            }else{
                res.status(500).send("cant find the product ");
            }
            
        } catch (error) {
         
            res.send(error);
        }
    }  
    const editProduct = async (req, res) => {
        try {
            const id = req.query.id;
            const product = await Product.findById(id); // Get the current product
            
            const data = req.body;
            
            // Validate category
            const category = await Category.findOne({ name: data.category });
            if (!category) {
                return res.status(400).send("Invalid category");
            }
    
            let images = product.Image || []; // Preserve existing images
    
            // Handle image upload logic
            if (req.files && req.files.length > 0) {
                // Upload new images to Cloudinary
                for (let i = 0; i < req.files.length; i++) {
                    const originalImagePath = req.files[i].path;
                    const uploadedImage = await cloudinary.uploader.upload(originalImagePath, {
                        folder: "Petaura_Product_Image"
                    });
    
                    // Push new images to the image array
                    images.push(uploadedImage.secure_url);
                }
            }
    
            // Prepare the fields for updating the product
            const updatedFields = {
                name: data.name,
                description: data.description,
                quantity: data.quantity,
                category: category._id,
                color: data.color,
                regularPrice: data.regularPrice,
                salePrice: data.salePrice,
                Status: data.quantity <= 0 ? "Out of Stock" : data.status,
                Offer: data.offer,
                Image: images, // Updated images array (with new and existing images)
                isBlocked: false,
                finalPrice: product.salePrice - ( data.salePrice * data.offer / 100 ),
            };
    
            // Update the product
            await Product.findByIdAndUpdate(id, updatedFields, { new: true });
    
            res.redirect("/admin/loadproducts");
        } catch (error) {
            res.status(500).send(`ERROR: ${error.message}`);
        }
    };
        

    const deleteProduct = async(req,res)=>{
        try {
            const id = req.query.id;
            await Product.deleteOne({_id:id});
            res.redirect("/admin/loadproducts");
        } catch (error) {
            res.status(400).send("ERROR in deleteProduct");
        }
    }
    
    const blockProduct = async (req, res) => {
        try {
            const id = req.query.id; // Extract the `id` from the query parameters
            if (!id) {
                throw new Error("Product ID is missing in the request.");
            }
    
            // Update the `isBlocked` field to `true` for the specified product
            await Product.findByIdAndUpdate(id, { $set: { isBlocked: true } });
    
            res.redirect("/admin/loadproducts"); // Redirect to the product page after blocking
        } catch (error) {
            res.render("error-page", { message: "An error occurred while blocking the product." });
        }
    };

    const unblockProduct = async (req, res) => {
        try {
            const id = req.query.id; // Extract the `id` from the query parameters
            if (!id) {
                throw new Error("Product ID is missing in the request.");
            }
    
            // Update the `isBlocked` field to `true` for the specified product
            await Product.findByIdAndUpdate(id, { $set: { isBlocked: false } });
    
            res.redirect("/admin/loadproducts"); // Redirect to the product page after blocking
        } catch (error) {
            res.render("error-page", { message: "An error occurred while unblocking the product." });
        }
    };

module.exports = {                                              
    loadproducts,
    getaddProducts,
    addProduct,
    loadEditProduct,
    editProduct,
    deleteProduct,
    blockProduct, 
    unblockProduct,
    
}
  