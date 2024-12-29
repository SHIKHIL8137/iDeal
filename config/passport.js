
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User, Address, OTP, Referral, Wallet } = require('../model/userModel');
require('dotenv').config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/user/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile?.emails?.[0]?.value;
        if (!email) {
          throw new Error('Google profile does not contain an email address.');
        }
        let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });

        if (!user) {
          user = new User({
            username: profile.displayName,
            email,
            googleId: profile.id,
          });
          await user.save();

          const referralCode = await generateUniqueReferralCode();
          const newReferral = new Referral({
            userId: user._id,
            referralCode,
          });
          await newReferral.save();

          await Wallet.findOneAndUpdate(
            { userId: user._id },
            { $setOnInsert: { balance: 0 } },
            { upsert: true, new: true }
          );
        }

        return done(null, user);
      } catch (error) {
        console.error('Error during Google authentication:', error);
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
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let referralCode = '';
  
  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    referralCode += characters[randomIndex];
  }

  return referralCode;
}

async function generateUniqueReferralCode() {
  let referralCode = generateReferralCode();

  let existingReferral = await Referral.findOne({ referralCode });

  while (existingReferral) {
    referralCode = generateReferralCode();
    existingReferral = await Referral.findOne({ referralCode });
  }

  return referralCode; 
}


module.exports = passport;

