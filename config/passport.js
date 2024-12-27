// const passport= require('passport');
// const googleStrategy=require('passport-google-oauth20').Strategy;
// const {User,Address,OTP,Referral,Wallet}=require('../model/userModel');
// require('dotenv').config();


// passport.use(new googleStrategy({
//   clientID:process.env.GOOGLE_CLIENT_ID,
//   clientSecret:process.env.GOOGLE_CLIENT_SECRET,
//   callbackURL:'http://localhost:3000/user/auth/google/callback',
// },
// async (accessToken,refreshToken,profile,done)=>{
//   try {
//     let user = await User.findOne({ $or: [{ googleId: profile.id }, { email: profile.emails[0].value }] });
//     if(user){
//       return done(null,user);
//     }else{
//       user=new User({
//         username:profile.displayName,
//         email:profile.emails[0].value,
//         googleId:profile.id
//       });
//       await user.save();
//       const rNewUser = await User.findOne({email : profile.emails[0].value});
//     const rNewUserId = rNewUser._id;
//     const referralCode = await generateUniqueReferralCode();
//     const newRefferal = new Referral({
//        userId : rNewUserId,
//        referralCode,
//     });
//     await newRefferal.save();

//     await Referral.findOneAndUpdate(
//       { referralCode: newUserReferredCode },
//       {
//         $push: { referredUserIds: rNewUserId },
//         $inc: { rewardAmount: 100 }, 
//       },
//       { new: true } 
//     );

//     let wallet = await Wallet.findOne({ userId:rNewUserId });
//     if (!wallet) {
//       wallet = new Wallet({
//         userId : rNewUserId,
//         balance: 0,
//       });
//     } 
//     await wallet.save();
//       return done(null,user);
//     }

//   } catch (error) {
//     console.log(error)
//     return done(error,null)
//   }
// }
// ));
// passport.serializeUser((user,done)=>{
//   done(null,user.id)
// });
// passport.deserializeUser((id,done)=>{
//   User.findById(id)
//   .then(user=>{
//     done(null,user)
//   }).catch(err=>{
//     done(err,null)
//   })
// })


// module.exports=passport;






const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User, Address, OTP, Referral, Wallet } = require('../model/userModel');
require('dotenv').config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/user/auth/google/callback',
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

