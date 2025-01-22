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
const { User } = require("../model/userSchema");
const { Referral } = require("../model/referralSchema");
const { Wallet } = require("../model/walletSchema");
const { Cart } = require("../model/cartSchema");
require("dotenv").config();


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:"http://localhost:3003/user/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile?.emails?.[0]?.value;
        if (!email) {
          throw new Error("Google profile does not contain an email address.");
        }

        // Check if user already exists
        let user = await User.findOne({
          $or: [{ googleId: profile.id }, { email }],
        });

        if (!user) {
          // Create new user
          user = new User({
            name: profile.displayName,
            email,
            googleId: profile.id,
          });
          await user.save();

          // Generate unique referral code
          const referralCode = await generateUniqueReferralCode();
          const newReferral = new Referral({
            userId: user._id,
            referralCode,
          });
          await newReferral.save();

          // Initialize wallet and cart for the user
          await Wallet.findOneAndUpdate(
            { userId: user._id },
            { $setOnInsert: { balance: 0, transactions: [] } },
            { upsert: true, new: true }
          );

          await Cart.findOneAndUpdate(
            { userId: user._id },
            { $setOnInsert: { items: [] } },
            { upsert: true, new: true }
          );
        }

        return done(null, user);
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

function generateReferralCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let referralCode = "";

  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    referralCode += characters[randomIndex];
  }

  return referralCode;
}

async function generateUniqueReferralCode() {
  let attempts = 0;
  const maxAttempts = 5; // Avoid infinite loops
  let referralCode;
  let existingReferral;

  do {
    referralCode = generateReferralCode();
    existingReferral = await Referral.findOne({ referralCode });
    attempts++;
  } while (existingReferral && attempts < maxAttempts);

  if (attempts >= maxAttempts) {
    throw new Error("Failed to generate a unique referral code.");
  }

  return referralCode;
}

module.exports = passport;
