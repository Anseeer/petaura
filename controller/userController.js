const User = require('../model/userSchema'); // Adjust path as needed
const Category = require('../model/categorySchema'); 
const Product = require('../model/productSchema'); 
const Cart = require('../model/cartSchema'); 
const Address = require('../model/addressSchema'); 
const Order = require('../model/orderSchema'); 
const pendingOrder = require('../model/pendingOrderSchema'); 
const Coupen = require('../model/coupenSchema'); 
const Wishlist = require('../model/whishlistSchema'); 
const Wallet = require('../model/walletSchema'); 
const Referral = require('../model/referralSchema'); 
const razorpayInstance = require("../config/razorpay");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const env=require("dotenv").config();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const express = require("express");
const ParentCategory = require('../model/parentCategorySchema');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 

const loadHome = async (req,res)=>{
    try {
        const user = req.session.user ;
        
        if(user){
            const userData =await User.findOne({_id:user});
            if(userData){
                res.render("home",{
                    user:userData,
                    breadcrumbs:[
                        {text:"Home",url:"/"}
                    ]
                });
            }else{
            res.redirect("/");                        
           }
        }else{
            res.render("home",{
                user,
                breadcrumbs:[
                    {text:"Home",url:"/"}
                ]
            })
        }
    } catch (error) {
        res.status(500).render("error",{message:"ERROR OCCURES IN LOADHOME"})
    }
};

// In your backend route (e.g., in a controller or route file)

const getLatestProducts = async (req, res) => {
    try {
      // Fetch the latest 4 products, sorted by creation date (or any other criteria)
      const latestProducts = await Product.find().sort({ createdAT: -1 }).limit(4); // Sort by latest (descending)
      
      res.status(200).json({ success: true, products: latestProducts });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch latest products.' });
    }
  };
  

const loadsignup = async (req,res)=>{
    try {
        res.render("signup");
    } catch (error) {
        res.status(500).render("ERROR OCCURES IN LOADSIGNUP")
    }
};

async function generateOtp() {
    // Generate a random number between 100000 and 999999
    return Math.floor(100000 + Math.random() * 900000);
  }

async function sendVerificationEmail(email,otp){
    try {
        if (!email || email.length === 0) {
            throw new Error("Invalid email provided");
        }

        const transporter = nodemailer.createTransport({
            service:"gmail",
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:process.env.NODEMAILER_EMAIL,
                pass:process.env.NODEMAILER_PASSWORD
            }
        });

        const info = await transporter.sendMail({
            from: `"PetAura Support" <${process.env.NODEMAILER_EMAIL}>`, // Include a friendly sender name
            to: email,
            subject: "Verify Your PetAura Account",
            text: `Welcome to PetAura! 
        
        Thank you for joining us. To complete your registration, please verify your account using the OTP below:
        
        Your OTP: ${otp}
        
        If you didn’t request this, please ignore this email.
        
        Best Regards, 
        The PetAura Team`,
            html: `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                <h2 style="color: #4CAF50;">Welcome to PetAura!</h2>
                <p>Thank you for joining us! To complete your registration, please verify your account using the OTP below:</p>
                <div style="text-align: center; font-size: 20px; font-weight: bold; margin: 20px 0;">
                    Your OTP: <span style="color: #4CAF50;">${otp}</span>
                </div>
                <p>If you didn’t request this, please ignore this email or contact our support team.</p>
                <p>Best Regards,</p>
                <p><strong>The PetAura Team</strong></p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="font-size: 12px; color: #999;">This is an automated message. Please do not reply to this email.</p>
            </div>`
        });
        
        return info.accepted.length > 0 ;

    } catch (error) {
        res.status(400).render("error",{message:"ERROR SENDING EMAIL "});
        return false;
    }
}

const signup = async (req,res)=>{
    try {
        const {name,email,password,phone,refCode} = req.body;
        console.log('hey')
        if (!email || email.trim() === "") {
            return res.render("signup", { message: "Email is required!" });
        }

        const findUser = await User.findOne({email});

        if(findUser){
            return res.render("signup",{message:"Please check your email , the email is already exists !"});
        }

        const otp = await generateOtp();
        const emailSend = await sendVerificationEmail(email,otp);
        if(!emailSend){
            return res.json({ message: "Failed to send email" });
        }

        req.session.userOtp = otp ;
        req.session.userData =  {email,password,phone,name,refCode};

        console.log("OTP sent",otp);
        res.render("otpvarification",{message:"Check your mail,Email successfully send OTP !"});

    } catch (error) {
       res.render("login",{message:"Error occures in login"});
    }
}
function  securePassword(password){
   try {
    const hashed = bcrypt.hash(password,10);
    return hashed ;
   } catch (error) {
   }
}

function generateReferralCode(username) {
    // Normalize username to remove spaces and special characters
    const normalizedUsername = username.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    
    // Generate a unique suffix using timestamp
    const uniqueSuffix = Date.now().toString(36).toUpperCase();

    // Combine normalized username and unique suffix
    return `${normalizedUsername}-${uniqueSuffix}`;
}


const verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        console.log("Received OTP:", otp);

        if (!req.session.userData) {
            return res.status(400).json({ success: false, message: "Session expired. Please try again." });
        }

        if (parseInt(otp) === req.session.userOtp) {
            const user = req.session.userData;
            const passwordHash = await securePassword(user.password);

            const saveUserData = new User({
                name: user.name,
                email: user.email,
                phone: user.phone,
                password: passwordHash,
            });
            await saveUserData.save();
            const wallet = new Wallet({
                userId:saveUserData._id,
                balance:0,
                history:[],
            });

            const referral = new Referral({
                userId:saveUserData._id,
                referralCode:generateReferralCode(saveUserData.name),
                referredUsers:[],
                bonus:0,
            });

            const ref = req.session.userData .refCode;
            if (ref) {
                // Find the referring user's referral document using the refCode
                const refUser = await Referral.findOne({ referralCode: ref });

                if (refUser) {
                    // Add the referred user to the referring user's list
                    await Referral.findOneAndUpdate(
                        { referralCode: ref },
                        {
                            $push: { referredUsers: { userId: saveUserData._id } },
                            $inc :{bonus : 100},
                        },
                        { new: true }
                    );

                    // Find the referring user's wallet
                    const refUserWallet = await Wallet.findOne({ userId: refUser.userId });

                    if (refUserWallet) {
                        // Add the bonus to the referring user's wallet balance
                        refUserWallet.balance += 100;

                        // Add a transaction entry to the referring user's wallet history
                        refUserWallet.history.push({
                            transactionId: generateTransactionId() || `TXN-${Date.now()}`, // Unique transaction ID
                            type: "CREDIT",
                            amount: 100,
                            description: `Referral bonus `,
                            createdAt: new Date(),
                        });

                        // Save the referring user's wallet
                        await refUserWallet.save();
                    }
                }
            }

            // Save the referred user's wallet and referral details
            await wallet.save();
            await referral.save();

            // Set the session and respond
            req.session.user = saveUserData._id;
            res.status(200).json({ success: true });
        } else {
         console.error("Invalid OTP entered",otp);
         res.status(400).json({ success: false, message: "Invalid OTP. Please try again!" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "An error occurred. Please try again later." });
    }
};

const resendOtp = async (req, res) => {
    try {
        const { email } = req.session.userData;

        if (!email) {
            return res.status(400).json({ success: false, message: "Session expired. Please sign up again." });
        }

        const otp = await generateOtp(); // Generate a new OTP
        req.session.userOtp = otp; // Update session with the new OTP
        const sendMail = await sendVerificationEmail(email, otp);

        if (sendMail) {
            console.log("Resent OTP:", otp);
            return res.status(200).json({ success: true, message: "OTP resent successfully!" });
        } else {
            return res.status(500).json({ success: false, message: "Failed to send OTP. Try again later." });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "An unexpected error occurred. Please try again." });
    }

};

const loadlogin = async(req,res)=>{
    try {
        if(req.session.user){
            localStorage.clear(); 
            res.redirect("/")
        }else{
            res.render("login");
        }
    } catch (error) {
        res.status(400).render("error",{message:"ERROR OCCURES IN LOGIN"})
    }
}


const login = async (req, res) => {
    try {
        // Check if the user is already logged in
        if (req.session.user) {
            return res.redirect("/");
        }

        // Destructure the email and password from the request body
        const { email, password } = req.body;

        // Find the user from the database
        const findUser = await User.findOne({ email: email, isAdmin: 0 });

        // If user not found
        if (!findUser) {
            return res.render("login", { message: "The User is Not found" });
        }

        // If user is blocked
        if (findUser.isBlocked) {
            return res.render("login", { message: "Admin Blocked the User" });
        }

        // Log the password received from the form and the stored hashed password for debugging
     

        // Check if the hashed password exists
        if (!findUser.password) {
            return res.render("login", { message: "No password found for this user" });
        }

        // Compare the plaintext password with the hashed password stored in the DB
        const MatchPassword = await bcrypt.compare(password, findUser.password);

        // If the passwords do not match
        if (!MatchPassword) {
            return res.render("login", { message: "Invalid Password" });
        }

        // If login successful, set the session user to the user ID
        req.session.user = findUser._id;

        // Define breadcrumbs or pass an empty array if not needed
        const breadcrumbs = [
            { text: "Home", url: "/" }
        ];

        // Redirect the user to the home page with user and breadcrumbs data
        return res.render("home", { user: findUser, breadcrumbs });

    } catch (error) {
        // Log any errors for debugging

        // Send an error message back to the login page
        return res.render("login", { message: "Failed login, please try again" });
    }
};

const logout = async(req,res)=>{
    try {
        req.session.destroy((err)=>{
            if(err){
                res.send(error.message);
            }
            message = "Logout SuccessFull !";
             res.redirect("/login");
        })
    } catch (error) {
        res.render("error",{message:"Logout Error"});
        
    }
}

const loadShop = async(req,res)=>{
    try {
        res.render("shop"); 
    } catch (error) {
        res.status(400).render("error",{message:"ERROR occures in load shop"});
    }
}


const loadCart = async(req,res)=>{
  try {
    const user= await User.findById(req.session.user);
    const cart = await Cart.findOne({userId:user._id}).populate('items.productId','name salePrice Status Image quantity _id finalPrice'); 
    if(!cart){
        res.render("cart",{user,cart:{items:[]}});
    }
    res.render("cart",{user});
  } catch (error) {
    res.status(400).send("ERROR occures in loadCart ");
  }
}

const fetchCart = async (req, res) => {
    try {
        const user = await User.findById(req.session.user);
        const cart = await Cart.findOne({ userId: user._id }).populate('items.productId', 'name salePrice Image quantity finalPrice').sort({createdAt:-1});
        if (!cart) {
            return res.status(200).json({ success: true, cart: { items: [], totalPrice: 0 } });
        }
        res.status(200).json({ success: true, cart });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to load cart." });
    }
};

const addToCart = async (req, res) => {
    try {
        const { productId } = req.query; 
        const user = req.session.user;


        const findProduct = await Product.findById(productId); 
        if (!findProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const price = findProduct.finalPrice;
        const quantity = 1;
        const status = findProduct.Status;


        const cart = await Cart.findOne({ userId: user });

        if (cart) {
            const existingItem = cart.items.find((items) => items.productId.toString() === productId);
            if (existingItem) {
                // Update existing item's price and quantity
                existingItem.price += price * quantity; 
                if(findProduct.quantity > existingItem.quantity && existingItem.quantity <= findProduct.maxQuantity){
                    existingItem.quantity += quantity;
                }
            } else {
                // Add new item to the cart
                cart.items.push({ productId, price: price * quantity, quantity, status });
            }

            // Recalculate totalPrice
            cart.totalPrice = cart.items.reduce((total, items) => total + items.price, 0);
            await cart.save();

            res.status(200).json({success:true,message:"Added"});
        } else {
            // Create a new cart
            const newCart = new Cart({
                userId: user,
                items: [
                    { productId, quantity, price: price * quantity, status },
                ],
            });

            // Calculate totalPrice for the new cart
            newCart.totalPrice = newCart.items.reduce((total, items) => total + items.price, 0);
            await newCart.save();

        }
    } catch (error) {
        res.status(400).json({ success: false, message: "Failed to add to cart" });
    }
};
    


const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.query; // Destructure productId from query
        const user = req.session.user;

        // Find the cart for the user
        const cart = await Cart.findOne({ userId:user });
        if (!cart) {
            return res.status(400).json({ success: false, message: "Cannot find cart" });
        }

        const product = cart.items.find((item) => item.productId.toString() === productId.toString());

        const productPrice = product.price * product.quantity;

        // Remove the item from the cart
        const updatedCart = await Cart.findOneAndUpdate(
            { userId:user, "items.productId": productId }, // Match user and productId in items
            { $pull: { items: { productId } } , $inc:{totalPrice:-productPrice}},    // Remove matching item
            { new: true }                            // Return updated cart
        );
        

        if (!updatedCart) {
            return res.status(400).json({ success: false, message: "Failed to remove from cart" });
        }

        const datas = await Cart.findOne({ userId:user });
        res.status(200).json({ success: true,datas});
    } catch (error) {
        res.status(400).json({ success: false, message: "Error in removeFromCart" });
    }
};

const laodDetails = async(req,res)=>{
    try {
        const userId = req.session.user;
        const userData = await User.findById(userId);
    
        const productId = req.query.id;
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
              {text:"ProductDetails",url:"/ProuctDetails"}
          ]
        });
    } catch (error) {
        res.status(400).json({success:false,message:"Error in the loadDetails"});
    }
}

const updateCart = async (req, res) => {
    try {
      

        const { productId, currentQty } = req.body;
        const userId = req.session.user;

      

        if (!userId) {
            return res.status(401).json({ success: false, message: "User session not found" });
        }

        const cart = await Cart.findOne({ userId: userId });
        if (!cart) {
            return res.status(400).json({ success: false, message: "Cart not found." });
        }

        const items = cart.items.find((item) => item._id.toString() == productId);
        if (!items) {
            return res.status(400).json({ success: false, message: "Item not found in the cart." });
        }

        const product = await Product.findOne({_id:items.productId});
        if(!product){
            return res.status(400).json({success:false,message:"Cant Find The Product"});
        }else{
            if(currentQty > product.maxQuantity){
                return  res.status(500).json({success:false,message:`The MaxQtyPerUser is :${product.maxQuantity}` });
            }
        }

        items.quantity = currentQty;
        items.price = product.finalPrice * currentQty;
        cart.totalPrice = cart.items.reduce((total,item)=> total+item.price,0);

        await cart.save();

        return res.status(200).json({ success: true, message: "Successfully updated.",cart });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const loadCheckoutPage = async (req, res) => {
    try {
        const user = req.session.user;
        const addressDoc = await Address.findOne({ userId: user });
        const cart = await Cart.findOne({userId:user});
        const coupons = await Coupen.find({ isActive: true, expiredAt: { $gte: new Date() } });
        const address = addressDoc ? addressDoc.addresses : []; // Fallback to empty array if no addresses
        console.log(address);
        res.render("checkout", { user, address ,cart:cart||{totalPrice:0},coupons}); // Pass addresses to the view
    } catch (error) {
        res.status(500).send("Error loading checkout page.");
    } 
};

function generateTransactionId() {
    const timestamp = Date.now().toString();  // Current timestamp in milliseconds
    const randomPart = Math.random().toString(36).substring(2, 10);  // Random string part
    return `TXN-${timestamp}-${randomPart}`;  // Format with a prefix for better readability
}

const placeOrder = async (req, res) => {
    try {
        const { userId, addressId, paymentMethod, subTotal, totalPrice, orderItem, discount ,deliveryFee} = req.body;

        if (!userId || !addressId || !paymentMethod || !subTotal || !totalPrice || !orderItem) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        

        const parsedOrderItems = JSON.parse(orderItem);
        const order = await Order.findOne({ userId });

        parsedOrderItems.forEach((item) => {
            const itemShare = (item.price / totalPrice) * discount; 
        
            item.discount = itemShare.toFixed(2); 
        });
        const product = await Product.findById(orderItem.productId);
        
        for (const item of parsedOrderItems) {
            const product = await Product.findOne({ _id: item.productId });
            if (!product) {
              return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
            }
            if (product.quantity < item.quantity) {
              return res.status(400).json({ success: false, message: `Invalid Stock: ${item.quantity}` });
            }
        }
        
        const productDetails = await Promise.all(
            parsedOrderItems.map(async (item) => {
                // Fetch the product details
                const product = await Product.findById(item.productId);
        
                if (!product) {
                    throw new Error(`Product not found for ID: ${item.productId}`);
                }
        
                return {
                    productId: item.productId,
                    name: product.name, // Now this works because 'product' is properly fetched
                    quantity: item.quantity > 1 ? item.quantity : 1,
                    price: item.price,
                    discount:item.discount,
                    deliveryFee,
                    totalPrice: deliveryFee 
                    ? Math.round((item.price + Number(deliveryFee)) - item.discount) 
                    : Math.round(item.price - item.discount),
                                    image: product.Image[0],
                    status: "pending",
                };
            })
        );
        
       
        if(!productDetails){
        return res.status(500).json({success:false,message:" Invalid Stock"});
        }


        const add = await Address.findOne({ "addresses._id": addressId });
        const address = add.addresses.find((add) => add._id.toString() === addressId);

        const discountValue = discount || 0;
        const delivery = deliveryFee || 0;
        const orderId =  `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

        if(paymentMethod == "Razorpay"){
            try {
                const razorPayOrder = await razorpayInstance.orders.create({
                  amount: Math.round(totalPrice * 100),
                  currency: 'INR',
                  receipt: orderId,
                });
              
                if (!razorPayOrder || !razorPayOrder.id) {
                  return res.status(500).json({ message: 'Failed to create Razorpay order' });
                }
              
                const razorPayOrderId = razorPayOrder.id;
              
                const pendingOrders = new pendingOrder({
                razorPayOrderId,
                  orderId,
                  userId,
                  orderedItems: productDetails.map((item) => {
                    return {
                      product: item.productId,
                      name: item.name,
                      quantity: item.quantity,
                      price: item.price,
                      discount: item.discount,
                      deliveryFee,
                      totalPrice: deliveryFee 
                      ? Math.round((item.price + Number(deliveryFee)) - item.discount) 
                      : Math.round(item.price - item.discount),
                        image: item.image,
                      status: item.status,
                    };
                  }),
                  totalPrice: subTotal,
                  discount: discountValue,
                  deliveryFee:delivery,
                  finalPrice: totalPrice,
                  address: {
                    name: address.name,
                    state: address.state,
                    country: address.country,
                    pincode: address.pincode,
                    phone: address.phone,
                  },
                  paymentMethod: paymentMethod,
                  status: "pending",
                  paymentStatus: "UNPAID",
                });
              
                const savedOrder = await pendingOrders.save();
                
                if (!savedOrder) {
                  return res.status(500).json({ message: 'Failed to save pending order' });
                }
              
                await Cart.findOneAndDelete({ userId });
                 const razorpayKey = process.env.RAZORPAY_KEY;
                res.status(200).json({
                  success: true,
                  message: "Saved To PendingOrders",
                  orderId,
                  razorPayOrderId,
                  razorpayKey,
                  finalPrice: pendingOrders.finalPrice,
                });
              } catch (error) {
               return  res.status(400).json({ success: false, message: "Error in saving to pending orders" });
              }
              
        }else if(paymentMethod === "Wallet"){
           try {
            const wallet = await Wallet.findOne({userId});

            if(!wallet){
                return res.status(400).json({success:false,message:"Cant find the wallet"});
            }

            if( wallet.balance < totalPrice){
               return res.status(400).json({success:false,message:"Insuficent Balance"});
            }
            wallet.balance -=Number(totalPrice);
           
            // Example usage:
            const transactionId = generateTransactionId();
            wallet.history.push({
                transactionId,
                type: "DEBIT",
                amount: totalPrice,
                description: "Order payment",
                date: new Date(), 
            });
             await wallet.save();
            
            const newOrder = new Order({
                orderId,
                userId,
                orderedItems: productDetails.map((item) => ({
                    product: item.productId,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    discount:item.discount,
                    totalPrice: deliveryFee 
                    ? Math.round((item.price + Number(deliveryFee)) - item.discount) 
                    : Math.round(item.price - item.discount),
                                    image: item.image,
                    status:item.status,
                })),
                totalPrice: subTotal,
                discount: discountValue,
                deliveryFee:delivery,
                finalPrice: totalPrice,
                address: {
                    name: address.name,
                    state: address.state,
                    country: address.country,
                    pincode: address.pincode,
                    phone: address.phone,
                },
                paymentMethod: paymentMethod,
                status: "pending",
                paymentStatus:"PAID",
            });

            await newOrder.save();
            await Cart.findOneAndDelete({ userId });
              res.status(200).json({success:true,message:"Successfully place order"});
           } catch (error) {
            return res.status(400).json({success:false,message:"Faild to  place order"});
           }
        }else if(paymentMethod === "Cash on Delivery"){
            if(totalPrice > 1000){
                return res.status(500).json({success:false,message:"Can not purchase COD above the 1000"})
            }
            try {
                const newOrder = new Order({
                    orderId,
                    userId,
                    orderedItems: productDetails.map((item) => ({
                        product: item.productId,
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        discount:item.discount,
                        deliveryFee,
                        totalPrice: deliveryFee 
                        ? Math.round((item.price + Number(deliveryFee)) - item.discount) 
                        : Math.round(item.price - item.discount),
                                            image: item.image,
                        status:item.status,
                    })),
                    totalPrice: subTotal,
                    discount: discountValue,
                    deliveryFee:delivery,
                    finalPrice: totalPrice,
                    address: {
                        name: address.name,
                        state: address.state,
                        country: address.country,
                        pincode: address.pincode,
                        phone: address.phone,
                    },
                    paymentMethod: paymentMethod,
                    status: "pending",
                    paymentStatus:"UNPAID",
                });

               
    
                await newOrder.save();
                await Cart.findOneAndDelete({ userId });
    
                 res.status(200).json({ success: true, message: "Order Successful" });
            } catch (error) {
                return  res.status(400).json({ success: false, message: "Order Faild" });
            }
        }

        await Promise.all(
            parsedOrderItems.map(async (item) => {
                const productId = item.productId;
                const product = await Product.findById(productId).populate("category", "saleCount");
        
                if (!product) {
                    return; // Skip this iteration
                }
        
                // Ensure product quantity is decremented correctly
                const decrementQuantity = item.quantity > 0 ? item.quantity : 1; // Fallback to 1 if quantity is not properly set
                product.quantity = Math.max(product.quantity - decrementQuantity, 0); // Prevent negative quantity

                if(product.quantity == 0){
                    product.Status = "Out of Stock";
                }
        
                // Increment sale counts
                product.saleCount += 1;
                if (product.category) {
                    product.category.saleCount += 1; // Update the category's sale count
                    await product.category.save(); // Save the category explicitly
                }
        
                // Save the updated product
                await product.save();
            })
        ); 
        

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Order Failed" });
    }
};

const verifyOnlinePayment = async (req, res) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    const  orderId = req.params.orderId;

    try {
        // Step 1: Verify Signature
        
        const generatedSignature = crypto.createHmac('sha256', razorpayInstance.key_secret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');


        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature',
            });
        }
       
        // Step 2: Fetch Payment Details
        let paymentDetails;
        try {
            paymentDetails = await razorpayInstance.payments.fetch(razorpay_payment_id);
        } catch (fetchError) {
            return res.status(500).json({
                success: false,
                message: 'Error fetching payment details.',
            });
        }

        if (paymentDetails.status !== 'captured') {
            return res.status(400).json({
                success: false,
                message: 'Payment not captured. Please try again.',
            });
        }



        // Step 3: Retrieve Pending Order
        const pending = await pendingOrder.findOne({orderId});
        if (!pending) {
            return res.status(404).json({
                success: false,
                message: 'Order not found in pending orders.',
            });
        }


        
        // Step 4: Move to Final Orders
            // Create a new order if no existing order is found
            const finalOrder = new Order({
                ...pending.toObject(),
                paymentStatus: 'PAID',
                paymentId: razorpay_payment_id,
            });
            await finalOrder.save();

        await finalOrder.save();

        // Step 5: Remove Pending Order
        await pendingOrder.findOneAndDelete({orderId});

        // Step 6: Send Response
        res.status(200).json({
            success: true,
            message: 'Payment verified and order confirmed successfully.',
            orderId: finalOrder._id,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'An error occurred during payment verification. Please try again.',
        });
    }
};

const loadWhishlist = async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1;
        let limit = 10;
        let skip = (page - 1) * limit;

        const userId = req.session.user;
        const user = await User.findById(userId);

        const whishlist = await Wishlist.findOne({ userId })
            .sort({createdAt:-1})
            .populate({
                path: "products.productId",
                select: "name salePrice Image description regularPrice Status _id quantity",
            });

        if (!whishlist || !whishlist.products || whishlist.products.length === 0) {
            return res.render("whishlist", { 
                user, 
                whishlist: [], 
                message: 'Your wishlist is empty. Start adding items!' 
            });
        }

        // Apply pagination manually on products
        const paginatedProducts = whishlist.products.slice(skip, skip + limit);
        let total = whishlist.products.length;

        res.render("whishlist", {
            user,
            // whishlist: paginatedProducts,
            currentPage: page,
            totalPage: Math.ceil(total / limit),
        });

    } catch (error) {
        res.status(400).json({ success: false, message: "ERROR in the loadWishlist" });
    }
};
const fetchWhishlist = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const userId = req.session.user;
        const user = await User.findById(userId);

        const wishlist = await Wishlist.findOne({ userId })
            .populate({
                path: "products.productId",
                select: "name salePrice Image description regularPrice Status _id quantity",
            })
            .sort({createdAt:-1});

        if (!wishlist || !wishlist.products || wishlist.products.length === 0) {
            return res.status(200).json({
                success: true,
                whishlist: [],
                message: "Your wishlist is empty.",
                currentPage: 0,
                totalPage: 0,
            });
        }

        const paginatedProducts = wishlist.products.slice(skip, skip + limit);
        const total = wishlist.products.length;

        res.status(200).json({
            success: true,
            whishlist: paginatedProducts,
            currentPage: page,
            totalPage: Math.ceil(total / limit),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching wishlist. Please try again later.",
        });
    }
};




const addToWishlist = async (req, res) => {
    try {
      const { id } = req.body; // Extract product ID from request body
      const userId = req.session.user; // Get user ID from session
  
      // Check if the product exists
      const productExists = await Product.exists({ _id: id });
      if (!productExists) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
  
      // Find the user's wishlist
      const wishlist = await Wishlist.findOne({ userId });
  
      if (wishlist) {
        // Ensure 'products' is an array
        wishlist.products = wishlist.products || [];
  
        // Check if the product is already in the wishlist
        const productInWishlist = wishlist.products.some(
          (product) => product.productId.toString() === id.toString()
        );
  
        if (productInWishlist) {
          return res.status(200).json({ success: true, message: "Product already in wishlist" });
        }
  
        // Add the new product to the existing wishlist
        wishlist.products.push({ productId: id, addOn: new Date() });
        await wishlist.save();
      } else {
        // Create a new wishlist for the user
        const newWishlist = new Wishlist({
          userId, 
          products: [{ productId: id, addOn: new Date() }],
        });
        await newWishlist.save();
      }
  
      res.status(200).json({ success: true, message: "Added to wishlist" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error adding to wishlist" });
    }
  };
  
const removeFromWishlist = async(req,res)=>{
    try {
        const {id} = req.body;
        const user = req.session.user;
        const removed = await Wishlist.findOneAndUpdate(
            {userId:user , "products.productId":id},
            { $pull: { products: { productId: id } } }, 
            {new:true},
        );

        if(removed){
            res.status(200).json({success:true,message:"Removed"});
        }else{
            res.status(400).json({success:false,message:"Faild To Remove"});
        }

    } catch (error) {
              res.status(500).json({ success: false, message: "Error in wishlist" });
    }
}


const loadWallet = async(req,res)=>{
    try {
       
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page -1) * limit;
        const userId = req.session.user;
        const wallet = await Wallet.findOne({userId});
        if (wallet && wallet.history) {
            wallet.history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        const history = wallet.history.slice(skip, skip + limit);
        const totalPage = Math.ceil(wallet.history.length / limit); // Calculate total pages

        res.render("wallet", { 
            wallet, 
            history, 
            currentPage: page, 
            totalPage
        });
    } catch (error) {
        res.status(400).json({success:false,message:"Error in load wallet"});
    }
}

function generateTransactionId() {
    const timestamp = Date.now().toString();  // Current timestamp in milliseconds
    const randomPart = Math.random().toString(36).substring(2, 10);  // Random string part
    return `TXN-${timestamp}-${randomPart}`;  // Format with a prefix for better readability
}
const addToWallet = async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.session.user;
        if (!userId) {
            return res.status(400).json({ success: false, message: "User not authenticated" });
        }


        // Shorten receipt string to avoid exceeding 40 characters
        const options = {
            amount: amount * 100, 
            currency: "INR",
            receipt: `wallet_order_${userId.slice(0, 10)}_${Date.now()}`, // Limit userId length to 10 chars
            payment_capture: 1,
        };

        // Create Razorpay order
        const order = await razorpayInstance.orders.create(options);

        const razorPayOrderId = order.id;

        // Store order info in session
        req.session.walletOrder = {
            userId,
            amount: options.amount,
            razorpayOrderId: razorPayOrderId,
        };

        const razorpayKey = process.env.RAZORPAY_KEY;

        res.status(200).json({ success: true, razorPayOrderId, razorpayKey });

    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to add to wallet", error: error.message });
    }
};

const WalletVerifyPayment = async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Missing payment details' });
        }

        const walletOrder = req.session.walletOrder;
        if (!walletOrder || walletOrder.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({ success: false, message: 'Order mismatch' });
        }

        // Generate signature for verification
        const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }

        // Fetch payment details from Razorpay
        const paymentDetails = await razorpayInstance.payments.fetch(razorpay_payment_id);
        if (paymentDetails.status !== 'captured') {
            return res.status(400).json({ success: false, message: 'Payment not captured' });
        }

        // Update wallet balance and history
        const userId = req.session.user;
        const wallet = await Wallet.findOne({ userId });

        if (!wallet) {
            return res.status(404).json({ success: false, message: 'Wallet not found' });
        }
        const transactionId = generateTransactionId();

        wallet.history.push({
            transactionId,
            type: "CREDIT",
            amount: walletOrder.amount/100,
            description: "Deposit",
            date: new Date(),
        });

        wallet.balance += walletOrder.amount/100;

        // Save the updated wallet details
        await wallet.save();

        res.status(200).json({ success: true, message: 'Payment verified and wallet updated successfully' });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Payment verification failed' });
    }
};


module.exports = {
    loadHome,
    loadsignup,
    getLatestProducts,
    signup,
    verifyOtp,
    resendOtp,
    loadlogin ,
    login,
    logout,
    loadShop,
    loadCart,
    addToCart,
    removeFromCart,
    laodDetails,
    updateCart,
    loadCheckoutPage ,
    placeOrder,
    loadWhishlist,
    addToWishlist,
    removeFromWishlist ,
    verifyOnlinePayment ,
    loadWallet,
    addToWallet,
    WalletVerifyPayment,
    fetchCart ,
    fetchWhishlist,
}  
