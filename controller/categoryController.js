const Category = require("../model/categorySchema"); 
const User = require("../model/userSchema"); 
const ParentCategory = require("../model/parentCategorySchema");  
const Product = require("../model/productSchema");  


const categoryInfo = async (req, res) => {
    let query = {};
    let page = req.query.page || 1;
    let limit = 6 ;
    let skip = (page-1)*limit;
    try {
        if (req.query.search) {
            const searchTerm = req.query.search;
            query = {
                $or: [
                    { name: { $regex: searchTerm, $options: "i" } },
                    { description: { $regex: searchTerm, $options: "i" } },
                ],
            };
            const totalCount =  await Category.countDocuments({});
            const category = await Category.find(query).populate('parent', 'name'); // Only get the 'name' field

            res.render("category", { category ,currentPage:page,totalPage:Math.ceil(totalCount/limit)});
        } else {
            const totalCount =  await Category.countDocuments({});
            const category = await Category.find({}).populate('parent', 'name').skip(skip).limit(limit).sort({createdAt:-1}); // Only get the 'name' field
            const parentCategory = await ParentCategory.find({});

            res.render("category", { category, parentCategory ,currentPage:page,totalPage:Math.ceil(totalCount/limit)});
        }
    } catch (error) {
        res.status(400).send("Error");
    }
};

const loadAddCategory = async(req,res)=>{
  try {
    const parentCategory = await ParentCategory.find({});
    const category = await Category.find({}).populate('parent', 'name'); // Only get the 'name' field

    res.render("addCategory",{parentCategory,category});
  } catch (error) {
    res.status(400).json({success:false,message:"Error in addCategory"});
  }
}

const addCategory = async (req, res) => {
    try {
      const { name, description, parent,offer } = req.body;
  
      // Validate required fields
      if (!name || !description || !parent || !offer) {
        return res.status(400).json({ success:false, message: "Name and description are required" });
      }
  
      // Check if category already exists
      const existingCategory = await Category.findOne(
        {name:{$regex:name,$options:"i"}},
      );
      if (existingCategory) {
        return res.status(400).json({ success:false, message: "Category already exists" });
      }
  
    //   Check if parent category exists
    const parentCategory = await ParentCategory.findById(parent);
      if (!parentCategory) {
        return res.status(500).json({ success:false, message: "Parent category does not exist" });
      }
   
      // Create and save the new category
      const newCategory = new Category({
        name,
        description,
        parent:parentCategory,
        categoryOffer:offer,
      });
  
      await newCategory.save();
      res.status(200).json({success:true,message:"Added"})
    } catch (error) {
      return res.status(500).json({ success:false, message: "Internal Server Error" });
    }
  };

  const deleteCategory = async (req,res)=>{
    try {
        if(req.query.id){
            let id = req.query.id;
            const del = await Category.deleteOne({_id:id});
            if(del){
                res.redirect("/admin/Category");
            }else{
                
            }
        }else{
        }
    } catch (error) {
        res.status(400).send("ERROR OCCURES IN DELETECTEGORY");
    }
}

const loadParentCategory = async(req,res)=>{
  try {
    let query={};
    let searchTerm = req.query.search;
    if(searchTerm){
      query={
        name:{$regex:searchTerm,$options:"i"},
        description:{$regex:searchTerm,$options:"i"},
      }
      const parentCategory = await ParentCategory.find(query);
      res.render("parentCategory",{parentCategory});  
    }else{
      const parentCategory = await ParentCategory.find(query);
    res.render("parentCategory",{parentCategory});
    }
  } catch (error) {
    res.status(400).json({success:false,message:"Error in the parentCategory"});
  }
}

const loadAddParentCategory = async(req,res)=>{
  try {
    res.render("addParentCategory");
  } catch (error) {
    res.status(400).json({success:false,message:"Error in the loadAddParentCategory"});
  }
}

  const deleteParentCategory = async (req,res)=>{
    try {
        if(req.query.id){
            let id = req.query.id;
            const del =  await ParentCategory.deleteOne({_id:id});
            if(del){
                res.redirect("/admin/parentCategories");
            }else{
                
            }
        }else{
        }
    } catch (error) {
        res.status(400).send("ERROR OCCURES IN DELETECTEGORY");
    }
}

const loadEditCategory = async (req, res) => {
    try {
        const id = req.query.id;
        const category = await Category.findById(id).populate('parent');
        const parentCategory = await ParentCategory.find(); // Fetch all possible parent categories
        res.render('edit-category', { category, parentCategory });
    } catch (error) {
        res.status(500).send('Error loading category data');
    }
};

const editCategory =async(req,res)=>{
    try {
        await Category.findByIdAndUpdate({_id:req.body._id} ,{$set:{name:req.body.name , description:req.body.description ,parent:req.body.parent ,categoryOffer:req.body.offer }});
        res.redirect("/admin/Category");
    } catch (error) {
        res.status(400).send("ERROR occures in edit category")
    }
}


const unListCategory = async(req,res)=>{
    try {
        const id = req.query.id;
        const findCategory = await Category.updateOne({_id:id},{$set:{isListed:false}});
        res.redirect("/admin/category");
    } catch (error) {
        res.status(400).send("ERROR in unlist Categoy");
    }
}

const unListParentCategory = async(req,res)=>{
    try {
        const id = req.query.id;
        const findCategory = await ParentCategory.updateOne({_id:id},{$set:{isListed:false}});
        res.redirect("/admin/parentCategories");
    } catch (error) {
        res.status(400).send("ERROR in unlist Categoy");
    }
}

const ListCategory = async(req,res)=>{
    try {
        const id = req.query.id;
        const findCategory = await Category.updateOne({_id:id},{$set:{isListed:true}});
        res.redirect("/admin/category");
    } catch (error) {
        res.status(400).send("ERROR in list Categoy");
    }
}  

const ListParentCategory = async(req,res)=>{
    try {
        const id = req.query.id;
        const findCategory = await ParentCategory.updateOne({_id:id},{$set:{isListed:true}});
        res.redirect("/admin/parentCategories");
    } catch (error) {
        res.status(400).send("ERROR in list Categoy");
    }
}  

const addParentCategory = async (req, res) => {
    try {
      const { name, description } = req.body;
  
      // Check if parent category already exists
      const existingParent = await ParentCategory.findOne(
        {name:{$regex:name,$options:"i"}},
      );
      if (existingParent) {
        return res.status(400).json({success:false,message:"the Parent Category Is already exisiting"});
      }
  
      // Create and save new parent category
      const newParent = new ParentCategory({
        name:name,
        description:description,
      });
  
      await newParent.save();
  
  
      // Redirect after successful save
      res.status(200).json({success:true,message:"Added"});
    } catch (error) {
      // Send response with the error message
      return res.status(500).json({success:false,message:"error in the add parent category"})
    }
  };

  const loadeditParentCategory = async(req,res)=>{
    try {
        const id = req.query.id;
    if (!id) {
    return res.status(400).send("Invalid or missing ID");
    }

        const Parent = await ParentCategory.findById(id);
        res.render("edit-parent-category", { Parent  });
    } catch (error) {
        res.status(400).send("ERROR IN LOADEDITPARENTCATEGORY ");
    }
  };

  
const editParentCategory = async (req, res) => {
    try {
        const {  name, description } = req.body;

        

        // Validate that required fields are not empty
        if (!name || !description) {
            return res.status(400).send("Name and description are required");
        }
        const findParent = await ParentCategory.findOne({name:name});
        const _id = findParent._id;
        // Update the category
        const updatedCategory = await ParentCategory.findByIdAndUpdate(
            _id,
            { $set: { name: name.trim(), description: description.trim() } },
            { new: true } // Return the updated document
        );

        if (!updatedCategory) {
            return res.status(404).send("Category not found");
        }

        res.redirect("/admin/parentCategories");
    } catch (error) {
        res.status(500).send("An error occurred while updating the category");
    }
};

const loadCatSupplies = async (req, res) => {
  try {
      let page = parseInt(req.query.page) || 1;
      let limit = 9;
      let skip = (page - 1) * limit;
    
      const user = req.session.user;
      const userData = await User.findById(user); // Correcting the query to find user by ID
      const ParentCat = await ParentCategory.findOne({ name: "Cat" });

      if (!ParentCat) {
      }


      const categories = await Category.find({ isListed: true, parent: ParentCat._id });
      const categoryIds = categories.map((category) => category._id.toString());
      const categoreiesWithId = categories.map(category => ({ _id: category._id, name: category.name }));

      // Find products only in these categories
      let products;
      let totalProduct = await Product.countDocuments({category: { $in: categoryIds }});

          products = await Product.find({
              isBlocked: false,
              category: { $in: categoryIds },
              quantity: { $gte: 0 },
          })
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 });
      


      res.render("catSupplies", {
          user: userData,
          category: categoreiesWithId,
          // product: [],
          parent:ParentCat._id,
          currentPage:page,
          totalPage: Math.ceil(totalProduct/limit),
          breadcrumbs: [
              { text: "Home", url: "/" },
              { text: "CatSupplies", url: "/cat-supplies" },
          ],
      });

  } catch (error) {
      res.status(400).render("error", { message: "An error occurred in loadCatSupplies" });
  }
};

const fillterCategoryOfCat = async (req, res) => {
  try {
    let sorted;
    let sort = req.query.sort || "";
    let page = parseInt(req.query.page) || 1;
    let limit = 9;
    let skip = (page - 1) * limit;
    const user = req.session.user;
    const category = req.query.category || ""; 
    const search = req.query.search || ""; 
    

    // Initialize query for products
    const query = {
      isBlocked: false,
      quantity: { $gte: 0 },
      name:{$regex:search,$options:"i"},
    };

    if (category) {
      // Check if it's a parent category
      const ParentCat = await ParentCategory.findById(category);
      if (ParentCat) {
        // Fetch all subcategories under the parent category
        const subcategories = await Category.find({ parent: ParentCat._id, isListed: true });
        const subcategoryIds = subcategories.map((sub) => sub._id);
        query.category = { $in: subcategoryIds };
      } else {
        // Treat as a regular category
        const findCategory = await Category.findOne({ isListed: true, _id: category });
        if (findCategory) {
          query.category = findCategory._id;
        }
      }
    }

    // Apply sorting
    if (sort === "high-low") {
      sorted = { salePrice: -1 };
    } else if (sort === "low-high") {
      sorted = { salePrice: 1 };
    } else if (sort === "a-z") {
      sorted = { name: 1 };
    } else if (sort === "z-a") {
      sorted = { name: -1 };
    }else{
      sorted = {createdAt:-1};
    }

    // Fetch and sort products
    let totalProducts = await Product.countDocuments(query);
    const findProducts = await Product.find(query).skip(skip).limit(limit).sort(sorted).lean();

    // Fetch user data if logged in
   
      // Fetch user data if logged in
      let userData = null;
      if (user) {
        userData = await User.findOne({ _id: user });
        if (userData) {
          const searchEntry = {
            category: query.category ? query.category._id : null,
            searchOn: new Date(),
          };
          userData.searchHistory.push(searchEntry);
          await userData.save();
        }
      }
  

    // Fetch all categories under the Cat parent
    const ParentCat = await ParentCategory.findOne({ name: "Cat" });
    const cat = await Category.find({ isListed: true, parent: ParentCat._id });

    // Render the page
    res.status(200).json({
      product: findProducts,
      category: cat,
      user: userData,
      totalPage: Math.ceil(totalProducts / limit),
      currentPage: page,
      breadcrumbs: [
        { text: "Home", url: "/" },
        { text: "CatSupplies", url: "/cat-supplies" },
      ],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error in filtering the category" });
  }
};

  const ProuctDetails = async(req, res) => {
    try {
      const userId = req.session.user;
      const userData = await User.findById(userId);
  
      const productId = req.query.product;
      const product = await Product.findById(productId).populate("category",'categoryOffer name'); 
      const category = product.category;
      const productOff = product.Offer;
      const categoryOff = category.categoryOffer;
      const offer = productOff > categoryOff ? productOff : categoryOff ; 
      if (!product) {
        // Handle the case where the product is not found
        return res.status(404).send("Product not found");
      }

      const relatedProducts = await Product.find({
        category:product.category,
        _id:{$ne:productId},
      }).limit(4);
  
      // Ensure that the product has the properties before rendering
      res.render("productDetail", {
        user: userData,
        Product: product,
        Quantity: product.quantity || 0,  // Default to 0 if quantity is missing
        Offer:offer,
        finalPrice:product.salePrice - offer ,
        Related:relatedProducts,
        breadcrumbs:[
            {text:"Home",url:"/"},
            {text:"CatSupplies",url:"/cat-supplies"},
            {text:"ProductDetails",url:"/use/ProuctDetails"}
        ]
      });
    } catch (error) {
      res.status(400).render("error",{message:"ERROR occurs in productDetails"});
    }
  };
  
//   dog-supplies

// dog section 

const loadDogSupplies = async (req, res) => {
    try {
      let page = parseInt(req.query.page) || 1 ;
      let limit = 9;
      let skip = (page - 1) * limit ;
        const user = req.session.user;
        const userData = await User.findById(user); // Correcting the query to find user by ID
        const ParentDog = await ParentCategory.findOne({name:"Dog"});
        
        if(!ParentDog){
        }
        const categories = await Category.find({ isListed: true ,parent:ParentDog._id }); 
        const categoryIds = categories.map((category) => category._id.toString());
        const categoreiesWithId = categories.map(category => ({ _id: category._id, name: category.name }));
        
        // Find products only in these categories
        let totalPage = await Product.countDocuments({category: { $in: categoryIds }});
        const products = await Product.find({
            isBlocked: false,
            category: { $in: categoryIds },
            quantity: { $gte: 0 }
        })
        .skip(skip)
        .limit(limit)
        .sort({createdAt:-1});

        res.render("dogSupplies", {
            user: userData,
            category: categoreiesWithId,
            // product: products,
            currentPage:page,
            parent:ParentDog._id,
            totalPage:Math.ceil(totalPage/limit),
            breadcrumbs: [
                { text: "Home", url: "/" },
                { text: "DogSupplies", url: "/dog-supplies" }
            ]
        });

    } catch (error) {
        res.status(400).render("error", { message: "An error occurred in loadDogSupplies" });
    }
};

const fillterCategoryOfDog = async (req, res) => {
  try {
      let page = parseInt(req.query.page) || 1;
      let limit = 9;
      let skip = (page - 1) * limit;
      const user = req.session.user;
      let category = req.query.category || "";
      let sorted;
      let sort = req.query.sort;
      let search = req.query.search;
     
      const query = {
          isBlocked: false,
          quantity: { $gte: 0 },
          name: { $regex: search, $options: "i" },
      };

      if (category) {
          let parentCategory = await ParentCategory.findById(category);
          if (parentCategory) {
              let subcategories = await Category.find({ parent: parentCategory._id, isListed: true });
              let subcategoryIds = subcategories.map((subcategory) => subcategory._id);
              query.category = { $in: subcategoryIds };
          } else {
              let specificCategory = await Category.findOne({ _id: category, isListed: true });
              if (specificCategory) {
                  query.category = specificCategory._id;
              }
          }
      }

      if (sort === "high-low") {
          sorted = { salePrice: -1 };
      } else if (sort === "low-high") {
          sorted = { salePrice: 1 };
      } else if (sort === "a-z") {
          sorted = { name: 1 };
      } else if (sort === "z-a") {
          sorted = { name: -1 };
      }else{
        sorted = {createdAt:-1};
      }

      const findProducts = await Product.find(query).sort(sorted).skip(skip).limit(limit).lean();
      let totalProducts = await Product.countDocuments(query);
      const currentProducts = findProducts;

      let userData = null;
      if (user) {
          userData = await User.findOne({ _id: user });
      }

      const ParentDog = await ParentCategory.findOne({ name: "Dog" });
      const cat = await Category.find({ isListed: true, parent: ParentDog._id });

      res.status(200).json({
          product: currentProducts,
          category: cat,
          user: userData,
          totalPage: Math.ceil(totalProducts / limit),
          currentPage: page,
          breadcrumbs: [
              { text: "Home", url: "/" },
              { text: "DogSupplies", url: "/dog-supplies" },
          ],
      });
  } catch (error) {
      res.status(500).render("error", { message: "Error in Filtering the category" });
  }
};

  
  const ProuctDetailsOfDog = async(req, res) => {
    try {
      const userId = req.session.user;
      const userData = await User.findById(userId);
  
      const productId = req.query.product;
      const product = await Product.findById(productId); 
  
      if (!product) {
        // Handle the case where the product is not found
        return res.status(404).send("Product not found");
      }

      const relatedProducts = await Product.find({
        category:product.category,
        _id:{$ne:productId},
      }).limit(4);
  
      // Ensure that the product has the properties before rendering
      res.render("productDetail", {
        user: userData,
        Product: product,
        Quantity: product.quantity || 0,  // Default to 0 if quantity is missing
        Offer: product.Offer || "No Offer" ,
        Related:relatedProducts,
        breadcrumbs:[
            {text:"Home",url:"/"},
            {text:"DogSupplies",url:"/dog-supplies"},
            {text:"ProductDetails",url:"/use/ProuctDetailsOfDog"}
        ]
      });
    } catch (error) {
      res.status(400).render("error",{message:"ERROR occurs in productDetails"});
    }
  };
  
// small pets section 

const loadSmallPetsSupplies = async (req, res) => {
    try {
      let page = parseInt(req.query.page) || 1 ;
      let limit = 9 ;
      let skip = (page-1)*limit;
      
        const user = req.session.user;
        const userData = await User.findById(user); // Correcting the query to find user by ID
        const ParentSmallPets = await ParentCategory.findOne({name:"SmallPets "});
        
        if(!ParentSmallPets){
        }
       

        const categories = await Category.find({ isListed: true ,parent:ParentSmallPets._id }); 
        const categoryIds = categories.map((category) => category._id.toString());
        const categoreiesWithId = categories.map(category => ({ _id: category._id, name: category.name }));
        
        // Find products only in these categories
        let totalProducts = await Product.countDocuments({category: { $in: categoryIds }});
        const products = await Product.find({
            isBlocked: false,
            category: { $in: categoryIds },
            quantity: { $gte: 0 }
        })
        .skip(skip)
        .limit(limit)
        .sort({createdAt:-1});

        res.render("smallPetsSupplies", {
            user: userData,
            category: categoreiesWithId,
            // product: products,
            parent:ParentSmallPets._id ,
            totalPage:Math.ceil(totalProducts/limit),
            currentPage:page,
            breadcrumbs: [
                { text: "Home", url: "/" },
                { text: "SmallPetsSupplies", url: "/smallpets-supplies" }
            ]
        });

    } catch (error) {
        res.status(400).render("error", { message: "An error occurred in loadSmallPetsSupplies" });
    }
};


const fillterCategoryOfSmallPets = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = 9;
    let skip = (page - 1) * limit;
    const user = req.session.user;
    let category = req.query.category || "";
    let sorted;
    let sort = req.query.sort;
    let search = req.query.search;
   
    const query = {
        isBlocked: false,
        quantity: { $gte: 0 },
        name: { $regex: search, $options: "i" },
    };

    if (category) {
        let parentCategory = await ParentCategory.findById(category);
        if (parentCategory) {
            let subcategories = await Category.find({ parent: parentCategory._id, isListed: true });
            let subcategoryIds = subcategories.map((subcategory) => subcategory._id);
            query.category = { $in: subcategoryIds };
        } else {
            let specificCategory = await Category.findOne({ _id: category, isListed: true });
            if (specificCategory) {
                query.category = specificCategory._id;
            }
        }
    }

    if (sort === "high-low") {
        sorted = { salePrice: -1 };
    } else if (sort === "low-high") {
        sorted = { salePrice: 1 };
    } else if (sort === "a-z") {
        sorted = { name: 1 };
    } else if (sort === "z-a") {
        sorted = { name: -1 };
    }

    const findProducts = await Product.find(query).sort(sorted).skip(skip).limit(limit).lean();
    let totalProducts = await Product.countDocuments(query);
    const currentProducts = findProducts;

    let userData = null;
    if (user) {
        userData = await User.findOne({ _id: user });
    }

    const ParentDog = await ParentCategory.findOne({ name: "SmallPets" });
    const cat = await Category.find({ isListed: true, parent: ParentDog._id });

    res.status(200).json({
        product: currentProducts,
        category: cat,
        user: userData,
        totalPage: Math.ceil(totalProducts / limit),
        currentPage: page,
        breadcrumbs: [
            { text: "Home", url: "/" },
            { text: "DogSupplies", url: "/dog-supplies" },
        ],
    });
} catch (error) {
    res.status(500).render("error", { message: "Error in Filtering the category" });
}
  };

  
  const ProuctDetailsOfSmallPets = async(req, res) => {
    try {
      const userId = req.session.user;
      const userData = await User.findById(userId);
  
      const productId = req.query.product;
      const product = await Product.findById(productId); 
  
      if (!product) {
        // Handle the case where the product is not found
        return res.status(404).send("Product not found");
      }

      const relatedProducts = await Product.find({
        category:product.category,
        _id:{$ne:productId},
      }).limit(4);
  
      // Ensure that the product has the properties before rendering
      res.render("productDetail", {
        user: userData,
        Product: product,
        Quantity: product.quantity || 0,  // Default to 0 if quantity is missing
        Offer: product.Offer || "No Offer" ,
        Related:relatedProducts,
        breadcrumbs:[
            {text:"Home",url:"/"},
            {text:"SmallPetsSupplies",url:"/smallpets-supplies"},
            {text:"ProductDetailsOfSmallPets",url:"/use/ProuctDetailsOfSmallPets"}
        ]
      });
    } catch (error) {
      res.status(400).render("error",{message:"ERROR occurs in productDetails"});
    }
  };
  
//   petbird - section 

const loadPetBirdSupplies = async (req, res) => {
    try {
      let page = parseInt(req.query.page) || 1;
      let limit = 9;
      let skip = (page -1)*limit;
      
        const user = req.session.user;
        const userData = await User.findById(user); // Correcting the query to find user by ID
        const ParentPetBird = await ParentCategory.findOne({name:"PetBirds"});
        
        if(!ParentPetBird){
        }
        

        const categories = await Category.find({ isListed: true ,parent:ParentPetBird._id }); 
        const categoryIds = categories.map((category) => category._id.toString());
        const categoreiesWithId = categories.map(category => ({ _id: category._id, name: category.name }));
        
        // Find products only in these categories
        let totalProducts = await Product.countDocuments({ category: { $in: categoryIds }});
        const products = await Product.find({
            isBlocked: false,
            category: { $in: categoryIds },
            quantity: { $gte: 0 }
        })
        .skip(skip)
        .limit(limit)
        .sort({createdAt:-1});

        res.render("petBirdsSupplies", {
            user: userData,
            category: categoreiesWithId,
            // product: products,
            currentPage:page,
            parent:ParentPetBird._id,
            totalPage:Math.ceil(totalProducts/limit),
            breadcrumbs: [
                { text: "Home", url: "/" },
                { text: "PetBirdSupplies", url: "/petbird-supplies" }
            ]
        });

    } catch (error) {
        res.status(400).render("error", { message: "An error occurred in loadSmallPetsSupplies" });
    }
};


const fillterCategoryOfPetBird = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = 9;
    let skip = (page - 1) * limit;
    const user = req.session.user;
    let category = req.query.category || "";
    let sorted;
    let sort = req.query.sort;
    let search = req.query.search;
    
    const query = {
        isBlocked: false,
        quantity: { $gte: 0 },
        name: { $regex: search, $options: "i" },
    };

    if (category) {
        let parentCategory = await ParentCategory.findById(category);
        if (parentCategory) {
            let subcategories = await Category.find({ parent: parentCategory._id, isListed: true });
            let subcategoryIds = subcategories.map((subcategory) => subcategory._id);
            query.category = { $in: subcategoryIds };
        } else {
            let specificCategory = await Category.findOne({ _id: category, isListed: true });
            if (specificCategory) {
                query.category = specificCategory._id;
            }
        }
    }

    if (sort === "high-low") {
        sorted = { salePrice: -1 };
    } else if (sort === "low-high") {
        sorted = { salePrice: 1 };
    } else if (sort === "a-z") {
        sorted = { name: 1 };
    } else if (sort === "z-a") {
        sorted = { name: -1 };
    }else{
      sorted = {createdAt:-1};
    }

    const findProducts = await Product.find(query).sort(sorted).skip(skip).limit(limit).lean();
    let totalProducts = await Product.countDocuments(query);
    const currentProducts = findProducts;

    let userData = null;
    if (user) {
        userData = await User.findOne({ _id: user });
    }

    const ParentDog = await ParentCategory.findOne({ name: "PetBirds" });
    const cat = await Category.find({ isListed: true, parent: ParentDog._id });

    res.status(200).json({
        product: currentProducts,
        category: cat,
        user: userData,
        totalPage: Math.ceil(totalProducts / limit),
        currentPage: page,
        breadcrumbs: [
            { text: "Home", url: "/" },
            { text: "DogSupplies", url: "/dog-supplies" },
        ],
    });
} catch (error) {
    res.status(500).render("error", { message: "Error in Filtering the category" });
}
  };

  
  const ProuctDetailsOfPetBird = async(req, res) => {
    try {
      const userId = req.session.user;
      const userData = await User.findById(userId);
  
      const productId = req.query.product;
      const product = await Product.findById(productId); 
  
      if (!product) {
        // Handle the case where the product is not found
        return res.status(404).send("Product not found");
      }

      const relatedProducts = await Product.find({
        category:product.category,
        _id:{$ne:productId},
      }).limit(4);
  
      // Ensure that the product has the properties before rendering
      res.render("productDetail", {
        user: userData,
        Product: product,
        Quantity: product.quantity || 0,  // Default to 0 if quantity is missing
        Offer: product.Offer || "No Offer" ,
        Related:relatedProducts,
        breadcrumbs:[
            {text:"Home",url:"/"},
            {text:"PetBirdSupplies",url:"/petbird-supplies"},
            {text:"ProductDetailsOfPetBird",url:"/use/ProuctDetailsOfPetBird"}
        ]
      });
    } catch (error) {
      res.status(400).render("error",{message:"ERROR occurs in productDetails"});
    }
  };
  
//   fish section 

  
const loadFishSupplies = async (req, res) => {
    try {
      let page = parseInt(req.query.page) || 1 ;
      let limit = 9 ;
       let skip = (page -1)*limit ;
      const user = req.session.user;
        const userData = await User.findById(user); // Correcting the query to find user by ID
        const ParentFish = await ParentCategory.findOne({name:"Fish"});
        
        if(!ParentFish){
        }
        
       
        const categories = await Category.find({ isListed: true ,parent:ParentFish._id }); 
        const categoryIds = categories.map((category) => category._id.toString());
        const categoreiesWithId = categories.map(category => ({ _id: category._id, name: category.name }));
        
        // Find products only in these categories
        let totalProducts = await Product.countDocuments({category: { $in: categoryIds }});
        const products = await Product.find({
            isBlocked: false,
            category: { $in: categoryIds },
            quantity: { $gte: 0 }
        })
        .skip(skip)
        .limit(limit)
        .sort({createdAt:-1});
        res.render("fishSupplies", {
            user: userData,
            category: categoreiesWithId,
            // product: products,
            currentPage:page,
            parent:ParentFish._id ,
            totalPage:Math.ceil(totalProducts/limit),
            breadcrumbs: [
                { text: "Home", url: "/" },
                { text: "FishSupplies", url: "/fish-supplies" }
            ]
        });

    } catch (error) {
        res.status(400).render("error", { message: "An error occurred in loadFishSupplies" });
    }
};


const fillterCategoryOfFish = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = 9;
    let skip = (page - 1) * limit;
    const user = req.session.user;
    let category = req.query.category || "";
    let sorted;
    let sort = req.query.sort;
    let search = req.query.search;
    
    const query = {
        isBlocked: false,
        quantity: { $gte: 0 },
        name: { $regex: search, $options: "i" },
    };

    if (category) {
        let parentCategory = await ParentCategory.findById(category);
        if (parentCategory) {
            let subcategories = await Category.find({ parent: parentCategory._id, isListed: true });
            let subcategoryIds = subcategories.map((subcategory) => subcategory._id);
            query.category = { $in: subcategoryIds };
        } else {
            let specificCategory = await Category.findOne({ _id: category, isListed: true });
            if (specificCategory) {
                query.category = specificCategory._id;
            }
        }
    }

    if (sort === "high-low") {
        sorted = { salePrice: -1 };
    } else if (sort === "low-high") {
        sorted = { salePrice: 1 };
    } else if (sort === "a-z") {
        sorted = { name: 1 };
    } else if (sort === "z-a") {
        sorted = { name: -1 };
    }else{
      sorted = {createdAt:-1};
    }

    const findProducts = await Product.find(query).sort(sorted).skip(skip).limit(limit).lean();
    let totalProducts = await Product.countDocuments(query);
    const currentProducts = findProducts;

    let userData = null;
    if (user) {
        userData = await User.findOne({ _id: user });
    }

    const ParentDog = await ParentCategory.findOne({ name: "Fish" });
    const cat = await Category.find({ isListed: true, parent: ParentDog._id });

    res.status(200).json({
        product: currentProducts,
        category: cat,
        user: userData,
        totalPage: Math.ceil(totalProducts / limit),
        currentPage: page,
        breadcrumbs: [
            { text: "Home", url: "/" },
            { text: "DogSupplies", url: "/dog-supplies" },
        ],
    });
} catch (error) {
    res.status(500).render("error", { message: "Error in Filtering the category" });
}
  };

  
  const ProuctDetailsOfFish = async(req, res) => {
    try {
      const userId = req.session.user;
      const userData = await User.findById(userId);
  
      const productId = req.query.product;
      const product = await Product.findById(productId); 
  
      if (!product) {
        // Handle the case where the product is not found
        return res.status(404).send("Product not found");
      }

      const relatedProducts = await Product.find({
        category:product.category,
        _id:{$ne:productId},
      }).limit(4);
  
      // Ensure that the product has the properties before rendering
      res.render("productDetail", {
        user: userData,
        Product: product,
        Quantity: product.quantity || 0,  // Default to 0 if quantity is missing
        Offer: product.Offer || "No Offer" ,
        Related:relatedProducts,
        breadcrumbs:[
            {text:"Home",url:"/"},
            {text:"FishSupplies",url:"/fish-supplies"},
            {text:"ProductDetailsOfFish",url:"/use/ProuctDetailsOfFish"}
        ]
      });
    } catch (error) {
      res.status(400).render("error",{message:"ERROR occurs in productDetails"});
    }
  };

  // Accessoreis
  const loadAccessories = async (req, res) => {
    try {
      let page = parseInt(req.query.page) || 1 ;
      let limit = 9 ;
      let skip = (page-1)*limit;
        // Fetch user session details
        const user = req.session.user;
        const userData = await User.findById(user);

        // Define accessory categories
        const accessoryCategories = [
            "CatAccessories",
            "DogAccessories",
            "SmallPets Accessories",
            "PetBirds Accessories",
            "FishAccessories "  
        ];
            
        // Fetch categories matching the accessory names and ensure they are listed
        const categories = await Category.find({
            isListed: true,
            name: { $in: accessoryCategories }
        });
       

        // Extract category IDs and names for frontend use
        const categoryIds = categories.map(category => category._id.toString());
        const categoriesWithId = categories.map(category => ({
            _id: category._id,
            name: category.name
        }));

        // Fetch products in the filtered categories, ensuring availability and not blocked
        let totalProducts = await Product.countDocuments({category: { $in: categoryIds }});
        const products = await Product.find({
            isBlocked: false,
            category: { $in: categoryIds },
            quantity: { $gte: 0 }    
        })
        .skip(skip)
        .limit(limit)
        .sort({createdAt:-1});

        // Render the Accessories page
        res.render("accessories", {
            user: userData,
            category: categoriesWithId,
            // product: products,
            allProduct:categoryIds.toString(),
            totalPage:Math.ceil(totalProducts/limit),
            currentPage:page,
            breadcrumbs: [
                { text: "Home", url: "/" },
                { text: "Accessories", url: "/Accessories" }
            ]
        });
    } catch (error) {
        res.status(500).send("An error occurred while loading the accessories page.");
    }
};


const fillterCategoryOfAccessories = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = 9;
    let skip = (page - 1) * limit;
    const user = req.session.user;
    let category = req.query.category;
    let sort = req.query.sort;
    let sorted;
    let search = req.query.search || ""; // Ensure search defaults to an empty string

    // Convert category string to an array of ObjectIds, if provided
    let categoryIds = [];
    if (category) {
      if (category.includes(",")) {
        categoryIds = category.split(","); // Split into an array
      } else {
        categoryIds.push(category); // Single category
      }
    }

    // Build query for products
    const query = {
      isBlocked: false,
      quantity: { $gte: 0 },
      name: { $regex: search, $options: "i" },
    };

    if (sort === "high-low") {
      sorted = { salePrice: -1 };
    } else if (sort === "low-high") {
      sorted = { salePrice: 1 };
    } else if (sort === "a-z") {
      sorted = { name: 1 };
    } else if (sort === "z-a") {
      sorted = { name: -1 };
    }else{
      sorted = {createdAt:-1};
    }

    if (categoryIds.length > 0) {
      query.category = { $in: categoryIds };
    }

    // Fetch and sort products
    const totalProducts = await Product.countDocuments(query);
    const findProducts = await Product.find(query).sort(sorted).skip(skip).limit(limit).lean();

    // Fetch user data if logged in
    let userData = null;
    if (user) {
      userData = await User.findOne({ _id: user });
    }

    // Fetch accessory categories
    const accessoryCategories = [
      "CatAccessories",
      "DogAccessories",
      "SmallPets Accessories",
      "PetBirds Accessories",
      "FishAccessories " 
    ];

    const categories = await Category.find({
      isListed: true,
      name: { $in: accessoryCategories },
    });

    // Render the response
    res.status(200).json({
      product: findProducts,
      category: categories,
      user: userData,
      currentPage: page,
      totalPage: Math.ceil(totalProducts / limit),
      breadcrumbs: [
        { text: "Home", url: "/" },
        { text: "Accessories", url: "/accessories" },
      ],
    });
  } catch (error) {
    console.log(error)
    res.status(500).render("error", { message: "Error in filtering the category" });
  }
};



const ProuctDetailsOfAccessories = async(req, res) => {
  try {
    const userId = req.session.user;
    const userData = await User.findById(userId);

    const productId = req.query.product;
    const product = await Product.findById(productId); 

    if (!product) {
      // Handle the case where the product is not found
      return res.status(404).send("Product not found");
    }

    const relatedProducts = await Product.find({
      category:product.category,
      _id:{$ne:productId},
    }).limit(4);

    // Ensure that the product has the properties before rendering
    res.render("productDetail", {
      user: userData,
      Product: product,
      Quantity: product.quantity || 0,  // Default to 0 if quantity is missing
      Offer: product.Offer || "No Offer" ,
      Related:relatedProducts,
      breadcrumbs:[
          {text:"Home",url:"/"},
          {text:"accessories",url:"/accessories"},
          {text:"ProuctDetailsOfAccessories",url:"/ProuctDetailsOfAccessories"}
      ]
    });
  } catch (error) {
    res.status(400).render("error",{message:"ERROR occurs in productDetails"});
  }
};

// treats                       

  
const loadTreats = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = 9;
    let skip = (page -1)*limit;
    
     // Fetch user session details
     const user = req.session.user;
     const userData = await User.findById(user);

     // Define accessory categories
     const treatCategories = [
         "CatTreat",
         "DogTreat",
         "SmallPets Treat ",
         "PetBirds Treat",
         "FishTreat"  
     ];
         
     // Fetch categories matching the accessory names and ensure they are listed
     const categories = await Category.find({
         isListed: true,
         name: { $in: treatCategories }
     });

     // Extract category IDs and names for frontend use
     const categoryIds = categories.map(category => category._id.toString());
     const categoriesWithId = categories.map(category => ({
         _id: category._id,
         name: category.name
     }));
    

     // Fetch products in the filtered categories, ensuring availability and not blocked
     let totalProducts = await Product.countDocuments({category: { $in: categoryIds }})
     const products = await Product.find({
         isBlocked: false,
         category: { $in: categoryIds },
         quantity: { $gte: 0 }    
     })
     .skip(skip)
     .limit(limit)
     .sort({createdAt:-1});

     // Render the Accessories page
     res.render("treat", {
         user: userData,
         category: categoriesWithId,
        //  product: products,
         currentPage:page,
         allProduct:categoryIds,
         totalPage:Math.ceil(totalProducts/limit),
         breadcrumbs: [
             { text: "Home", url: "/" },
             { text: "Treats", url: "/Treats" }
         ]
     });
  } catch (error) {
      res.status(400).render("error", { message: "An error occurred in loadFishTreat" });
  }
};


const fillterCategoryOfTreats = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = 9;
    let skip = (page - 1) * limit;
    const user = req.session.user;
    let category = req.query.category;
    let sort = req.query.sort;
    let sorted;
    let search = req.query.search || ""; // Ensure search defaults to an empty string

    // Convert category string to an array of ObjectIds, if provided
    let categoryIds = [];
    if (category) {
      if (category.includes(",")) {
        categoryIds = category.split(","); // Split into an array
      } else {
        categoryIds.push(category); // Single category
      }
    }

    // Build query for products
    const query = {
      isBlocked: false,
      quantity: { $gte: 0 },
      name: { $regex: search, $options: "i" },
    };

    if (sort === "high-low") {
      sorted = { salePrice: -1 };
    } else if (sort === "low-high") {
      sorted = { salePrice: 1 };
    } else if (sort === "a-z") {
      sorted = { name: 1 };
    } else if (sort === "z-a") {
      sorted = { name: -1 };
    }else{
      sorted = {createdAt:-1};
    }

    if (categoryIds.length > 0) {
      query.category = { $in: categoryIds };
    }

    // Fetch and sort products
    const totalProducts = await Product.countDocuments(query);
    const findProducts = await Product.find(query).sort(sorted).skip(skip).limit(limit).lean();

    // Fetch user data if logged in
    let userData = null;
    if (user) {
      userData = await User.findOne({ _id: user });
    }

    // Fetch accessory categories
    const accessoryCategories = [     
      "CatTreat",
      "DogTreat",
      "SmallPets Treat ",
      "PetBirds Treat",
      "FishTreat"  

    ];

    const categories = await Category.find({
      isListed: true,
      name: { $in: accessoryCategories },
    });

    // Render the response
    res.status(200).json({
      product: findProducts,
      category: categories,
      user: userData,
      currentPage: page,
      totalPage: Math.ceil(totalProducts / limit),
      breadcrumbs: [
        { text: "Home", url: "/" },
        { text: "Accessories", url: "/accessories" },
      ],
    });
  } catch (error) {
    res.status(500).render("error", { message: "Error in filtering the category" });
  }
};


const ProuctDetailsOfTreats = async(req, res) => {
  try {
    const userId = req.session.user;
    const userData = await User.findById(userId);

    const productId = req.query.product;
    const product = await Product.findById(productId); 

    if (!product) {
      // Handle the case where the product is not found
      return res.status(404).send("Product not found");
    }

    const relatedProducts = await Product.find({
      category:product.category,
      _id:{$ne:productId},
    }).limit(4);

    // Ensure that the product has the properties before rendering
    res.render("productDetail", {
      user: userData,
      Product: product,
      Quantity: product.quantity || 0,  // Default to 0 if quantity is missing
      Offer: product.Offer || "No Offer" ,
      Related:relatedProducts,
      breadcrumbs:[
          {text:"Home",url:"/"},
          {text:"treats",url:"/treat"},
          {text:"ProuctDetailsOfTreats",url:"/ProuctDetailsOfTreats"}
      ]
    });
  } catch (error) {
    res.status(400).render("error",{message:"ERROR occurs in productDetails"});
  }
};

// toys


const loadToys = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = 9;
    let skip = (page - 1) * limit;
    
     // Fetch user session details
     const user = req.session.user;
     const userData = await User.findById(user);

     // Define accessory categories
     const ToysCategories = [
         "CatToys",
         "DogToys ",
         "SmallPets Toys",
         "PetBirds Toys"  
     ];
         
     // Fetch categories matching the accessory names and ensure they are listed
     const categories = await Category.find({
         isListed: true,
         name: { $in: ToysCategories }
     });

     // Extract category IDs and names for frontend use
     const categoryIds = categories.map(category => category._id.toString());
     const categoriesWithId = categories.map(category => ({
         _id: category._id,
         name: category.name
     }));
    

     // Fetch products in the filtered categories, ensuring availability and not blocked
     let totalProducts = await Product.countDocuments({category: { $in: categoryIds }});
     const products = await Product.find({
         isBlocked: false,
         category: { $in: categoryIds },
         quantity: { $gte: 0 }    
     })
     .skip(skip)
     .limit(limit)
     .sort({createdAt:-1});

     // Render the Accessories page
     res.render("toys", {
         user: userData,
         category: categoriesWithId,
        //  product: products,
         allProduct:categoryIds,
         totalPage:Math.ceil(totalProducts/limit),
         currentPage:page,
         breadcrumbs: [
             { text: "Home", url: "/" },
             { text: "Toys", url: "/toys" }
         ]
     });
  } catch (error) {
      res.status(400).render("error", { message: "An error occurred in loadFishTreat" });
  }
};


const fillterCategoryOfToys = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = 9;
    let skip = (page - 1) * limit;
    const user = req.session.user;
    let category = req.query.category;
    let sort = req.query.sort;
    let sorted;
    let search = req.query.search || ""; // Ensure search defaults to an empty string

    // Convert category string to an array of ObjectIds, if provided
    let categoryIds = [];
    if (category) {
      if (category.includes(",")) {
        categoryIds = category.split(","); // Split into an array
      } else {
        categoryIds.push(category); // Single category
      }
    }

    // Build query for products
    const query = {
      isBlocked: false,
      quantity: { $gte: 0 },
      name: { $regex: search, $options: "i" },
    };

    if (sort === "high-low") {
      sorted = { salePrice: -1 };
    } else if (sort === "low-high") {
      sorted = { salePrice: 1 };
    } else if (sort === "a-z") {
      sorted = { name: 1 };
    } else if (sort === "z-a") {
      sorted = { name: -1 };
    }else{
      sorted = {createdAt:-1};
    }

    if (categoryIds.length > 0) {
      query.category = { $in: categoryIds };
    }

    // Fetch and sort products
    const totalProducts = await Product.countDocuments(query);
    const findProducts = await Product.find(query).sort(sorted).skip(skip).limit(limit).lean();

    // Fetch user data if logged in
    let userData = null;
    if (user) {
      userData = await User.findOne({ _id: user });
    }

    // Fetch accessory categories
    const ToysCategories = [
      "CatToys",
      "DogToys ",
      "SmallPets Toys",
      "PetBirds Toys"  

    ];

    const categories = await Category.find({
      isListed: true,
      name: { $in: ToysCategories },
    });

    // Render the response
    res.status(200).json({
      product: findProducts,
      category: categories,
      user: userData,
      currentPage: page,
      totalPage: Math.ceil(totalProducts / limit),
      breadcrumbs: [
        { text: "Home", url: "/" },
        { text: "Accessories", url: "/accessories" },
      ],
    });
  } catch (error) {
    res.status(500).render("error", { message: "Error in filtering the category" });
  }
};

const ProuctDetailsOfToys = async(req, res) => {
  try {
    const userId = req.session.user;
    const userData = await User.findById(userId);

    const productId = req.query.product;
    const product = await Product.findById(productId); 

    if (!product) {
      // Handle the case where the product is not found
      return res.status(404).send("Product not found");
    }

    const relatedProducts = await Product.find({
      category:product.category,
      _id:{$ne:productId},
    }).limit(4);

    // Ensure that the product has the properties before rendering
    res.render("productDetail", {
      user: userData,
      Product: product,
      Quantity: product.quantity || 0,  // Default to 0 if quantity is missing
      Offer: product.Offer || "No Offer" ,
      Related:relatedProducts,
      breadcrumbs:[
          {text:"Home",url:"/"},
          {text:"Toys",url:"/toys"},
          {text:"ProuctDetailsOfToys",url:"/ProuctDetailsOfToys"}
      ]
    });
  } catch (error) {
    res.status(400).render("error",{message:"ERROR occurs in productDetails"});
  }
};
// food 


const loadFood = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = 9;
    let skip = (page-1 )*limit;
  
     // Fetch user session details
     const user = req.session.user;
     const userData = await User.findById(user);

     // Define accessory categories
     const FoodCategories = [
         "CatFood",
         "DogFood",
         "SmallPets Food ",
         "PetBirds Food",
         "FishFood"  
     ];
         
     // Fetch categories matching the accessory names and ensure they are listed
     const categories = await Category.find({
         isListed: true,
         name: { $in: FoodCategories }
     });

     // Extract category IDs and names for frontend use
     const categoryIds = categories.map(category => category._id.toString());
     const categoriesWithId = categories.map(category => ({
         _id: category._id,
         name: category.name
     }));
     

     // Fetch products in the filtered categories, ensuring availability and not blocked
     let totalProducts = await Product.countDocuments({ category: { $in: categoryIds }});
     const products = await Product.find({
         isBlocked: false,
         category: { $in: categoryIds },
         quantity: { $gte: 0 }    
     })
     .skip(skip)
     .limit(limit)
     .sort({createdAt:-1});

     // Render the Accessories page
     res.render("food", {
         user: userData,
         category: categoriesWithId,
        //  product: products,
         allProduct:categoryIds,
         totalPage:Math.ceil(totalProducts/limit),
         currentPage:page,
         breadcrumbs: [
             { text: "Home", url: "/" },
             { text: "Food", url: "/food" }
         ]
     });
  } catch (error) {
      res.status(400).render("error", { message: "An error occurred in loadFishTreat" });
  }
};


const fillterCategoryOfFood = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = 9;
    let skip = (page - 1) * limit;
    const user = req.session.user;
    let category = req.query.category;
    let sort = req.query.sort;
    let sorted;
    let search = req.query.search || ""; // Ensure search defaults to an empty string

    // Convert category string to an array of ObjectIds, if provided
    let categoryIds = [];
    if (category) {
      if (category.includes(",")) {
        categoryIds = category.split(","); // Split into an array
      } else {
        categoryIds.push(category); // Single category
      }
    }

    // Build query for products
    const query = {
      isBlocked: false,
      quantity: { $gte: 0 },
      name: { $regex: search, $options: "i" },
    };

    if (sort === "high-low") {
      sorted = { salePrice: -1 };
    } else if (sort === "low-high") {
      sorted = { salePrice: 1 };
    } else if (sort === "a-z") {
      sorted = { name: 1 };
    } else if (sort === "z-a") {
      sorted = { name: -1 };
    }else{
      sorted = {createdAt:-1};
    }

    if (categoryIds.length > 0) {
      query.category = { $in: categoryIds };
    }

    // Fetch and sort products
    const totalProducts = await Product.countDocuments(query);
    const findProducts = await Product.find(query).sort(sorted).skip(skip).limit(limit).lean();

    // Fetch user data if logged in
    let userData = null;
    if (user) {
      userData = await User.findOne({ _id: user });
    }

    // Fetch accessory categories
    const FoodCategories = [
      "CatFood",
      "DogFood",
      "SmallPets Food ",
      "PetBirds Food",
      "FishFood"  
    ];

    const categories = await Category.find({
      isListed: true,
      name: { $in: FoodCategories },
    });

    // Render the response
    res.status(200).json({
      product: findProducts,
      category: categories,
      user: userData,
      currentPage: page,
      totalPage: Math.ceil(totalProducts / limit),
      breadcrumbs: [
        { text: "Home", url: "/" },
        { text: "Accessories", url: "/accessories" },
      ],
    });
  } catch (error) {
    res.status(500).render("error", { message: "Error in filtering the category" });
  }
};


const ProuctDetailsOfFood = async(req, res) => {
  try {
    const userId = req.session.user;
    const userData = await User.findById(userId);

    const productId = req.query.product;
    const product = await Product.findById(productId); 

    if (!product) {
      // Handle the case where the product is not found
      return res.status(404).send("Product not found");
    }

    const relatedProducts = await Product.find({
      category:product.category,
      _id:{$ne:productId},
    }).limit(4);

    // Ensure that the product has the properties before rendering
    res.render("productDetail", {
      user: userData,
      Product: product,
      Quantity: product.quantity || 0,  // Default to 0 if quantity is missing
      Offer: product.Offer || "No Offer" ,
      Related:relatedProducts,
      breadcrumbs:[
          {text:"Home",url:"/"},
          {text:"Food",url:"/food"},
          {text:"ProuctDetailsOfFood",url:"/ProuctDetailsOfFood"}
      ]
    });
  } catch (error) {
    res.status(400).render("error",{message:"ERROR occurs in productDetails"});
  }
}

const filterDogSupplies = async(req,res)=>{
  try {
    const searchTerm = req.query.search;

    const userId = req.session.user;
    const userData = await User.findById(userId); // Correcting the query to find user by ID
    const ParentCat = await ParentCategory.findOne({ name: "Dog" });

    if (!ParentCat) {
      return res.status(404).json({ message: "ParentCategory not found" });
    }

    const categories = await Category.find({ isListed: true, parent: ParentCat._id });
    const categoryIds = categories.map((category) => category._id.toString());
    const categoreiesWithId = categories.map(category => ({ _id: category._id, name: category.name }));


    const products = await Product.find({
      isBlocked: false,
      category: { $in: categoryIds },
      quantity: { $gte: 0 },
      name:{$regex:searchTerm,$options:"i"}, // Apply the search condition here
    }).sort({ createdAt: -1 }); // Apply your sorting logic here if needed


    res.status(200).json({
      user: userData,
      category: categoreiesWithId,
      product: products,
      breadcrumbs: [
        { text: "Home", url: "/" },
        { text: "DogSupplies", url: "/dog-supplies" },
      ],
    });

  } catch (error) {
    res.status(500).json({ message: "An error occurred in filterDogSupplies" });
  }
}

const filterFishSupplies = async(req,res)=>{
  try {
    const searchTerm = req.query.search;

    const userId = req.session.user;
    const userData = await User.findById(userId); // Correcting the query to find user by ID
    const ParentCat = await ParentCategory.findOne({ name: "Fish" });

    if (!ParentCat) {
      return res.status(404).json({ message: "ParentCategory not found" });
    }

    const categories = await Category.find({ isListed: true, parent: ParentCat._id });
    const categoryIds = categories.map((category) => category._id.toString());
    const categoreiesWithId = categories.map(category => ({ _id: category._id, name: category.name }));


    const products = await Product.find({
      isBlocked: false,
      category: { $in: categoryIds },
      quantity: { $gte: 0 },
      name:{$regex:searchTerm,$options:"i"}, // Apply the search condition here
    }).sort({ createdAt: -1 }); // Apply your sorting logic here if needed


    res.status(200).json({
      user: userData,
      category: categoreiesWithId,
      product: products,
      breadcrumbs: [
        { text: "Home", url: "/" },
        { text: "FishSupplies", url: "/fish-supplies" },
      ],
    });

  } catch (error) {
    res.status(500).json({ message: "An error occurred in filterDogSupplies" });
  }
}

const filterPetBirdSupplies = async(req,res)=>{
  try {
    const searchTerm = req.query.search;

    const userId = req.session.user;
    const userData = await User.findById(userId); // Correcting the query to find user by ID
    const ParentCat = await ParentCategory.findOne({ name: "PetBirds" });

    if (!ParentCat) {
      return res.status(404).json({ message: "ParentCategory not found" });
    }

    const categories = await Category.find({ isListed: true, parent: ParentCat._id });
    const categoryIds = categories.map((category) => category._id.toString());
    const categoreiesWithId = categories.map(category => ({ _id: category._id, name: category.name }));


    const products = await Product.find({
      isBlocked: false,
      category: { $in: categoryIds },
      quantity: { $gte: 0 },
      name:{$regex:searchTerm,$options:"i"}, // Apply the search condition here
    }).sort({ createdAt: -1 }); // Apply your sorting logic here if needed


    res.status(200).json({
      user: userData,
      category: categoreiesWithId,
      product: products,
      breadcrumbs: [
        { text: "Home", url: "/" },
        { text: "PetBirdsSupplies", url: "/petbird-supplies" },
      ],
    });

  } catch (error) {
    res.status(500).json({ message: "An error occurred in filterPetBirdsSupplies" });
  }
}

const filterSmallPetsSupplies = async(req,res)=>{
  try {
    const searchTerm = req.query.search;

    const userId = req.session.user;
    const userData = await User.findById(userId); // Correcting the query to find user by ID
    const ParentCat = await ParentCategory.findOne({ name: "SmallPets" });

    if (!ParentCat) {
      return res.status(404).json({ message: "ParentCategory not found" });
    }

    const categories = await Category.find({ isListed: true, parent: ParentCat._id });
    const categoryIds = categories.map((category) => category._id.toString());
    const categoreiesWithId = categories.map(category => ({ _id: category._id, name: category.name }));


    const products = await Product.find({
      isBlocked: false,
      category: { $in: categoryIds },
      quantity: { $gte: 0 },
      name:{$regex:searchTerm,$options:"i"}, // Apply the search condition here
    }).sort({ createdAt: -1 }); // Apply your sorting logic here if needed


    res.status(200).json({
      user: userData,
      category: categoreiesWithId,
      product: products,
      breadcrumbs: [
        { text: "Home", url: "/" },
        { text: "SmallPetSupplies", url: "/smallPets-supplies" },
      ],
    });

  } catch (error) {
    res.status(500).json({ message: "An error occurred in filterSmallPetsSupplies" });
  }
}

const filterAccessories = async(req,res)=>{
  try {
    const searchTerm = req.query.search;

    const user = req.session.user;
    const userData = await User.findById(user);

        // Define accessory categories
        const accessoryCategories = [
            "CatAccessories",
            "DogAccessories",
            "SmallPetAccessories ",
            "PetBirdAccessories ",
            "FishAccessories "  
        ];
            
        // Fetch categories matching the accessory names and ensure they are listed
        const categories = await Category.find({
            isListed: true,
            name: { $in: accessoryCategories }
        });
        

        // Extract category IDs and names for frontend use
        const categoryIds = categories.map(category => category._id.toString());
        const categoriesWithId = categories.map(category => ({
            _id: category._id,
            name: category.name
        }));

        // Fetch products in the filtered categories, ensuring availability and not blocked
        const products = await Product.find({
            isBlocked: false,
            category: { $in: categoryIds },
            quantity: { $gte: 0 } ,
            name:{$regex:searchTerm,$options:"i"},
        }).sort({createdAt:-1});

        // Render the Accessories page
        res.status(200).json({
            user: userData,
            category: categoriesWithId,
            product: products,
            breadcrumbs: [
                { text: "Home", url: "/" },
                { text: "Accessories", url: "/Accessories" }
            ]
        });
  } catch (error) {
    res.status(500).json({ message: "An error occurred in filterAccessories" });
  }
}

const filterFood = async(req,res)=>{
   try {
    const searchTerm = req.query.search;

    const user = req.session.user;
    const userData = await User.findById(user);

        // Define accessory categories
        const FoodCategories = [
          "CatFood",
          "DogFood",
          "SmallPets Food ",
          "PetBird Food ",
          "Fish Food"  
      ];
            
        // Fetch categories matching the accessory names and ensure they are listed
        const categories = await Category.find({
            isListed: true,
            name: { $in: FoodCategories }
        });
        

        // Extract category IDs and names for frontend use
        const categoryIds = categories.map(category => category._id.toString());
        const categoriesWithId = categories.map(category => ({
            _id: category._id,
            name: category.name
        }));

        // Fetch products in the filtered categories, ensuring availability and not blocked
        const products = await Product.find({
            isBlocked: false,
            category: { $in: categoryIds },
            quantity: { $gte: 0 } ,
            name:{$regex:searchTerm,$options:"i"},
        }).sort({createdAt:-1});

        // Render the Accessories page
        res.status(200).json({
            user: userData,
            category: categoriesWithId,
            product: products,
            breadcrumbs: [
                { text: "Home", url: "/" },
                { text: "Accessories", url: "/Accessories" }
            ]
        });
  } catch (error) {
    res.status(500).json({ message: "An error occurred in filterFoodAccessories" });
  }
}

const filterToys =async(req,res)=>{
  try {
    const searchTerm = req.query.search;

    const user = req.session.user;
    const userData = await User.findById(user);

        // Define accessory categories
        const ToysCategories = [
          "CatToys",
          "DogToys ",
          "SmallPets Toys",
          "PetBird Toys"  
      ];
            
        // Fetch categories matching the accessory names and ensure they are listed
        const categories = await Category.find({
            isListed: true,
            name: { $in: ToysCategories }
        });
        

        // Extract category IDs and names for frontend use
        const categoryIds = categories.map(category => category._id.toString());
        const categoriesWithId = categories.map(category => ({
            _id: category._id,
            name: category.name
        }));

        // Fetch products in the filtered categories, ensuring availability and not blocked
        const products = await Product.find({
            isBlocked: false,
            category: { $in: categoryIds },
            quantity: { $gte: 0 } ,
            name:{$regex:searchTerm,$options:"i"},
        }).sort({createdAt:-1});

        // Render the Accessories page
        res.status(200).json({
            user: userData,
            category: categoriesWithId,
            product: products,
            breadcrumbs: [
                { text: "Home", url: "/" },
                { text: "Toys", url: "/toys" }
            ]
        });
  } catch (error) {
    res.status(500).json({ message: "An error occurred in fillterToys" });
  }
}

const filterTreat =async(req,res)=>{
  try {
    const searchTerm = req.query.search;

    const user = req.session.user;
    const userData = await User.findById(user);

        // Define accessory categories
        const treatCategories = [
          "CatTreat",
          "DogTreat",
          "SmallPets Treat",
          "PetBirds Treat",
          "Fish Treat"  
      ];
            
        // Fetch categories matching the accessory names and ensure they are listed
        const categories = await Category.find({
            isListed: true,
            name: { $in: treatCategories }
        });
        

        // Extract category IDs and names for frontend use
        const categoryIds = categories.map(category => category._id.toString());
        const categoriesWithId = categories.map(category => ({
            _id: category._id,
            name: category.name
        }));

        // Fetch products in the filtered categories, ensuring availability and not blocked
        const products = await Product.find({
            isBlocked: false,
            category: { $in: categoryIds },
            quantity: { $gte: 0 } ,
            name:{$regex:searchTerm,$options:"i"},
        }).sort({createdAt:-1});

        // Render the Accessories page
        res.status(200).json({
            user: userData,
            category: categoriesWithId,
            product: products,
            breadcrumbs: [
                { text: "Home", url: "/" },
                { text: "Treat", url: "/treat" }
            ]
        });
  } catch (error) {
    res.status(500).json({ message: "An error occurred in fillterToys" });
  }
}

module.exports = {
    categoryInfo,
    addCategory,
    deleteCategory,
    deleteParentCategory,
    loadEditCategory,
    editCategory,
    ListCategory,
    ListParentCategory,
    unListCategory,
    unListParentCategory,
    addParentCategory , 
    loadeditParentCategory,
    editParentCategory ,
    loadCatSupplies,
    fillterCategoryOfCat,
    ProuctDetails,
    loadDogSupplies,
    fillterCategoryOfDog ,
    ProuctDetailsOfDog ,
    loadSmallPetsSupplies,
    ProuctDetailsOfSmallPets ,
    fillterCategoryOfSmallPets,  
    loadPetBirdSupplies,
    ProuctDetailsOfPetBird ,
    fillterCategoryOfPetBird, 
    loadFishSupplies,
    ProuctDetailsOfFish,
    fillterCategoryOfFish,
    loadAccessories,
    fillterCategoryOfAccessories,
    ProuctDetailsOfAccessories,
    loadTreats ,
    fillterCategoryOfTreats,
    ProuctDetailsOfTreats,
    loadToys,
    fillterCategoryOfToys,
    ProuctDetailsOfToys,
    loadFood,
    fillterCategoryOfFood,
    ProuctDetailsOfFood,
    // filterCatSupplies,
    filterDogSupplies,
    filterFishSupplies,
    filterPetBirdSupplies,
    filterSmallPetsSupplies,
    filterAccessories,
    filterFood,
    filterToys,
    filterTreat,
    loadAddCategory,
    loadParentCategory,
    loadAddParentCategory
} 