
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../model/userSchema");
const Referral = require("../model/referralSchema");
const Wallet = require("../model/walletSchema");
const Cart = require("../model/cartSchema");
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email =
          profile.emails && profile.emails.length > 0
            ? profile.emails[0].value
            : null;
        if (!email) {
          throw new Error("Google profile does not contain an email address.");
        }

        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        } else {

          user = new User({
            name: profile.displayName.split(' ').slice(0, 2).join(' '),
            email,
            googleId: profile.id,
          });
          await user.save();

          const referralCode = await generateReferralCode(user.name);
          const newReferral = new Referral({
            userId: user._id,
            referralCode,
            referredUsers: [],
            bonus: 0,
          });
          await newReferral.save();

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

async function generateReferralCode(username) {
  const normalizedUsername = username.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const uniqueSuffix = Date.now().toString(36).toUpperCase();

  return `${normalizedUsername}-${uniqueSuffix}`;
}
module.exports = passport;










