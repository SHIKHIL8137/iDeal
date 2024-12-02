const {User,Address,OTP,Cart}=require('../../model/userModel');
const bcrypt = require('bcrypt');
const passport = require('passport');
const nodeMailer=require('nodemailer');
const { Product, Category ,Review} = require('../../model/adminModel');
require('dotenv').config()
const crypto = require('crypto');
const mongoose = require('mongoose')

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


const loadOrderHistory = async(req,res)=>{
try {

  res.status(200).render('user/orderHistory');

} catch (error) {
  res.status(500).send('Internal Server Error');
}

}


// load order detailes page

const loadOrderDetails = async(req,res)=>{
  try {
    res.status(200).render('user/orderDetails');
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
}



// load cart page


const loadCart = async (req, res) => {
  try {
    const email = req.session.isLoggedEmail;

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
  res.status(200).render('user/checkOut');
} catch (error) {
  res.status(500).send('Internal Server Error')
}

}



//load address page

const loadAddress = async(req,res)=>{
  try {
    res.status(200).render('user/address');
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
}


//load conformation page

const loadOrderConformation = async(req,res)=>{
  try {
    res.status(200).render('user/orderConformation');
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
}

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
    const email = req.session.isLoggedEmail;

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

    cart.items.splice(itemIndex, 1); // Remove the item from the cart
    cart.totalAmount = cart.items.reduce((total, item) => total + item.totalPrice, 0);

    await cart.save();

    res.status(200).json({ message: 'Item removed from cart successfully.' });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const couponValidationCheckout = async(req,res)=>{

  try {
    const { coupon } = req.body;
    const email = req.session.isLoggedEmail;


    if (!email) {
      return res.status(400).json({ message: 'Please log in to apply a coupon.' });
    }


    // const validCoupon = await Coupon.findOne({ code: coupon });
    // if (!validCoupon || validCoupon.isExpired) {
    //   return res.status(400).json({ message: 'Invalid or expired coupon.' });
    // }
   const validCoupon = {
    discountPercentage : 5
   }

    const user = await User.findOne({ email });
    const userCart = await Cart.findOne({ userId: user._id });

    if (!userCart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }


    const discountAmount = validCoupon.discountPercentage
      ? (userCart.totalAmount * validCoupon.discountPercentage) / 100
      : validCoupon.discountAmount; 


    userCart.discount = discountAmount;
    userCart.totalAmount -= discountAmount;


    // await userCart.save();


    res.status(200).json({
      success: true,
      message: `Coupon applied successfully! You saved ₹${discountAmount.toLocaleString()}.`,
      discountAmount,
      totalAmount: userCart.totalAmount,
    });
  } catch (error) {
    console.error('Error applying coupon:', error);
    res.status(500).json({ message: 'Internal server error.' });
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
  couponValidationCheckout
};