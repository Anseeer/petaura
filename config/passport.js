// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy; // Corrected import
// const User = require("../model/userSchema");
// require("dotenv").config(); // Load environment variables

// passport.use(
//     new GoogleStrategy(
//         {
//             clientID: process.env.GOOGLE_CLIENT_ID,
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//             callbackURL: "http://localhost:3003/user/auth/google/callback",
//         },
//         async (accessToken, refreshToken, profile, done) => {
//             try {
//                 // Check if the user exists
//                 let user = await User.findOne({ googleId: profile.id });

//                 if (user) {
//                     return done(null, user); // User exists, log them in
//                 } else {
//                     // Create a new user if not found
//                     user = new User({
//                         name: profile.displayName,
//                         email: profile.emails[0].value,
//                         googleId: profile.id,
//                     });
//                     await user.save();
//                     return done(null, user); // Successfully signed up
//                 }
//             } catch (err) {
//                 console.error("Error in GoogleStrategy:", err);
//                 return done(err, null);
//             }
//         }
//     )
// );

// // Serialize the user into the session
// passport.serializeUser((user, done) => {
//     done(null, user.id); // Save only the user ID in the session
// });

// // Deserialize the user from the session
// passport.deserializeUser((id, done) => {
//     User.findById(id)
//         .then(user => done(null, user)) // Attach the full user object to req.user
//         .catch(err => done(err, null));
// });

// module.exports = passport;  
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const  User  = require("../model/userSchema");
const  Referral  = require("../model/referralSchema");
const  Wallet  = require("../model/walletSchema");
const  Cart = require("../model/cartSchema");
require("dotenv").config();


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:"/user/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile?.emails?.[0]?.value;
        if (!email) {
          throw new Error("Google profile does not contain an email address.");
        }

        // Check if user already exists
         let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }else{
           // Create new user
           user = new User({
            name: profile.displayName.split(' ').slice(0, 2).join(' '), // Corrected slice
            email,
            googleId: profile.id,
          });
          await user.save();
          

          // Generate unique referral code
          const referralCode = await generateReferralCode(user.name);
          const newReferral = new Referral({
            userId: user._id,
            referralCode,
            referredUsers:[],
            bonus:0,
          });
          await newReferral.save();

          // Initialize wallet and cart for the user
          await Wallet.findOneAndUpdate(
            { userId: user._id },
            { $setOnInsert: { balance: 0, history: [] } },
            { upsert: true, new: true }
          );

          await Cart.findOneAndUpdate(
            { userId: user._id },
            { $setOnInsert: { items: [] } },
            { upsert: true, new: true }
          );
          return done(null, user);
        }

      } catch (error) {
        console.error("Error during Google authentication:", error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((user) => done(null, user))
    .catch((err) => done(err, null));
});

async  function generateReferralCode(username) {
  // Normalize username to remove spaces and special characters
  const normalizedUsername = username.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  
  // Generate a unique suffix using timestamp
  const uniqueSuffix = Date.now().toString(36).toUpperCase();

  // Combine normalized username and unique suffix
  return `${normalizedUsername}-${uniqueSuffix}`;
}
module.exports = passport;














// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const { User } = require('../model/user/userModel');
// const { Referral } = require('../model/user/referralModel');
// const { Wallet } = require('../model/user/walletModel');
// const { Cart } = require('../model/user/cartModel');
// require('dotenv').config();

// // Use Google OAuth strategy with Passport
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: process.env.GOOGLE_CALLBACK_URL,
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         const email = profile?.emails?.[0]?.value;

//         // Check if Google profile contains an email address
//         if (!email) {
//           throw new Error('Google profile does not contain an email address.');
//         }

//         // Search for an existing user by Google ID or email
//         let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });

//         if (!user) {
//           // If user does not exist, create a new user
//           user = new User({
//             username: profile.displayName,
//             email,
//             googleId: profile.id,
//           });

//           await user.save();

//           // Generate and assign a unique referral code
//           const referralCode = await generateUniqueReferralCode();
//           const newReferral = new Referral({
//             userId: user._id,
//             referralCode,
//           });

//           await newReferral.save();

//           // Initialize Wallet and Cart collections for the user
//           await Wallet.findOneAndUpdate(
//             { userId: user._id },
//             { $setOnInsert: { balance: 0, transactions: [] } },
//             { upsert: true, new: true }
//           );

//           await Cart.findOneAndUpdate(
//             { userId: user._id },
//             { $setOnInsert: { items: [] } },
//             { upsert: true, new: true }
//           );
//         }

//         // Return the user object after successful authentication
//         return done(null, user);
//       } catch (error) {
//         console.error('Error during Google authentication:', error);
//         return done(error, null);
//       }
//     }
//   )
// );

// // Serialize user ID to store in session
// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// // Deserialize user from session by ID
// passport.deserializeUser((id, done) => {
//   User.findById(id)
//     .then((user) => done(null, user))
//     .catch((err) => done(err, null));
// });

// // Helper function to generate a referral code
// function generateReferralCode() {
//   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//   let referralCode = '';

//   for (let i = 0; i < 10; i++) {
//     const randomIndex = Math.floor(Math.random() * characters.length);
//     referralCode += characters[randomIndex];
//   }

//   return referralCode;
// }

// // Function to generate a unique referral code
// async function generateUniqueReferralCode() {
//   let referralCode = generateReferralCode();
//   let existingReferral = await Referral.findOne({ referralCode });

//   // Keep generating new referral codes until a unique one is found
//   while (existingReferral) {
//     referralCode = generateReferralCode();
//     existingReferral = await Referral.findOne({ referralCode });
//   }

//   return referralCode;
// }

// module.exports = passport;
