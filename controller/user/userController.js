const {User,Address,OTP,Cart,CheckOut,Orders}=require('../../model/userModel');
const bcrypt = require('bcrypt');
const passport = require('passport');
const nodeMailer=require('nodemailer');
const { Product, Category ,Review,Coupon} = require('../../model/adminModel');
require('dotenv').config()
const crypto = require('crypto');
const mongoose = require('mongoose');
const { triggerAsyncId } = require('async_hooks');

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
  const userId = req.session.userId || '6745ee262ef67315e2da1c5e';
  const {rating,reviewText} =req.body;
console.log('review')
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
      const productDetails = await Product.findById(firstProduct.productId); 
      order.firstProductName = productDetails.name;
      order.firstProductQuantity = firstProduct.quantity; 
    }

    res.status(200).render('user/orderHistory', { orders });
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
};

  




// load order detailes page

const loadOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Orders.findOne({ orderId })
      .populate('userId', 'username email') 
      .populate('deliveryAddress') 
      .populate('billingAddress') 
      .populate('products.productId');
    
    if (!order) {
      return res.status(404).send('Order not found');
    }
    res.status(200).render('user/orderDetails', { order });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};



// load cart page


const loadCart = async (req, res) => {
  try {
    const email = req.session.isLoggedEmail ;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send('User not found');
    }

    const userId = user._id;


    const userCart = await Cart.findOne({ userId }).populate('items.productId');
    res.status(200).render('user/cart', { userCart });
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
  res.status(200).render('user/checkOut',{user,message,errBoolean});
} catch (error) {
  res.status(500).send('Internal Server Error')
}

}



//load address page

const loadAddress = async(req,res)=>{
  try {

    const errBoolean = req.query.err === 'true'?true:false;
    const message = req.query.message;
    res.status(200).render('user/address',{message,errBoolean});
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
}


//load conformation page

const loadOrderConformation = async (req, res) => {
  try {
    const orderId = req.params.id;
    const orderDetails = await Orders.findOne({ orderId }).populate('userId').populate('products.productId').populate('deliveryAddress').exec();
    if (!orderDetails) {
      return res.status(404).send('Order not found');
    }
    res.status(200).render('user/orderConformation', { orderDetails });
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
    console.log(exists);
  
  res.json({ exists }); 
  } catch (error) {
    res.status(500).send("Internal server error");
  }
}


// userProfile update password

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    console.log(currentPassword,newPassword);

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new passwords are required' });
    }

    const email = req.session.isLoggedEmail;
    const user = await User.findOne({ email });


    if (!user || !user.password) {
      console.log('User or password not found:', user); 
      return res.status(404).json({ message: 'User not found or password not set' });
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

    const item = cart.items[itemIndex];

    if (action === 'increment') {
      if (item.quantity >= 10) {
        return res.status(400).json({ message: 'Maximum quantity reached (10).' });
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

const couponValidationCheckout = async (req, res) => {
  const { couponCode } = req.body;
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

    const discount = Math.min(
      (coupon.discountPercentage / 100) * cart.totalAmount,
      coupon.maxDiscountAmount || Infinity
    );
    const newPrice = cart.totalAmount - discount
    console.log(newPrice);
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
    console.log(user.addresses.length)
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
    console.log(checkOutData)
    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userId = new mongoose.Types.ObjectId(user._id);


    // Check if checkout data exists for the user
    const existUser = await CheckOut.findOne({ userId });
    if (existUser) {
      // Update the existing record
      const result = await CheckOut.updateOne(
        { userId },
        { $set:checkOutData}
      );
      console.log('Update Result:', result);
      if (result.matchedCount === 0) {
        console.error('No matching record found for update.');
        return res.status(404).json({ message: 'Record not found for update' });
      }
    } else {
      // Create a new checkout data entry
      const newCheckOut = new CheckOut({ userId, ...checkOutData });
      await newCheckOut.save();
    }

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
    console.log(error)
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

    res.status(200).render('user/editAddress', { message, errBoolean, editedAddress});
  } catch (error) {
    console.log(error);
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

    const userId = deliveryAddressData.user;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const checkout = await CheckOut.findOne({ userId });
    if (!checkout) {
      return res.status(400).json({ message: 'Checkout data not found' });
    }

    const cart = await Cart.findOne({ userId: user._id });
    if (!cart || !cart.items || !Array.isArray(cart.items) || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const products = cart.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      total: item.quantity * item.price,
    }));

    const subtotal = products.reduce((sum, item) => sum + item.total, 0);
    const discount = checkout.discount || 0;
    const totalAmount = subtotal + discount;

    const order = new Orders({
      orderId: `ORD${Date.now()}`,
      userId: user._id,
      orderDate: new Date(),
      status: 'Processing',
      paymentStatus: 'Unpaid',
      paymentMethod,
      deliveryAddress: deliveryAddressData._id,
      billingAddress:billingAddress,
      products,
      subtotal,
      discount,
      totalAmount,
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
    order.status = 'Cancelled';
    await order.save(); 
    res.json({ message: 'Order canceled successfully', order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
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
  cancelOreder
};