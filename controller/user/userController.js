const {User,Address,OTP,Cart,CheckOut,Orders,WishList,Wallet,Referral,ReturnCancel,PendingOrder}=require('../../model/userModel');
const bcrypt = require('bcrypt');
const passport = require('passport');
const nodeMailer=require('nodemailer');
const { Product, Category ,Review,Coupon, Offer, Transaction ,Banner} = require('../../model/adminModel');
require('dotenv').config()
const crypto = require('crypto');
const mongoose = require('mongoose');
const razorpayInstance = require('../../config/razorPay');
const PDFDocument = require('pdfkit');
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
  return res.status(200).redirect('/');
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
    if (!email) return res.status(400).send('Session expired or email not found. Please try again.');
    const user = await OTP.findOne({ email });
    if (!user) return res.status(404).send('OTP not found for this email.');
    const currentDate = new Date();
    if (currentDate > user.expiresAt) {
      await OTP.deleteMany({ email });
      return res.status(400).send('OTP has expired. Please request a new one.');
    }
    if (user.otp !== otp) return res.status(401).redirect('/user/otp?message=inavlid OTP')
    const password = req.session.password;
    const username = req.session.username;
    const newUserReferredCode = req.session.referralCode
    if (!password || !username) return res.status(400).send('Incomplete session data. Please start the registration process again.');
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
    await Wallet.findOneAndUpdate(
      { userId: rNewUserId },
      { $setOnInsert: { balance: 0 ,transactions: []} },
      { upsert: true, new: true }
    );
    await Cart.findOneAndUpdate(
      { userId: rNewUserId },
      { $setOnInsert: {items: []} },
      { upsert: true, new: true }
    );
    await OTP.deleteMany({ email });
    req.session.destroy((err) => {
      if (err) return res.status(500).send('Internal server error');
      res.redirect('/user/login?message=Registration successful! Please log in.&err=true');
    });
  } catch (error) {
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
          res.status(200).redirect('/');
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
    if (!user) return res.redirect('/user/forgotPassword?message=User not exist'); 
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
           <p><a href="https://www.kalarikkal.shop/user/changePassword/${resetToken}">Reset Password</a></p>
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
    if (!tokenRecord || tokenRecord.expiresAt < Date.now()) return res.status(400).send('Invalid or expired token')
    res.render('user/changePassword',{token,title:"Change password"});
  } catch (error) {
    console.error('Error during reset password page access:', error);
    res.status(500).send('Internal Server Error. Please try again later.');
  }};

// validate the token and after that redirect the change password page and update the password
const changePassword = async (req, res) => {
  const token = req.params.id
  const {password}  = req.body;
  try {
    const tokenRecord = await OTP.findOne({ otp: token, type: 'resetPassword' });
    if (!tokenRecord || tokenRecord.expiresAt < Date.now()) return res.status(400).send('Invalid or expired token1');
    const user = await User.findOne({ email: tokenRecord.email });
    if (!user) return res.status(400).send('User not found');
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

// route for log out user
const logOut=async(req,res)=>{
  try {
    res.status(200).redirect('/');
  } catch (error) {
    res.status(500).send('Internal server error');
  } 
}

//google login route
const googleLogin = async(req,res)=>{
  try {
    req.session.isUser=true
    res.redirect('/Shop')
  } catch (error) {
    res.status(500).send('Internal server error');
  }
}

// load Checkout page
const loadCheckout =  async(req,res)=>{
try {
  const userEmail = req.session.isLoggedEmail || 'shikhilks02@gmail.com';
  const message = req.query.message;
  const errBoolean = req.query.err;
  const coupons = await Coupon.find().sort({createdAt : -1});
  const user = await User.findOne({ email: userEmail }).populate('addresses');
  res.status(200).render('user/checkOut',{user,message,errBoolean ,coupons,title:"Check Out"});
} catch (error) {
  res.status(500).send('Internal Server Error')
}}

// load checkout data
const getCheckOutData = async(req,res)=>{
  try{
    const userEmail = req.session.isLoggedEmail || 'shikhilks02@gmail.com';
    const user = await User.findOne({ email: userEmail }).populate('addresses');
    res.status(200).json({status : true , user});
  }catch(error){
    res.status(500).json({status :false , message :'Internal server error'});
  }
}

//coupon validation and check out
const couponValidationCheckout = async (req, res) => {
  const { couponCode , currentTotal} = req.body;
  const email = req.session.isLoggedEmail;
  try {
    const user = await User.findOne({ email });
    const userId = user._id;
    const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid or inactive coupon.' });
    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validTill) return res.status(400).json({ success: false, message: 'Coupon is not valid at this time.' });
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) return res.status(400).json({ success: false, message: 'Coupon usage limit exceeded.' });
    if (coupon.usersUsed.includes(userId)) return res.status(400).json({ success: false, message: 'You have already used this coupon.' });
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart || cart.totalAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minOrderAmount} is required for this coupon.`,
      });
    }
    const discount = Math.min(
      Math.floor((coupon.discountPercentage / 100) * cart.totalAmount),
      coupon.maxDiscountAmount
    );    
    const newPrice = Math.floor(currentTotal - discount) ;
    res.status(200).json({
      success: true, 
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
    const checkOut = await CheckOut.findOne({ userId });
    if (!checkOut) return res.status(404).json({ success: false, message: 'Cart not found.' });
    const originalTotal = checkOut.totalAmount;
    await checkOut.save();
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

// get the checkout summary
const getCheckoutSummery = async(req,res)=>{
  try {
    const email = req.session.isLoggedEmail || 'shikhilks02@gmail.com';
    const user = await User.findOne({email});
    const userId = user._id;
    const userSummeryDetails = await CheckOut.findOne({userId});
    res.status(200).json(userSummeryDetails);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
}

// place oreder 
const submitOrder = async (req, res) => {
  try {
    const {
      deliveryAddress,
      billingAddress,
      paymentMethod,
      totalAmount,
      couponDiscount,
      couponCode,
    } = req.body;
    if (!deliveryAddress || !deliveryAddress._id) {
      return res.status(400).json({ message: 'Invalid delivery address' });
    }
    const deliveryAddressData = await Address.findById(deliveryAddress._id);
    if (!deliveryAddressData) {
      return res.status(400).json({ message: 'Delivery address not found' });
    }
    const email = req.session.isLoggedEmail;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userId = user._id;
    const checkout = await CheckOut.findOne({ userId });
    if (!checkout) {
      return res.status(400).json({ message: 'Checkout data not found' });
    }
    const cart = await Cart.findOne({ userId });
    if (!cart || !cart.items || !Array.isArray(cart.items) || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    const wallet = await Wallet.findOne({ userId });
    if (couponCode !== 'N/A') {
      const coupon = await Coupon.findOne({ code: couponCode });
      if (coupon && coupon.isActive) {
        coupon.usersUsed.push(user._id);
        coupon.usageCount += 1;
        await coupon.save();
      } else {
        return res.status(200).json({ message: 'Invalid or inactive coupon.' });
      }
    }
    const discount = couponDiscount + (checkout.categoryDiscount || 0);
    const appliedDiscountPercentage = ((discount / checkout.totalAmount) * 100).toFixed(2);
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
        productColor: product.color,
        productStorage: product.storage,
        firstImage: product.images[0] || null,
        quantity: item.quantity,
        price: product.price,
        total: discount === 0 ? item.quantity * item.price : (Math.round((item.quantity * item.price - (Math.round((item.quantity * item.price) * (appliedDiscountPercentage / 100) * 100) / 100)) * 100) / 100).toFixed(2),
      };
    });
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
    }   
    const orderId = `ORD${Date.now()}`;
    let razorPayOrderId;
    if (paymentMethod === 'razorPay') {
      const razorPayOrder = await razorpayInstance.orders.create({
        amount: totalAmount * 100,
        currency: 'INR',
        receipt: orderId,
      });
      if (!razorPayOrder || !razorPayOrder.id) return res.status(500).json({ message: 'Failed to create Razorpay order' });
      razorPayOrderId = razorPayOrder.id;
      const pendingOrder = new PendingOrder({
        razorPayOrderId,
        orderId,
        userId,
        pendingStatus: 'Pending-Payment',
        paymentStatus: 'Unpaid',
        paymentMethod,
        deliveryAddress: deliveryAddressData,
        billingAddress,
        products,
        subtotal: checkout.totalAmount,
        discount,
        couponDiscount,
        appliedDiscountPercentage,
        totalAmount,
        appliedCoupon: couponCode,
        total_Amt_WOT_Discount: cart.totalActualAmount,
        deliveryFee: checkout.deliveryFee,
      });    
      await pendingOrder.save();
      await CheckOut.deleteOne({ userId });
      await Cart.updateOne(
        { userId },
        {
          $set: {
            items: [],
            totalAmount: 0,
            totalDiscountAmount: 0,
            updatedAt: new Date(),
          },
        }
      );
      const razorPayKey = process.env.RAZORPAY_KEY_ID;
      return res.status(200).json({
        message: 'Pending order created, awaiting payment',
        orderId,
        razorPayOrderId,
        razorPayKey,
      });
    } else if (paymentMethod === 'Wallet') {
      if (totalAmount < wallet.balance) {
        const order = new Orders({
          orderId,
          userId,
          orderDate: new Date(),
          status: 'Processing',
          paymentStatus: 'Paid',
          paymentMethod,
          deliveryAddress: deliveryAddressData,
          billingAddress,
          products,
          subtotal: checkout.totalAmount,
          discount,
          totalAmount,
          appliedDiscountPercentage,
          couponDiscount,
          appliedCoupon: couponCode,
          total_Amt_WOT_Discount: cart.totalActualAmount,
          deliveryFee: checkout.deliveryFee,
        });
        await order.save();
        const trxId = generateTransactionId();
        wallet.balance -= totalAmount;
        wallet.transactions.push({
          transactionId: trxId,
          type: 'debit',
          amount: totalAmount,
          date: new Date(),
        });
        await wallet.save();
        try {
          await finalizeOrder(userId, products, checkout);
        } catch (finalizeError) {
          await Orders.deleteOne({ orderId });
          return res.status(400).json({ message: finalizeError.message });
        }
        return res.status(200).json({ message: 'Order placed successfully', orderId });
      } else {
        return res.status(400).json({ message: 'Insufficient Balance' });
      }
    }
    const order = new Orders({
      orderId,
      userId,
      orderDate: new Date(),
      status: 'Processing',
      paymentStatus: 'Unpaid',
      paymentMethod,
      deliveryAddress: deliveryAddressData,
      billingAddress,
      products,
      subtotal: checkout.totalAmount,
      discount,
      totalAmount,
      couponDiscount,
      appliedDiscountPercentage,
      appliedCoupon: couponCode,
      total_Amt_WOT_Discount: cart.totalActualAmount,
      deliveryFee: checkout.deliveryFee,
    });
    await order.save();
    try {
      await finalizeOrder(userId, products, checkout);
    } catch (finalizeError) {
      await Orders.deleteOne({ orderId });
      return res.status(400).json({ message: finalizeError.message });
    }
    return res.status(200).json({ message: 'Order placed successfully', orderId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// varification
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    const orderId = req.params.orderId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    if (expectedSignature !== razorpay_signature) {
      await PendingOrder.updateOne(
        { orderId },
        { paymentStatus: 'Failed', pendingStatus: 'Payment Failed' }
      );
      return res.status(400).json({ success: false, message: 'Payment verification failed!' });
    }
    const pendingOrder = await PendingOrder.findOne({ orderId }).populate('userId','email');
    if (!pendingOrder) {
      return res.status(404).json({ success: false, message: 'Pending order not found!' });
    }
    const order = new Orders({
      ...pendingOrder.toObject(),
      status: 'Processing',
      paymentStatus: 'Paid',
    });
    try {
      await order.save();
      await finalizeOrder(pendingOrder.userId, pendingOrder.products, { totalAmount: pendingOrder.subtotal });
    } catch (finalizeError) {

      await Orders.deleteOne({ orderId });
      return res.status(400).json({ success: false, message: finalizeError.message });
    }
    const transactionId = generateTransactionId();
    const newTransaction = new Transaction({
     userId : pendingOrder.userId,
     customer : pendingOrder.userId.email,
     transactionType : 'credit',
     amount : pendingOrder.totalAmount,
     transactionId,
     paymentMethod : pendingOrder.paymentMethod,    
    })
    await newTransaction.save();
    await PendingOrder.deleteOne({ orderId });
    res.json({ success: true, message: 'Payment verified successfully!', orderId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// finalize the order
const finalizeOrder = async (userId, products, checkout, res) => {
  for (const item of products) {
    const product = await Product.findById(item.productId);
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for${product.name}`);
    }
    product.stock -= item.quantity;
    await product.save();
  }
  await CheckOut.deleteOne({ userId });
  await Cart.updateOne(
    { userId },
    {
      $set: {
        items: [],
        totalAmount: 0,
        totalDiscountAmount: 0,
        updatedAt: new Date(),
      },
    }
  );
};

//function to generate unique transaction id 12 digits
function generateTransactionId() {
  const timestamp = Date.now(); 
  const randomNum = Math.floor(Math.random() * 1000); 
  const transactionId = `${timestamp.toString().slice(-9)}${randomNum.toString().padStart(3, '0')}`;
  return transactionId;
}

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
 
// load payment success page
const loadSuccess = async(req,res)=>{
  try {
    res.status(200).render('user/paymentSuccess',{title:'Payment Success'})
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
}

//load payment faild page
const loadFaild = async(req,res)=>{
  try {
    res.status(200).render('user/paymentFaild',{title:'Payment Faild'})
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
}

// pending order details 
const loadPending = async(req,res)=>{
  try {   
const orderId = req.query.orderId;
const pendings = await PendingOrder.findOne({orderId});
const razorPayKey = process.env.RAZORPAY_KEY_ID;
res.status(200).render('user/pendingDetails',{pendings,title :"Pending Orders",razorPayKey})
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
}

// get banner
const getbanners = async (req, res) => {
  try {
      const banner = await Banner.findOne(); 
      if (!banner) {
          return res.status(404).json({ error: 'No banners found.' });
      }
      res.status(200).json({
          success: true,
          data: banner,
      });
  } catch (error) {
      console.error('Error fetching banners:', error);
      res.status(500).json({ error: 'Failed to fetch banners.' });
  }
};

module.exports={
  loadlogin ,
  loadsignUp,
  loadForgotPassword,
  loadChangePassword,
  registerUserNormal,
  otpVerification,
  resendPassword,
  loginVelidation,
  productReview,
  forgotPassword,
  resetPasswordPage,
  changePassword,
  logOut,
  googleLogin,
  loadCheckout,
  couponValidationCheckout,
  removeCoupon,
  getCheckoutSummery,
  submitOrder,
  loadReferral,
  loadSuccess,
  loadFaild,
  verifyPayment,
  loadPending,
  getbanners,
  getCheckOutData,
};