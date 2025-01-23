const express = require("express");
const app = express();
const userRoutes=express.Router();
const userController = require("../controller/userController");
const profileController = require("../controller/profileController");
const categoryController = require("../controller/categoryController");
const orderController = require("../controller/orderController");
const coupenController = require("../controller/coupenController");
const passport = require("passport");
const {userauth} = require("../middlwares/auth");

userRoutes.get("/",userController.loadHome);
userRoutes.get("/latest-products",userController.getLatestProducts);
userRoutes.get("/signup",userController.loadsignup);
userRoutes.post("/signup",userController.signup);
userRoutes.post("/verify-Otp",userController.verifyOtp);
userRoutes.post("/resend-Otp",userController.resendOtp);
userRoutes.get("/login",userController.loadlogin);
userRoutes.post("/login",userController.login);
userRoutes.get("/logout",userauth,userController.logout);
userRoutes.get("/loadshop",userauth,userController.loadShop);
// cat-supplies 
userRoutes.get("/cat-supplies",userauth,categoryController.loadCatSupplies);
userRoutes.get("/fillterCategoryOfCat",userauth,categoryController.fillterCategoryOfCat); 
userRoutes.get("/ProuctDetails",userauth,categoryController.ProuctDetails);
// userRoutes.get("/cat-supplies-filter",userauth,categoryController.filterCatSupplies);
// dog-supplies 
userRoutes.get("/dog-supplies",userauth,categoryController.loadDogSupplies);
userRoutes.get("/fillterCategoryOfDog",userauth,categoryController.fillterCategoryOfDog);
userRoutes.get("/ProuctDetailsOfDog",userauth,categoryController.ProuctDetailsOfDog);
userRoutes.get("/dog-supplies-filter",userauth,categoryController.filterDogSupplies);
// SmallPets-supplies 
userRoutes.get("/smallpets-supplies",userauth,categoryController.loadSmallPetsSupplies);
userRoutes.get("/fillterCategoryOfSmallPets",userauth,categoryController.fillterCategoryOfSmallPets);
userRoutes.get("/ProuctDetailsOfSmallPets",userauth,categoryController.ProuctDetailsOfSmallPets);
userRoutes.get("/smallPets-supplies-filter",userauth,categoryController.filterSmallPetsSupplies);
// petbirds -supplies
userRoutes.get("/petbird-supplies",userauth,categoryController.loadPetBirdSupplies);
userRoutes.get("/fillterCategoryOfPetBirds",userauth,categoryController.fillterCategoryOfPetBird);
userRoutes.get("/ProuctDetailsOfPetBirds",userauth,categoryController.ProuctDetailsOfPetBird);
userRoutes.get("/petBird-supplies-filter",userauth,categoryController.filterPetBirdSupplies);
// fish -supplies 
userRoutes.get("/fish-supplies",userauth,categoryController.loadFishSupplies);
userRoutes.get("/fillterCategoryOfFish",userauth,categoryController.fillterCategoryOfFish);
userRoutes.get("/ProuctDetailsOfFish",userauth,categoryController.ProuctDetailsOfFish);
userRoutes.get("/fish-supplies-filter",userauth,categoryController.filterFishSupplies);
//Accessories 
userRoutes.get("/accessories",userauth,categoryController.loadAccessories); 
userRoutes.get("/fillterCategoryOfAccessories",userauth,categoryController.fillterCategoryOfAccessories); 
userRoutes.get("/ProuctDetailsOfAccessories",userauth,categoryController.ProuctDetailsOfAccessories); 
userRoutes.get("/accessories-filter",userauth,categoryController.filterAccessories); 
// Treat
userRoutes.get("/treat",userauth,categoryController.loadTreats);
userRoutes.get("/fillterCategoryOfTreats",userauth,categoryController.fillterCategoryOfTreats);
userRoutes.get("/ProuctDetailsOfTreats",userauth,categoryController.ProuctDetailsOfTreats); 
userRoutes.get("/treat-filter",userauth,categoryController.filterTreat); 
// toys
userRoutes.get("/toys",userauth,categoryController.loadToys);
userRoutes.get("/fillterCategoryOfToys",userauth,categoryController.fillterCategoryOfToys);
userRoutes.get("/ProuctDetailsOfToys",userauth,categoryController.ProuctDetailsOfToys); 
userRoutes.get("/toys-filter",userauth,categoryController.filterToys); 
// food
userRoutes.get("/food",userauth,categoryController.loadFood);
userRoutes.get("/fillterCategoryOfFood",userauth,categoryController.fillterCategoryOfFood);
userRoutes.get("/ProuctDetailsOfFood",userauth,categoryController.ProuctDetailsOfFood);
userRoutes.get("/food-filter",userauth,categoryController.filterFood);

// ProfileManagement
userRoutes.get("/forget-pass",profileController.loadForgetEmail);    
userRoutes.post("/forget-pass",profileController.verifyEmail);  
userRoutes.get("/loadForgetPassOtp",profileController.loadForgetPassOtp);  
userRoutes.post("/resendOtp-ForgetPass",profileController.resendOtp);  
userRoutes.post("/resetPass",profileController.resetPass);
userRoutes.post("/reset-password",profileController.newPass);  
userRoutes.get("/reset-password",profileController.loadNewPass);    
userRoutes.get("/profile",userauth,profileController.loadProfile);       
userRoutes.get("/address",userauth,profileController.loadAddress);       
userRoutes.post("/addAddress",userauth,profileController.addNewAddress);                     
userRoutes.get("/addNewAddress",userauth,profileController.addAddress);                     
userRoutes.get("/edit-address",userauth,profileController.editAddress);                     
userRoutes.get("/edit-addressInCheckout",userauth,profileController.editAddressOfCheckout);                     
userRoutes.post("/edit-addressInCheckout",userauth,profileController.editedAddressInChekout);                     
userRoutes.post("/delete-address",userauth,profileController.deleteAddress);                     
userRoutes.post("/editAddress",userauth,profileController.editedAddress);                     
userRoutes.post("/edit-user-details",userauth,profileController.editDetails);                     
userRoutes.post("/change-password",userauth,profileController.editPassword);                     

// cart management 
userRoutes.get("/cart",userauth,userController.loadCart)
userRoutes.get("/fetchCart", userauth, userController.fetchCart);
userRoutes.get("/add-to-cart",userauth,userController.addToCart);
userRoutes.get("/remove-from-cart",userauth, userController.removeFromCart);
userRoutes.get("/viewMoreDetails",userauth,userController.laodDetails);
userRoutes.post("/update-cart",userauth,userController.updateCart);
// order
userRoutes.get("/checkout-page",userauth,userController.loadCheckoutPage);
userRoutes.post("/place-order",userauth,userController.placeOrder)
userRoutes.get("/order-details",userauth,orderController.orderDetails);
userRoutes.get("/pending-order-details",userauth,orderController.pendingOrderDetails);
userRoutes.post("/order-cancel",userauth,orderController.orderCancel);       
userRoutes.post("/single-order-cancel",userauth,orderController.SingleorderCancel);       
userRoutes.post("/order-return",userauth,orderController.orderReturn);       
userRoutes.post("/order-return-request",userauth,orderController.returnRequest);
userRoutes.get("/orderHistory",userauth,profileController.loadOrderHistory);       
userRoutes.get("/orderPlaced",userauth,profileController.orderPlaced);       
userRoutes.post("/updatePendingOrder",userauth,orderController.updatePendingOrder);       

// WhishList
userRoutes.get("/whishlist",userauth,userController.loadWhishlist);
userRoutes.get("/fetchWhishlist",userauth,userController.fetchWhishlist);
userRoutes.post("/add-to-whishlist",userauth,userController.addToWishlist);
userRoutes.post("/delete-from-whishlist",userauth,userController.removeFromWishlist);

// verify payment 
userRoutes.post("/verifyOnline-payment/:orderId",userauth,userController.verifyOnlinePayment);
userRoutes.post("/Wallet-verify-payment",userauth,userController.WalletVerifyPayment);

// wallet
userRoutes.get("/wallet",userauth,userController.loadWallet);
userRoutes.post("/addToWallet",userauth,userController.addToWallet);

// referral
userRoutes.get("/referral",userauth,profileController.loadReferral);

userRoutes.post("/apply-coupen",userauth,coupenController.applyCoupen);
userRoutes.get("/getInvoice/:orderId",userauth,orderController.generateSalesInvoice);

// module.exports.googleLoginRoute = (req, res, next) => {
//   // Use Passport's Google authentication strategy
//   passport.authenticate("google", {
//     scope: ["profile", "email"], // Request access to profile and email
//     prompt: "select_account" // Forces the user to select an account, useful for multi-account users
//   })(req, res, next);
// };

// module.exports.googleAuthCallback = (req, res, next) => {
//   console.log("log 1"); // Log before authentication starts
  
//   passport.authenticate("google", { session: false }, (err, user, info) => {
//     console.log("log 2"); // Log after authentication response from Google

//     // Handle any errors from Google authentication
//     if (err && err.message) {
//       // Check for a duplicate email error during authentication
//       if (err.message.includes("E11000")) {
//         console.error("Error during authentication: Duplicate email detected.");
        
//         // Redirect the user with a message indicating the email is already registered
//         return res.status(500).redirect(`/login/?errorDuplicate=${encodeURIComponent("Email already registered through normal login")}`);
//       }
//     }

//     // If no user is found, send a 401 Unauthorized response
//     if (!user) {
//       console.warn("Authentication failed: No user found.");
//       return res.status(401).json({ error: "Unauthorized" });
//     }

//     // If authentication is successful, generate a JWT (token) for the user
//     const token = user.token;
    
//     // Set the token in a cookie (securely, with httpOnly flag to prevent access from JS)
//     res.cookie("jwt", token, { httpOnly: true });

//     console.log("After setting cookie"); // Log after cookie has been set
    
//     // Redirect the user to the home page after successful authentication
//     res.redirect("/");
//   })(req, res, next); // Pass request, response, and next middleware to Passport
// };



userRoutes.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] , prompt:"select_account"})
);

// Google Callback Route
userRoutes.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/user/signup" }),
  (req, res) => {
    req.login(req.user, (err) => {
      if (err) {
        console.error("Error logging in user:", err);
        return res.redirect("/user/signup");
      }
       req.session.user  = req.session.passport.user; 
      res.redirect("/user"); // Redirect to user dashboard or homepage
    });
  }
);



module.exports = userRoutes ;