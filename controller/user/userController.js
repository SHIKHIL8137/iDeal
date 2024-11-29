const {User,Address,OTP}=require('../../model/userModel');
const bcrypt = require('bcrypt');
const passport = require('passport');
const nodeMailer=require('nodemailer');
const { Product, Category ,Review} = require('../../model/adminModel');
require('dotenv').config()
const crypto = require('crypto');

const validColors = {
  pink: "#FFC0CB",
  yellow: "#FFFF00",
  green: "#008000",
  blue: "#0000FF",
  black: "#000000",
  white: "#FFFFFF",
  titanium: "#BEBEBE",
  purple: "#800080",
  midnight: "#191970",
  starlight: "#F5F5F5",
  red: "#FF0000",
  gold: "#FFD700",
  spaceGray: "#4B4B4B",
  jetBlack: "#343434",
  alpineGreen: "#355E3B",
  spaceBlue: "#1A1F71",
  cosmicSilver: "#C0C0C0",
  starlightGold :"#FFD700"
};





// rendering the login page

const loadlogin=async(req,res)=>{
try {
  if(!req.session.isUser){
    const message=req.query.message;
    const err=req.query.err
    const errBoolean = err === 'true';
    res.status(200).render('user/login',{message,errBoolean})
  }else{
  return res.status(200).redirect('/user/home');
  }
} catch (error) {
  res.status(500).send('Internal Server Error')
}
}


// rendering the sign up page

const loadsignUp=async(req,res)=>{
  try {
      const message=req.session.message;
      req.session.message=null;
      res.status(200).render('user/signUp',{message,title:"Home"});
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
}

// rendering the forgetPassword page

const loadForgotPassword= async(req,res)=>{
  try {
    const message = req.query.message;
    res.status(200).render('user/forgotPassword',{message});
  } catch (error) {
    res.status(200).send('Internal server Error');
  }
}



// rendering the changePassword page

const loadChangePassword=async(req,res)=>{
  try {
    res.status(200).render('user/changePassword')
  } catch (err) {
    res.status(500).send('Internal server Error');
  }
}


// rendering the home page

const loadHome = async (req, res) => {
  try {
    
    const productDetails = await Product.find()
      .populate({
        path: 'category',
        match: { status: true }, 
      });


    const filteredProducts = productDetails.filter(product => product.category);

    let recentAddProduct = await Product.find()
      .populate({
        path: 'category',
        match: { status: true }, 
      })
      .sort({ createdAt: -1 })
      .limit(10);
      recentAddProduct = recentAddProduct.filter(product => product.category);
    const categoryImages = {};
    const categories = [];

    filteredProducts.forEach((product) => {
      const categoryId = product.category._id.toString();

      if (!categoryImages[categoryId]) {
        categoryImages[categoryId] = product.images[0];

        categories.push({
          id: categoryId,
          name: product.category.name,
        });
      }
    });

    const sessionCheck = req.session.isUser || false;
    res.status(200).render('user/home', { 
      productDetails: filteredProducts, 
      categoryImages, 
      categories, 
      recentAddProduct ,
      sessionCheck
    });
  } catch (error) {
    res.status(500).send('Internal server Error');
  }
};



//rendering the shop page

const loadShop = async (req, res) => {
  try {
    const sessionCheck = req.session.isUser || false;
    const productDetails = await Product.find()
      .populate({
        path: 'category',
        match: { status: true }, 
      })
      .populate('reviews');

    const filteredProducts = productDetails.filter(product => product.category);

    for (let i = filteredProducts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filteredProducts[i], filteredProducts[j]] = [filteredProducts[j], filteredProducts[i]];
    }

    const activeCategories = [...new Set(filteredProducts.map(product => product.category.name))];

    res.status(200).render('user/shop', { productDetails: filteredProducts , categories: activeCategories,sessionCheck});
  } catch (error) {
    res.status(500).send('Internal server Error');
  }
};



// rendering the category shop page 

const loadCategoryShop = async (req, res) => {
  try {
    const sessionCheck = req.session.isUser || false;
    const categoryId = req.params.id; 
    const productDetails = await Product.find({ category: categoryId })
      .populate({
        path: 'category',
        match: { status: true }, 
      })
      .populate('reviews');
    const filteredProducts = productDetails.filter(product => product.category);

    for (let i = filteredProducts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filteredProducts[i], filteredProducts[j]] = [filteredProducts[j], filteredProducts[i]];
    }


    res.status(200).render('user/CategoryShop', { productDetails: filteredProducts ,sessionCheck});
  } catch (error) {
    res.status(500).send('Internal server Error');
  }
};



// rendering the product details page+

const loadProductDetails = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId)
      .populate({
        path: 'category',
        match: { status: true }, 
      })
      .populate({
        path: 'reviews',
        populate: {
          path: 'userId',
          select: 'username image',
        },
      });
      const relatedProducts = await Product.find({
        _id: { $ne: productId },
        price: { $lt: product.price }, 
        $or: [
          { category: product.category },  
          { category: { $ne: product.category } }  
        ]
      })
      .limit(10);
      for (let i = relatedProducts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [relatedProducts[i], relatedProducts[j]] = [relatedProducts[j], relatedProducts[i]];
      }
      
    if (!product || !product.category) { 
      return res.status(404).send('Product not found or category is unlisted');
    }
    const sessionCheck = req.session.isUser || false;
    res.status(200).render('user/productDetails', { product, validColors,sessionCheck ,relatedProducts});
  } catch (error) {
    res.status(500).send('Internal server Error');
  }
};


// function for generating the otp fo signup

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const transporter = nodeMailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});


// function for senting the otp to the varified mail

async function sendOTPEmail(email, username, password, req, res) {
  const otp = generateOtp();
  console.log(otp)
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); 
  const mailOptions = {
    from: 'iDeal@gmail.com',
    to: email,
    subject: 'OTP Verification',
    html: `<p>Your OTP code is: <b>${otp}</b></p><p>This OTP is valid for 5 minutes.</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.response}`);
    const user= await OTP.findOne({email,type:'otpVerification'})
    
    if(user) await OTP.deleteMany({email});
    const userOtp = new OTP({
      email,
      otp,
      expiresAt,
      type : 'otpVerification'
    });
    await userOtp.save();
    req.session.username = username;
    req.session.email = email;
    req.session.password = password;
    req.session.otpPending=true;
      res.status(200).render('user/otp',{message:"OTP Send successfuly",email});
    return otp;
  } catch (error) {
    res.status(500).send('Failed to send OTP. Please try again later.');
  }
}



// register the new user route

const registerUserNormal = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const user = await User.findOne({ email });
    if (user) {
      req.session.message = 'User already exists.';
      return res.redirect('/user/signUp');
    }


    await sendOTPEmail(email, username, password, req, res);
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).send('Internal Server Error. Please try again later.');
  }
};



// verify the entered otp route and save the user information to the database

const otpVerification = async (req, res) => {
  try {
    const { otp } = req.body;
    const email = req.session.email;
    if (!email) {
      return res.status(400).send('Session expired or email not found. Please try again.');
    }


    const user = await OTP.findOne({ email });
    if (!user) {
      return res.status(404).send('OTP not found for this email.');
    }

    const currentDate = new Date();
    if (currentDate > user.expiresAt) {
      await OTP.deleteMany({ email });
      return res.status(400).send('OTP has expired. Please request a new one.');
    }

    if (user.otp !== otp) {
      return res.status(401).redirect('/user/otp?message=inavlid OTP')
    }


    const password = req.session.password;
    const username = req.session.username;

    if (!password || !username) {
      return res.status(400).send('Incomplete session data. Please start the registration process again.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();


    await OTP.deleteMany({ email });
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).send('Internal server error');
      }
      res.redirect('/user/login?message=Registration successful! Please log in.&err=true');
    });

  } catch (error) {
    console.error('Error during OTP verification:', error);
    res.status(500).send('Internal Server Error. Please try again later.');
  }
};



// resend password route

const resendPassword=async(req,res)=>{
  const email=req.session.email;
  const username=req.session.username;
  const password=req.session.password;
  const user=await OTP.findOne({email});
  if(!user) return res.status(401).redirect('/user/signUp?message=user not found try again');
  await sendOTPEmail(email, username, password, req, res);
}



// validate the enter details of user route

const loginVelidation=async(req,res)=>{
  try {
    const loginDetails=req.body;
    const {email,password}=loginDetails
    const user=await User.findOne({email});
    if(!user) return res.status(401).redirect('/user/login?message=User Not Found.&& err=false')
      const emailDB=user.email;
    if(user.block === true) return res.status(401).redirect('/user/login?message=User Block By Admin.&& err=false')
    const passwordDB=user.password;
    if(emailDB===email){
      bcrypt.compare(password,passwordDB,(err,isMatch)=>{
        if(err) return res.status(401).redirect('/user/login?message=Pasword not matched.&& err=false');
        if(isMatch){
          req.session.isLoggedEmail=email;
          req.session.isUser=true;
          res.status(200).redirect('/user/home');
        }else{
          return res.status(401).redirect('/user/login?message=Pasword not matched.&& err=false');
        }
      })
    }   
  } catch (error) {
    res.status(500).send('Inernal server error please try again later.')
  }
}




// product review saving route 

const productReview=async(req,res)=>{
  try {
    const productId = req.params.id;
  const userId = req.session.userId;
  const {rating,reviewText} =req.body;

  const existingReview = await Review.findOne({ productId, userId });
  if(existingReview) return res.status(200).send('user already exist');

  const newReview = new Review({
    productId : productId,
    userId : userId,
    rating : rating,
    reviewText : reviewText
  });

  const savedReview = await newReview.save();


  await Product.findByIdAndUpdate(productId, {
    $push: { reviews: savedReview._id },
  });

  res.status(200).send('saved success fully');
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }

}




// validating the email and sent a mail with rest password link

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

  
    const user = await User.findOne({ email });
    if (!user) {
      return res.redirect('/user/forgotPassword?message=User not exist'); 
    }
    await sendResetPasswordLink(email, req, res);
  } catch (error) {
    console.error('Error during forgot password process:', error);
    res.status(500).send('Internal Server Error. Please try again later.');
  }
};




// function for sending the email to the registerd user email

async function sendResetPasswordLink(email, req, res) {
  const resetToken = crypto.randomBytes(32).toString('hex');
  console.log(resetToken);

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

  const mailOptions = {
    from: 'iDeal@gmail.com',
    to: email,
    subject: 'Password Reset Request',
    html: `<p>You requested a password reset. Please click the link below to reset your password:</p>
           <p><a href="http://localhost:3000/user/changePassword/${resetToken}">Reset Password</a></p>
           <p>This link will expire in 10 minute.</p>
           <p>If you did not request a password reset, please ignore this email.</p>`,
  };

  try {
 
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.response}`);

    const user = await OTP.findOne({ email });
    if (user) await OTP.deleteMany({ email });

    const userResetToken = new OTP({
      email,
      otp: resetToken,
      expiresAt,
      type: 'resetPassword', 
    });

    await userResetToken.save();

    req.session.email = email;
    req.session.resetTokenPending = true; 
    res.status(200).render('user/forgotPassword', { message: "Password reset link sent successfully. Please check your inbox." });

  } catch (error) {
    console.error('Error sending password reset email:', error);
    res.status(500).send('Failed to send password reset email. Please try again later.');
  }
}

const resetPasswordPage = async (req, res) => {
  const  token  = req.params.id;
  try {
   
    const tokenRecord = await OTP.findOne({ otp: token, type: 'resetPassword' });

    if (!tokenRecord || tokenRecord.expiresAt < Date.now()) {
      return res.status(400).send('Invalid or expired token');
    }

 
    res.render('user/changePassword',{token});
  } catch (error) {
    console.error('Error during reset password page access:', error);
    res.status(500).send('Internal Server Error. Please try again later.');
  }
};



// validate the token and after that redirect the change password page and update the password

const changePassword = async (req, res) => {
  const token = req.params.id
  const {password}  = req.body;
  try {
    const tokenRecord = await OTP.findOne({ otp: token, type: 'resetPassword' });
    if (!tokenRecord || tokenRecord.expiresAt < Date.now()) {
      return res.status(400).send('Invalid or expired token1');
    }

    const user = await User.findOne({ email: tokenRecord.email });
    if (!user) {
      return res.status(400).send('User not found');
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    user.password = hashedPassword; 
    await user.save();

    await OTP.deleteOne({ otp: token });
    req.session.destroy();
    res.status(200).redirect('/user/login?message=Reset password successful&err=true')
  } catch (error) {
    console.error('Error during password reset:', error);
    res.status(500).send('Internal Server Error. Please try again later.');
  }
};



// rendering the route for profile

const loadProfile = async(req,res)=>{
try {
  const email = req.session.isLoggedEmail;
  console.log(email)
  const user =await User.findOne({email});
  res.status(200).render('user/profileDetails',{user})
} catch (error) {
  res.status(401).send('Internal Server Error');
}
}



// route for log out user

const logOut=async(req,res)=>{
  try {
    res.status(200).redirect('/user/home');
  } catch (error) {
    res.status(500).send('Internal server error');
  } 
}



//google login route

const googleLogin = async(req,res)=>{
  try {
    req.session.isUser=true
    res.redirect('/user/Shop')
  } catch (error) {
    res.status(500).send('Internal server error');
  }
}



module.exports={
  loadlogin ,
  loadsignUp,
  loadForgotPassword,
  loadChangePassword,
  loadHome,
  loadShop,
  loadProductDetails,
  registerUserNormal,
  otpVerification,
  resendPassword,
  loginVelidation,
  productReview,
  loadCategoryShop,
  forgotPassword,
  resetPasswordPage,
  changePassword,
  loadProfile,
  logOut,
  googleLogin
};