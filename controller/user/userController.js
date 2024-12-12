const {User,Address,OTP,Cart,CheckOut,Orders,WishList,Wallet,Referral,ReturnCancel}=require('../../model/userModel');
const bcrypt = require('bcrypt');
const passport = require('passport');
const nodeMailer=require('nodemailer');
const { Product, Category ,Review,Coupon, Offer} = require('../../model/adminModel');
require('dotenv').config()
const crypto = require('crypto');
const mongoose = require('mongoose');
const { triggerAsyncId } = require('async_hooks');
const { title } = require('process');

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
    res.status(200).render('user/login',{message,errBoolean,title:"Login"})
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
      res.status(200).render('user/signUp',{message,title:"Sign Up"});
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
}

// rendering the forgetPassword page

const loadForgotPassword= async(req,res)=>{
  try {
    const message = req.query.message;
    res.status(200).render('user/forgotPassword',{message,title:"Forgot Password"});
  } catch (error) {
    res.status(200).send('Internal server Error');
  }
}



// rendering the changePassword page

const loadChangePassword=async(req,res)=>{
  try {
    res.status(200).render('user/changePassword',{title:"Change Password"})
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
      sessionCheck,
      title:"Home"
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

    res.status(200).render('user/shop', { productDetails: filteredProducts , categories: activeCategories,sessionCheck,title:"Shop"});
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


    res.status(200).render('user/CategoryShop', { productDetails: filteredProducts ,sessionCheck,title:"Shop Category"});
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
          select: 'username profilePicture',
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
    const offerProduct = await Offer.findOne({ product: productId, isActive: true });
    const productOffer = offerProduct || null;
  
    const offerCategory = await Offer.findOne({category:product.category , isActive : true});
    const categoryOffer = offerCategory || null;


    const sessionCheck = req.session.isUser || false;
    res.status(200).render('user/productDetails', { product, validColors,sessionCheck ,relatedProducts,title:"Product Details",productOffer,categoryOffer});
  } catch (error) {
    console.log(error);
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

async function sendOTPEmail(email, username, password, referral ,req, res) {
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
    req.session.referralCode = referral;
    req.session.otpPending=true;
      res.status(200).render('user/otp',{message:"OTP Send successfuly",email,title:"OTP Varification"});
    return otp;
  } catch (error) {
    res.status(500).send('Failed to send OTP. Please try again later.');
  }
}



// register the new user route

const registerUserNormal = async (req, res) => {
  try {
    const { username, email, password, referral } = req.body;
    
    const user = await User.findOne({ email });
    if (user) {
      req.session.message = 'User already exists.';
      return res.redirect('/user/signUp');
    }
    if(referral){
      const referralCodeValid = await Referral.findOne({referralCode:referral});
      if(!referralCodeValid) {
        req.session.message = 'Invalid Referral Code';
        return res.redirect('/user/signUp');
      }
    }
    await sendOTPEmail(email, username, password, referral ,req, res);
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
    const newUserReferredCode = req.session.referralCode

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

    const rNewUser = await User.findOne({email});
    const rNewUserId = rNewUser._id;
    const referralCode = await generateUniqueReferralCode();
    const newRefferal = new Referral({
       userId : rNewUserId,
       referralCode,
    });
    await newRefferal.save();

    await Referral.findOneAndUpdate(
      { referralCode: newUserReferredCode },
      {
        $push: { referredUserIds: rNewUserId },
        $inc: { rewardAmount: 100 }, 
      },
      { new: true } 
    );


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

// generate refferal code

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
    const email = req.session.isLoggedEmail;
    const user = await User.findOne({email});
    const userId = user._id;
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
    res.status(200).render('user/forgotPassword', { message: "Password reset link sent successfully. Please check your inbox." ,title:'Forgot Password'});

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

 
    res.render('user/changePassword',{token,title:"Change password"});
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
  const user =await User.findOne({email});
  res.status(200).render('user/profileDetails',{user,title:"Profile"})
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


// shop product searching

const productSearching = async (req, res) => {
  const searchQuery = req.query.search || ''; 

  try {
    const products = await Product.find({
      name: { $regex: searchQuery, $options: 'i' }, 
    })
      .populate({
        path: 'category',
        match: { status: true },
      })
      .populate('reviews');


    const filteredProducts = products.filter((product) => product.category !== null);

    res.json({ products: filteredProducts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while searching for products' });
  }
};


// product sorting

const sortedProduct = async (req, res) => {
  try {

    const order = req.query.order?.toLowerCase();
    const sortOrder = order === "desc" ? -1 : 1; 


    const products = await Product.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category', 
          foreignField: '_id', 
          as: 'categoryDetails' 
        }
      },
      {
        $unwind: '$categoryDetails' 
      },
      {
        $match: {
          'categoryDetails.status': true 
        }
      },
      {
        $sort: { price: sortOrder } 
      }
    ]);
    

    if (!products.length) {
      return res.status(404).json({ message: 'No products found' });
    }

    res.status(200).json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// filter for  product

const filterProduct = async (req, res) => {
  try {
    const { price, storage, connectivity, rating ,condition} = req.body;


    const query = [];


    if (price) {
      query.push({
        $match: {
          price: { $lte: parseFloat(price) } 
        }
      });
    }


    if (storage && storage.length > 0) {
      query.push({
        $match: {
          storage: { $in: storage.map(Number) } 
        }
      });
    }


    if (connectivity && connectivity.length > 0) {
      query.push({
        $match: {
          connectivity: { $in: connectivity } 
        }
      });
    }

    if (rating && rating.length > 0) {
      query.push({
        $lookup: {
          from: 'reviews',  
          localField: '_id',
          foreignField: 'productId',
          as: 'reviews' 
        }
      });

      query.push({
        $addFields: {
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: "$reviews" }, 0] },
              then: { $avg: "$reviews.rating" },
              else: 0 
            }
          }
        }
      });

      query.push({
        $match: {
          averageRating: { $gte: Math.min(...rating), $lte: Math.max(...rating) }
        }
      });
    }
    if (condition && condition.length > 0) {
      query.push({
        $match: {
          condition: { $in: condition } 
        }
      });
    }

    query.push({
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id', 
        as: 'categoryDetails' 
      }
    });
    

    query.push({
      $unwind: '$categoryDetails'
    });
    
   
    query.push({
      $match: {
        'categoryDetails.status': true
      }
    });


    const products = await Product.aggregate(query);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error filtering products:", error);
    res.status(500).send("Internal Server Error");
  }
};


// sort the product in category route
const sortCategoryProduct = async(req,res)=>{

  try {
    const productId = req.query.id
    const order = req.query.order?.toLowerCase();
    const sortOrder = order === "desc" ? -1 : 1; 
 
    const products = await Product.aggregate([
      {
        $match: {
          category: new mongoose.Types.ObjectId(productId), 
        },
      },
      {
        $sort: { price: sortOrder },
      },
    ]);


    if (!products.length) {
      return res.status(404).json({ message: 'No products found' });
    }

    res.status(200).json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

}


// search the category product


const categoryProductSearching = async (req, res) => {
  const searchQuery = req.query.search || ''; 
  const categoryId = req.query.id

  try {
    const products = await Product.find({
      category : categoryId,
      name: { $regex: searchQuery, $options: 'i' }, 
    })
      .populate({
        path: 'category',
        match: { status: true },
      })
      .populate('reviews');


    const filteredProducts = products.filter((product) => product.category !== null);

    res.json({ products: filteredProducts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while searching for products' });
  }
};

// category shop filter


const categoryShopFilter = async(req,res)=>{
  try {
    const categoryId = req.query.id
    const { price, storage, connectivity, rating ,condition} = req.body;


    const query = [];
    query.push({
      $match: {
        category: new mongoose.Types.ObjectId(categoryId),
      },
    });

    if (price) {
      query.push({
        $match: {
          price: { $lte: parseFloat(price) } 
        }
      });
    }


    if (storage && storage.length > 0) {
      query.push({
        $match: {
          storage: { $in: storage.map(Number) } 
        }
      });
    }


    if (connectivity && connectivity.length > 0) {
      query.push({
        $match: {
          connectivity: { $in: connectivity } 
        }
      });
    }

    if (rating && rating.length > 0) {
      query.push({
        $lookup: {
          from: 'reviews',  
          localField: '_id',
          foreignField: 'productId',
          as: 'reviews' 
        }
      });

      query.push({
        $addFields: {
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: "$reviews" }, 0] },
              then: { $avg: "$reviews.rating" },
              else: 0 
            }
          }
        }
      });

      query.push({
        $match: {
          averageRating: { $gte: Math.min(...rating), $lte: Math.max(...rating) }
        }
      });
    }
    if (condition && condition.length > 0) {
      query.push({
        $match: {
          condition: { $in: condition } 
        }
      });
    }

    query.push({
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id', 
        as: 'categoryDetails' 
      }
    });
    

    query.push({
      $unwind: '$categoryDetails'
    });
    
   
    query.push({
      $match: {
        'categoryDetails.status': true
      }
    });


    const products = await Product.aggregate(query);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error filtering products:", error);
    res.status(500).send("Internal Server Error");
  }
}



// load order history page


const loadOrderHistory = async (req, res) => {
  try {
    const email = req.session.isLoggedEmail;  
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userId = new mongoose.Types.ObjectId(user._id);
    const orders = await Orders.find({ userId }).sort({ orderDate: -1 }); 

    for (let order of orders) {
      const firstProduct = order.products[0]; 
      order.firstProductName = firstProduct.productName;
      order.firstProductQuantity = firstProduct.quantity; 
    }

    res.status(200).render('user/orderHistory', { orders ,title:"Order History"});
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
};

  




// load order detailes page

const loadOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Orders.findOne({ orderId })
      .populate('userId', 'username email');
    
    if (!order) {
      return res.status(404).send('Order not found');
    }
    let returnCancel = null;
    console.log(order.status);
    if (order.status === 'Returned') {
      returnCancel = await ReturnCancel.findOne({ orderId: order._id });
      if (!returnCancel) {
        return res.status(404).send('Order status not found');
      }
    }
    res.status(200).render('user/orderDetails', { returnCancel ,order , title : "Oreder Details"});
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};



// load cart page


// const loadCart = async (req, res) => {
//   try {
//     const email = req.session.isLoggedEmail || 'shikhilkalarikkal813704@gmail.com';

//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).send('User not found');
//     }

//     const userId = user._id;

//     const coupons = await Coupon.find();

//     const userCart = await Cart.findOne({ userId }).populate('items.productId');
//     res.status(200).render('user/cart', { userCart ,title:"Cart",coupons});
//   } catch (error) {
//     console.error('Error loading cart:', error);
//     res.status(500).send('Internal Server Error');
//   }
// };





  const loadCart = async (req, res) => {
    try {
      const email = req.session.isLoggedEmail || 'shikhilkalarikkal813704@gmail.com';

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).send('User not found');
      }

      const userId = user._id;


      const coupons = await Coupon.find();


      const userCart = await Cart.findOne({ userId }).populate('items.productId');

      let discountCategoryOffer = null; 
      let totalCategoryDiscount = 0; 

      if (userCart && userCart.items.length > 0) {

        for (const cartItem of userCart.items) {
          const product = cartItem.productId;
          if (product) {
            const checkOffer = await Offer.findOne({
              category: product.category, 
              isActive: true,           
            }).populate('category'); 

            if (checkOffer) {
              discountCategoryOffer = checkOffer;


              const productPrice = product.price;
              const discountPercentage = checkOffer.discountValue; 
              const discountCap = checkOffer.discountCap || Infinity; 
              const quantity = cartItem.quantity;

              let calculatedDiscount = (productPrice * (discountPercentage / 100)) * quantity;

              if (calculatedDiscount > discountCap) {
                calculatedDiscount = discountCap;
              }

              totalCategoryDiscount += calculatedDiscount;

              break; 
            }
          }
        }
      }

      res.status(200).render('user/cart', {
        userCart,
        title: "Cart",
        coupons,
        discountCategoryOffer, 
        totalCategoryDiscount,
      });
    } catch (error) {
      console.error('Error loading cart:', error);
      res.status(500).send('Internal Server Error');
    }
  };



                                            



// load Checkout page

const loadCheckout =  async(req,res)=>{
try {
  const userEmail = req.session.isLoggedEmail;
  const message = req.query.message;
  const errBoolean = req.query.err;
  const user = await User.findOne({ email: userEmail }).populate('addresses');
  res.status(200).render('user/checkOut',{user,message,errBoolean ,title:"Check Out"});
} catch (error) {
  res.status(500).send('Internal Server Error')
}

}



//load address page

const loadAddress = async(req,res)=>{
  try {

    const errBoolean = req.query.err === 'true'?true:false;
    const message = req.query.message;
    res.status(200).render('user/address',{message,errBoolean,title:"Address"});
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
}


//load conformation page

const loadOrderConformation = async (req, res) => {
  try {
    const orderId = req.params.id;
    const orderDetails = await Orders.findOne({ orderId }).populate('userId').exec();
    if (!orderDetails) {
      return res.status(404).send('Order not found');
    }

    if (orderDetails.status === 'expired') {
      return res.status(403).redirect('/user/shop');
    }
    res.status(200).render('user/orderConformation', { orderDetails ,title:"Order Conformation"});
  } catch (error) {
    console.error('Error in loadOrderConformation:', error);
    res.status(500).send('Internal Server Error');
  }
};


// save the user data


const userDetailsSave = async (req, res) => {
  try {
    const { fname, lname, username, email, secondEmail, phone } = req.body;

    const updateFields = {};
    if (fname) updateFields.firstName = fname;
    if (lname) updateFields.lastName = lname;
    if (username) updateFields.username = username;
    if (email) updateFields.email = email;
    if (secondEmail) updateFields.secondEmail = secondEmail;
    if (phone) updateFields.phone = phone;

    if (req.file) {
      updateFields.profilePicture = `/uploads/re-image/${req.file.filename}`;  
    }

    updateFields.updatedAt = new Date();

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).send('No fields provided for update');
    }
    const result = await User.updateOne(
      { email: req.session.isLoggedEmail },
      { $set: updateFields },
      { upsert: true }
    );
    res.status(200).json({ message: 'Data saved successfully!' });
  } catch (error) {
    console.error('Error saving user details:', error);
    res.status(500).send('Internal Server Error');
  }
};




// ajax for checking the email exist or not

const checkEmail=async(req,res)=>{
  try {
    const email= req.query.email;
    const userEmail = req.query.userEmail;
    if(!email){
      return res.status(400).json({error:'Email is required'})
    }
    const user = await User.findOne({ email });
    const exists = user ? email !== userEmail : false;
  
  res.json({ exists }); 
  } catch (error) {
    res.status(500).send("Internal server error");
  }
}


// userProfile update password

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const email = req.session.isLoggedEmail;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.password) {
      if (!newPassword) {
        return res.status(400).json({ message: 'New password is required' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await User.updateOne({ email }, { $set: { password: hashedPassword } });

      return res.status(200).json({ message: 'Password set successfully for the first time' });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new passwords are required' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'The current password does not match' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.updateOne({ email }, { $set: { password: hashedPassword } });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};




// add the product from product details to cart


const addProductToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, price } = req.body; 
    const email = req.session.isLoggedEmail ;

    if (!productId || !price) {
      return res.status(400).json({ status: 'error', message: 'Product ID and price are required.' });
    }

    if (!email) {
      return res.status(401).json({ status: 'error', message: 'User is not logged in.' });
    }


    const validProduct = await Product.findById(productId);
    if (!validProduct) {
      return res.status(404).json({ status: 'error', message: 'Invalid product ID.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found.' });
    }

    let cart = await Cart.findOne({ userId: user._id });

    if (cart) {

      if (cart.items.length >= 10 && !cart.items.some((item) => item.productId.toString() === productId)) {
        return res.status(400).json({
          status: 'error',
          message: 'Cart limit reached. You can only have 10 products in the cart.',
        });
      }


      const existingItemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (existingItemIndex > -1) {

        const newQuantity = cart.items[existingItemIndex].quantity + quantity;

        if (newQuantity > 10) {
          return res.status(400).json({
            status: 'error',
            message: 'Maximum quantity for a product is 10.',
          });
        }

        cart.items[existingItemIndex].quantity = newQuantity;
        cart.items[existingItemIndex].totalPrice = newQuantity * price;


        if (newQuantity <= 0) {
          cart.items.splice(existingItemIndex, 1);
        }
      } else {

        cart.items.push({
          productId,
          quantity,
          price,
          totalPrice: quantity * price,
        });
      }
    } else {

      cart = new Cart({
        userId: user._id,
        items: [
          {
            productId,
            quantity,
            price,
            totalPrice: quantity * price,
          },
        ],
      });
    }

   
    cart.totalAmount = cart.items.reduce((total, item) => total + item.totalPrice, 0);

    await cart.save();

    res.status(200).json({ status: 'success', message: 'Product updated in cart successfully.' });
  } catch (error) {
    console.error('Error updating product in cart:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};


// update Quantity in cart

const updateCartQuantity = async (req, res) => {
  try {
    const { productId, action } = req.body;
    const email = req.session.isLoggedEmail;
    const user = await User.findOne({ email });
    const cart = await Cart.findOne({ userId: user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }
    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart.' });
    }

    const item = cart.items[itemIndex];
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found in the inventory.' });
    }
    if (action === 'increment') {
      if (item.quantity >= 10) {
        return res.status(400).json({ message: 'Maximum quantity reached (10).' });
      }
      if (item.quantity + 1 > product.stock) {
        return res.status(400).json({ message: 'Insufficient stock available.' });
      }
      item.quantity += 1;
      item.totalPrice = item.quantity * item.price;

    } else if (action === 'decrement') {
      if (item.quantity <= 1) {
        return res.status(400).json({ message: 'Minimum quantity is 1.' });
      }
      item.quantity -= 1;
      item.totalPrice = item.quantity * item.price;
    }

    cart.totalAmount = cart.items.reduce((total, item) => total + item.totalPrice, 0);
    await cart.save();

    res.status(200).json({ message: 'Cart updated successfully.' });
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};



// delete product from cart


const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const email = req.session.isLoggedEmail ;

    const user = await User.findOne({ email });
    const cart = await Cart.findOne({ userId: user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }

    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart.' });
    }

    cart.items.splice(itemIndex, 1); 
    cart.totalAmount = cart.items.reduce((total, item) => total + item.totalPrice, 0);

    await cart.save();

    res.status(200).json({ message: 'Item removed from cart successfully.' });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};


//coupon validation and check out

const couponValidationCheckout = async (req, res) => {
  const { couponCode , currentTotal} = req.body;
  const email = req.session.isLoggedEmail;

  try {
    const user = await User.findOne({ email });
    const userId = user._id;
    const coupon = await Coupon.findOne({ code: couponCode, isActive: true });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or inactive coupon.' });
    }

    const now = new Date();

    if (now < coupon.validFrom || now > coupon.validTill) {
      return res.status(400).json({ success: false, message: 'Coupon is not valid at this time.' });
    }

    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit exceeded.' });
    }

    if (coupon.usersUsed.includes(userId)) {
      return res.status(400).json({ success: false, message: 'You have already used this coupon.' });
    }

    const cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart || cart.totalAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minOrderAmount} is required for this coupon.`,
      });
    }

    const discount = Math.floor(
      (coupon.discountPercentage / 100) * cart.totalAmount,
      coupon.maxDiscountAmount || Infinity
    );
    const newPrice = Math.floor(currentTotal - discount) ;
    res.status(200).json({
      success: true, // Added field
      message: 'Coupon is valid.',
      discount: discount,
      newTotalAmount: newPrice,
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ success: false, message: 'An error occurred while validating the coupon.' });
  }
};


// Remove coupon

const removeCoupon = async (req, res) => {
  try {
    const email = req.session.isLoggedEmail ;
    const user = await User.findOne({ email });
    const userId = user._id;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    // Reset discount-related fields
    const originalTotal = cart.totalAmount;
    cart.discount = 0;
    cart.couponCode = null;

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Coupon removed successfully.',
      originalTotal: originalTotal,
    });
  } catch (error) {
    console.error('Error removing coupon:', error);
    res.status(500).json({ success: false, message: 'An error occurred while removing the coupon.' });
  }
};


// add new address


const addAddress = async(req,res)=>{
  try {
    const { fname, lname, companyName, houseName, country, state, city, zipCode, email, phone } = req.body;
    const userEmail = req.session.isLoggedEmail ;
    if (!userEmail) return res.status(400).json({ message: 'User ID is required' });
    const user = await User.findOne({email:userEmail});
    if(user.addresses.length>=5) return res.status(200).redirect('/user/address?message=You can only store up to 5 addresses&err=false');
    const userId = user._id;
    const address = new Address({ 
      user: userId, 
      fname:fname.trim(), 
      lname:lname.trim(), 
      companyName:companyName.trim(), 
      houseName:houseName.trim(), 
      country:country.trim(), 
      state:state.trim(), 
      city:city.trim(), 
      zipCode:zipCode.trim(), 
      email:email.trim(), 
      phone :phone.trim()
    });

    await address.save();
  
    if (!user) return res.status(404).redirect('user/address?message=User not found&err=false');
    user.addresses.push(address._id);
    await user.save();

    res.status(200).redirect('/user/address?message=Address added successfully&err=true');
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).send('Inernal Server Error');
  }
}

// post the checkout data amd  store in a collecion

const checkoutDataStore = async (req, res) => {
  try {
    const  checkOutData  = req.body;
    const email = req.session.isLoggedEmail;
    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userId = new mongoose.Types.ObjectId(user._id);

    const existUser = await CheckOut.findOne({ userId });
    if (existUser) {
      const result = await CheckOut.updateOne(
        { userId },
        { $set:checkOutData}
      );
      if (result.matchedCount === 0) {
        console.error('No matching record found for update.');
        return res.status(404).json({ message: 'Record not found for update' });
      }
    } else {
      const newCheckOut = new CheckOut({ userId, ...checkOutData });
      await newCheckOut.save();
    }
     req.session.checkOutData = true;
    res.status(200).json({ message: 'Checkout data saved successfully.' });
  } catch (error) {
    console.error('Error in checkoutDataStore:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// get the checkout summary

const getCheckoutSummery = async(req,res)=>{
  try {
    const email = req.session.isLoggedEmail;
    const user = await User.findOne({email});
    const userId = user._id;
    const userSummeryDetails = await CheckOut.findOne({userId});
    res.status(200).json(userSummeryDetails);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
}


// delete the address

const deleteAddress = async (req,res)=>{
  try {
    const addressId = req.params.id;


    if (!addressId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid address ID' });
    }

    const deletedAddress = await Address.findByIdAndDelete(addressId);

    if (!deletedAddress) {
      return res.status(404).json({ message: 'Address not found' });
    }


    await User.updateOne(
      { _id: deletedAddress.user },
      { $pull: { addresses: addressId } } 
    );

    res.status(200).json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

//edit address
const editAddress = async (req,res)=>{
  try {
    
  } catch (error) {
    res.status(500).send('Inernal Server Error');
  }
}

//load edit address 

const loadEditAddress = async (req, res) => {
  try {
    const message = req.query.message;
    const addressId = req.params.id; 
    const errBoolean = req.query.err === "true";

    // Correct usage of findById
    const editedAddress = await Address.findById(addressId); 

    if (!editedAddress) {
      return res.status(404).send('Address not found');
    }

    res.status(200).render('user/editAddress', { message, errBoolean, editedAddress,title:"Edit Address"});
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
};



// save the updated address

const saveUpdatedAddress = async (req, res) => {
  try {
    const sessionEmail = req.session.isLoggedEmail;
    const user = await User.findOne({ email: sessionEmail });
    const addressId = req.params.addressId;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).send('Invalid address ID');
    }

    const { fname, lname, companyName, houseName, country, state, city, zipCode, email, phone } = req.body;

    if (!user) {
      return res.status(404).send('User not found');
    }

    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(404).send('Address not found');
    }

    address.fname = fname;
    address.lname = lname;
    address.companyName = companyName;
    address.houseName = houseName;
    address.country = country;
    address.state = state;
    address.city = city;
    address.zipCode = zipCode;
    address.email = email;
    address.phone = phone;

    await address.save();
    const addressIndex = user.addresses.findIndex(
      (addressIdObj) => addressIdObj.toString() === addressId
    );
    if (addressIndex !== -1) {
      user.addresses[addressIndex] = address._id; 
    }

    await user.save();
    
    res.status(200).redirect('/user/checkOut?message=Address updation SuccessFully&err=true');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


// place oreder 

const submitOrder = async (req, res) => {
  try {
    const { deliveryAddress, billingAddress, paymentMethod } = req.body;
    if (!deliveryAddress || !deliveryAddress._id) {
      return res.status(400).json({ message: 'Invalid delivery address' });
    }

    const deliveryAddressData = await Address.findById(deliveryAddress._id);
    if (!deliveryAddressData) {
      return res.status(400).json({ message: 'Delivery address not found' });
    }

   const email = req.session.isLoggedEmail;
    const user = await User.findOne({email:email});
    console.log('user valid')
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userId = user._id;
    const checkout = await CheckOut.findOne({ userId :user._id });
    if (!checkout) {
      return res.status(400).json({ message: 'Checkout data not found' });
    }

    const cart = await Cart.findOne({ userId: user._id });
    if (!cart || !cart.items || !Array.isArray(cart.items) || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }


    if (checkout.appliedCoupon !== 'N/A') {
      const coupon = await Coupon.findOne({ code: checkout.appliedCoupon });
      if (coupon && coupon.isActive) {
          coupon.usersUsed.push(user._id);
          coupon.usageCount += 1;
          await coupon.save();
      } else {
        return res.status(200).json({message : 'Invalid or inactive coupon.'});
      }
    }


    const productIds = cart.items.map((item) => item.productId);
    const productDetails = await Product.find({ _id: { $in: productIds } });
    const productMap = productDetails.reduce((map, product) => {
      map[product._id.toString()] = product;
      return map;
    }, {});


    const products = cart.items.map((item) => {
      const product = productMap[item.productId.toString()];
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      return {
        productId: item.productId,
        productName: product.name,
        productColor : product.color,
        productStorage : product.storage,
        firstImage: product.images[0] || null,
        quantity: item.quantity,
        price: product.price,
        total: item.quantity * product.Dprice, 
      };
    });


    const discount = checkout.discount + checkout.categoryDiscound || 0;


    const order = new Orders({
      orderId: `ORD${Date.now()}`,
      userId: user._id,
      orderDate: new Date(),
      status: 'Processing',
      paymentStatus: 'Unpaid',
      paymentMethod,
      deliveryAddress: deliveryAddressData,
      billingAddress:billingAddress,
      products,
      subtotal : checkout.totalAmount,
      discount,
      totalAmount : checkout.finalTotal,
      orderConformStatus:'Confirmed',
      appliedCoupon : checkout.appliedCoupon
    });

    await order.save();


    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product with ID ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product ID ${item.productId}` });
      }

      product.stock -= item.quantity; 
      await product.save(); 
    }

  
    await CheckOut.deleteOne({ userId }); 
    await Cart.updateOne(
      { userId }, 
      {
        $set: { 
          'items': [], 
          'totalAmount': 0, 
          'totalDiscountAmount': 0, 
          'updatedAt': new Date(),
        }
      }
    );

    await User.updateOne(
      { _id: userId },
      { $push: { orders: order._id } }
    );

    req.session.checkOutData = false;
    res.status(200).json({ message: 'Order placed successfully', orderId: order.orderId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


// cancel the order


const cancelOreder = async(req,res)=>{
  try {
    const orderId = req.params.orderId;
    const {reason} = req.body;
    console.log(orderId,reason)
    const order = await Orders.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    for (const productItem of order.products) {
      const product = await Product.findById(productItem.productId);
      if (product) {
        product.stock += productItem.quantity;
        await product.save(); 
      }
    }
    if (order.appliedCoupon) {
      const coupon = await Coupon.findOne({ code: order.appliedCoupon });
      if (coupon) {
        if (coupon.usageCount > 0) {
          coupon.usageCount -= 1;
        }
        coupon.usersUsed = coupon.usersUsed.filter((userId) => userId.toString() !== order.userId.toString());
        await coupon.save();
      }
    }
    
    const newUserReason = new ReturnCancel({
      reason : reason.trim(),
      userId : order.userId,
      orderId : order._id,
      paymentMethod : order.paymentMethod,
      paymentStatus : order.paymentStatus,
      isReturn : false,

    })

    await newUserReason.save();
    order.status = 'Cancelled';
    await order.save(); 
    res.json({ message: 'Order canceled successfully', order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }

}



// chenge oreder conformation expire status



const changeOrderConformationStatus = async(req,res)=>{

  const { orderId } = req.params;

  try {
    const order = await Orders.findById(orderId);

    if (!order) {
      return res.status(404).send({ message: 'Order not found' });
    }

    if (order.status === 'expired') {
      return res.status(400).send({ message: 'Order is already expired' });
    }
    order.orderConformStatus = 'expired';
    await order.save();

    res.send({ message: 'Order expired successfully' });
  } catch (error) {
    console.error('Error expiring order:', error);
    res.status(500).send({ message: 'Server error' });
  }


}



// load whish list

const loadWishlist = async (req, res) => {
  try {
    const email = req.session.isLoggedEmail;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ status: "false", message: "User not found" });
    }

    const userId = user._id;

    const wishlist = await WishList.findOne({ userId })
    .populate('items.productId')
    .exec();
  
  if (wishlist) {
    wishlist.items.sort((a, b) => b.addedAt - a.addedAt); 
  }

    res.status(200).render('user/wishlist', {
      title: "Wish List",
      wishlist: wishlist ? wishlist.items : [],
    });
  } catch (error) {
    console.error("Error loading wishlist:", error);
    res.status(500).send('Internal Server Error');
  }
};



// load wallet 


const loadWallet = async (req, res) => {
  try {
    const email = req.session.isLoggedEmail;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send('User not found');
    }

    const wallet = await Wallet.findOne({ userId: user._id });
    const transactions = wallet ? wallet.transactions : [];

    const formattedTransactions = transactions.map((transaction) => ({
      id: transaction.transactionId,
      date: new Date(transaction.date).toLocaleDateString(),
      withdrawal: transaction.type === 'debit' ? `₹${transaction.amount}` : '-',
      deposit: transaction.type === 'credit' ? `₹${transaction.amount}` : '-',
    }));
    console.log(formattedTransactions)
    res.status(200).render('user/wallet', {
      title: 'Wallet',
      balance: wallet ? wallet.balance : 0,
      transactions: formattedTransactions,
    });
  } catch (error) {
    console.error('Error loading wallet:', error);
    res.status(500).send('Internal Server Error');
  }
};



// load referral 


const loadReferral = async(req,res)=>{
  try {
    const email = req.session.isLoggedEmail;
    const user = await User.findOne({email});
    if(!user) return res.status(400).send('User not Found');
    const referral = await Referral.findOne({userId : user._id}).populate('referredUserIds', 'username email createdAt');
    res.status(200).render('user/referral',{title : "referral",referral});
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
}
 

// add to wishList


const addtoWishlist = async (req, res) => {
  try {
    const productId = req.params.id; 
    const email = req.session.isLoggedEmail || "shikhilks02@gmail.com";
    console.log(email);
    const user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const userId = user._id;
    let wishlist = await WishList.findOne({ userId });

    if (!wishlist) {
      wishlist = new WishList({
        userId,
        items: [{ productId }],
      });
      await wishlist.save();
      return res.status(201).json({ status: true, message: "Product added to wishlist" });
    }
    if (wishlist.items.length >= 20) {
      return res.status(400).json({ status: false, message: "Wishlist is full. You can only have 20 items." });
    }

    const itemExists = wishlist.items.some(
      (item) => item.productId.toString() === productId
    );

    if (itemExists) {
      return res.status(404).json({ status: false, message: "Product already in wishlist" });
    }

    wishlist.items.push({ productId });
    await wishlist.save();

    res.status(200).json({ status: true, message: "Product added to wishlist" });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};



// Detlet item from the cart



const deleteFromWishlist = async (req, res) => {
  try {
    const productId = req.params.id;
    const email = req.session.isLoggedEmail; 
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const updatedWishlist = await WishList.findOneAndUpdate(
      { userId: user._id },
      { $pull: { items: { productId } } },
      { new: true }
    );

    if (updatedWishlist) {
      res.status(200).json({ status: true, message: "Item removed from wishlist" });
    } else {
      res.status(400).json({ status: false, message: "Wishlist not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};


// add money to wallet 

const addMoneyToWallet = async (req, res) => {
  try {
    const { amount } = req.body; // Get the amount from the request body
    const email = req.session.isLoggedEmail; 
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ status: false, message: "Invalid amount" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const userId = user._id;

    const trxId = generateTransactionId();

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({
        userId,
        balance: parsedAmount,
        transactions: [
          {
            transactionId: trxId,
            type: "credit",
            amount,
            date: new Date(),
          },
        ],
      });
    } else {
      wallet.balance += parsedAmount;
      wallet.transactions.push({
        transactionId: trxId,
        type: "credit",
        amount,
        date: new Date(),
      });
    }
    await wallet.save();

    res.status(200).json({
      status: true,
      message: "Amount added to wallet successfully",
      transactionId: trxId,
      balance: wallet.balance,
    });
  } catch (error) {
    console.error("Error adding money to wallet:", error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};



//function to generate unique transaction id 12 digits
function generateTransactionId() {
  const timestamp = Date.now(); 
  const randomNum = Math.floor(Math.random() * 1000); 
  const transactionId = `${timestamp.toString().slice(-9)}${randomNum.toString().padStart(3, '0')}`;

  return transactionId;
}



// return the order


const returnOrder = async(req,res)=>{
  try {
    const {reason,address} = req.body;
    const orderId = req.params.orderId;
    if (!reason || !address || !orderId) {
      return res.status(400).json({
        status: false,
        message: 'All fields are required (reason, address, orderId, userId)',
      });
    }
    const order = await Orders.findById(orderId);

    if(!order) return res.status(400).json({status:false,message:'Order Not Find'})

    const returnOrderData = new ReturnCancel({
      orderId:order._id,
      userId : order.userId,
      reason,
      paymentMethod : order.paymentMethod,
      paymentStatus : order.paymentStatus,
      isReturn: true, 
      pickupStatus: 'Not Scheduled', 
      refundAmount : order.totalAmount,
      pickupAddress: address, 
      adminStatus : 'Pending',
    });
    await returnOrderData.save();
    order.status = 'Returned';
    await order.save();
    res.status(201).json({
      status: true,
      message: 'Return order initiated successfully',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({status:false,message:"Internal Server Error"});
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
  googleLogin,
  productSearching,
  sortedProduct,
  filterProduct,
  sortCategoryProduct,
  categoryProductSearching,
  categoryShopFilter,
  loadOrderHistory,
  loadOrderDetails,
  loadCart,
  loadCheckout,
  loadAddress,
  loadOrderConformation,
  userDetailsSave,
  checkEmail,
  updatePassword,
  addProductToCart,
  removeFromCart,
  updateCartQuantity,
  couponValidationCheckout,
  removeCoupon,
  addAddress,
  checkoutDataStore,
  getCheckoutSummery,
  deleteAddress,
  editAddress,
  loadEditAddress,
  saveUpdatedAddress,
  submitOrder,
  cancelOreder,
  changeOrderConformationStatus,
  loadWishlist,
  loadWallet,
  loadReferral,
  addtoWishlist,
  deleteFromWishlist,
  addMoneyToWallet,
  returnOrder
};