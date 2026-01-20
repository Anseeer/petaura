const Product = require("../model/productSchema");
const Category = require("../model/categorySchema");
const cloudinary = require("../helpers/cloudinary");


const loadproducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const skip = (page - 1) * limit;
        const searchTerm = req.query.Search;
        const query = {};

        if (searchTerm) {
            const regex = { $regex: searchTerm, $options: "i" };

            query.$or = [
                { name: regex },
                { brand: regex },
                { Status: regex },
                { category: regex },
            ];
        }

        const products = await Product.aggregate([
            { $sort: { createdAt: -1 } },
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
            { $skip: skip },
            { $limit: limit },
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

        res.render("product", { product: products, categories: products.map(p => p.categoryDetails), totalPage, currentPage: page });
    } catch (error) {
        res.render("error-page", { message: "An error occurred while loading products." });
    }
};


const getaddProducts = async (req, res) => {
    try {
        const category = await Category.find({ isListed: true });

        return res.render("addProducts", { category });
    } catch (error) {
        return res.render("error-page", { message: "Error occurred in loading addProducts" });
    }
};


const addProduct = async (req, res) => {
    try {
        const product = req.body;
        console.log("Product :", product)
        const existingProduct = await Product.findOne({ name: product.name });
        if (existingProduct) {
            return res.status(500).send("ERROR, This Product Is Already Exist Please Try Other!");
        }

        const category = await Category.findOne({ name: product.category });
        if (!category) {
            return res.status(500).send("Invalid category");
        }

        if (req.files && req.files.length > 0) {
            console.log(req.files)
            let images = [];
            const supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/tiff'];

            for (let i = 0; i < req.files.length; i++) {
                try {
                    if (!supportedFormats.includes(req.files[i].mimetype)) {
                        res.status(500).send("Unsupported file foemat ");
                    }
                    const originalImagePath = req.files[i].path;

                    const uploadedImage = await cloudinary.uploader.upload(originalImagePath, {
                        folder: "Petaura_Product_Image"
                    });

                    console.log("UploadedImg :", uploadedImage)

                    images.push(uploadedImage.secure_url);

                } catch (err) {
                    console.log("Error in Add poduct :", err)
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
                    Offer: product.offer,
                    Image: images,
                    isBlocked: false,
                    finalPrice: product.salePrice - (product.salePrice * product.offer / 100),
                });

                await newProduct.save();

                res.redirect("/admin/loadproducts");
            } catch (err) {
                console.log("Error :", err)
                res.status(500).send("Error saving product.");
            }
        } else {
            res.status(400).send("No files uploaded.");
        }

    } catch (error) {
        res.status(500).send("An error occurred while adding the product.");
    }
};

const loadEditProduct = async (req, res) => {
    try {
        const id = req.query.id;

        const product = await Product.findById({ _id: id }).populate("category", 'name _id');
        const category = await Category.find({ isListed: true });

        if (product) {
            res.render("edit-product", { product, category });
        } else {
            res.status(500).send("cant find the product ");
        }

    } catch (error) {

        res.send(error);
    }
}
const editProduct = async (req, res) => {
    try {
        const id = req.query.id;
        const product = await Product.findById(id);

        const data = req.body;

        const category = await Category.findOne({ name: data.category });
        if (!category) {
            return res.status(400).send("Invalid category");
        }

        let images = product.Image || [];

        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                const originalImagePath = req.files[i].path;
                const uploadedImage = await cloudinary.uploader.upload(originalImagePath, {
                    folder: "Petaura_Product_Image"
                });

                images.push(uploadedImage.secure_url);
            }
        }

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
            Image: images,
            isBlocked: false,
            finalPrice: product.salePrice - (data.salePrice * data.offer / 100),
        };
        await Product.findByIdAndUpdate(id, updatedFields, { new: true });

        res.redirect("/admin/loadproducts");
    } catch (error) {
        res.status(500).send(`ERROR: ${error.message}`);
    }
};


const deleteProduct = async (req, res) => {
    try {
        const id = req.query.id;
        await Product.deleteOne({ _id: id });
        res.redirect("/admin/loadproducts");
    } catch (error) {
        res.status(400).send("ERROR in deleteProduct");
    }
}
const blockProduct = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ success: false, message: "Product ID missing" });
        }

        await Product.findByIdAndUpdate(id, { $set: { isBlocked: true } });

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error while blocking product"
        });
    }
};

const unblockProduct = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ success: false, message: "Product ID missing" });
        }

        await Product.findByIdAndUpdate(id, { $set: { isBlocked: false } });

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error while unblocking product"
        });
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
    unblockProduct
}
