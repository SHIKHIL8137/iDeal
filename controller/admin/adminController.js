const {Product,Category,Admin,Coupon, Offer,Transaction,Banner} = require('../../model/adminModel');
const {User,Address,OTP,Orders,ReturnCancel,Wallet}=require('../../model/userModel');
const fs= require('fs');
const path = require('path');
const sharp=require('sharp');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodeMailer=require('nodemailer');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');



// admin login validation

const adminValidation=async(req,res)=>{

  try {
    const adminDetails=req.body;
    const {email,password}= adminDetails;
  
  
    const adminExist = await Admin.findOne({email:email});
    
  
    if(!adminExist) return res.status(200).redirect('/admin/login?message=Invalid User name and passowrd');
  
   
  
     const passwordDB=adminExist.password
     const emailDB = adminExist.email
  
  if(email===emailDB){
    const isMatch = await bcrypt.compare(password, passwordDB);
      if(isMatch){
        const usernameofLogin = adminExist.name;
        req.session.isValidAdmin=true
        req.session.username = usernameofLogin;
       return res.status(200).redirect('/admin/dashboard?message=Login SuccessFully');
      }else{
        res.redirect('/admin/login?message=Invalid Password');
      }
  }else{
    res.redirect('admin/login');
  }
  } catch (error) {
    res.status(401).send("Internal Server error");
  }
  
  }



// rendering the login page

const loadLogin=async(req,res)=>{
  try {

    const message = req.query.message;
    const err=req.query.err
    const errBoolean = err === 'true';
    res.status(200).render('admin/login',{message,errBoolean,title:"Login"})
  } catch (error) {
    res.status(500).send('Internal server error');
  }
}



// rendering the forgotPassword page

const loadforgotPassword=async(req,res)=>{
  try {
    const message = req.query.message;
    res.status(200).render('admin/forgotPassword',{message,title:"Forgot Password"})
  } catch (error) {
    res.status(500).send('Internal server error');
  }
}



// redering the product page

const loadProduct=async(req,res)=>{
  try {
    const username=req.session.username;
    const message=req.query.message;
    const products=await Product.find().populate('category');
    res.status(200).render('admin/product',{products,message,username,title:"Products"})
  } catch (error) {
    res.status(500).send('Internal server error');
  }
}

// render the add product page

const loadAddProduct=async(req,res)=>{
  try {
    const username=req.session.username;
    let message=req.query.message
    req.query.message=null;
    const category=await Category.find();

    res.status(200).render('admin/addProduct',{message,category,username,title:"Add Product"})
    message=null
  } catch (error) {
    console.log(error)
    res.status(500).send('Internal server error');
  }
}

// render the Edit Product page

const loadEditProduct=async(req,res)=>{
  try {
    const username=req.session.username;
    const productId=req.params.id;
    const productDetails = await Product.findById(productId).populate('category');
    const categoryDetails = await Category.find();
    res.status(200).render('admin/editProduct',{productDetails,categoryDetails,username,title:"Edit Product"});
  } catch (error) {
    res.status(500).send('Internal server error');
  }
}


// render the category page

const loadCategory=async(req,res)=>{
  try {
    const username=req.session.username;
const category=await Category.find();
const message=req.query.message;
    res.status(200).render('admin/category',{category,message,username,title:"Category"});
  } catch (error) {
    res.status(500).send('Internal server error');
  }
}

// render the add category page

const loadAddCategory=async(req,res)=>{
  try {
    const username=req.session.username;
    const message=req.query.message;
    const err=req.query.err;
    const errBoolean = err === 'true';
    res.status(200).render('admin/addCategory',{message,errBoolean,username,title:"Add Category"});
  } catch (error) {
    res.status(500).send('Internal server error');
  }
}

// render the edit category page

const loadEditCategory=async(req,res)=>{
  try{  
    const username=req.session.username;
    const categoryId=req.params.id
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).redirect('/admin/category?message=Category not found please try again later');
    }
  res.status(200).render('admin/editCategory',{category,username,title:"Edit Category"});
  } catch (err) {
    res.status(500).send('Server error');
  }
}

// renter the customers listing page

const loadCustomers=async(req,res)=>{
  try {
    const message = req.query.message;
    const username=req.session.username;
    const userDetails=await User.find();
    res.status(200).render('admin/customers',{userDetails,message,username,title:"Customers"})
  } catch (error) {
    res.status(500).send('Internal server error');
  }
}

// renter the customers edit page

const loadEditCustomer=async(req,res)=>{
  try {
    const userid=req.params.id;
    const username=req.session.username;
    const userDetails=await User.findById(userid)
    if (!userDetails) {
      return res.status(404).redirect('/admin/customers?message=Category not found please try again later');
    }
    res.status(200).render('admin/editCustomer',{userDetails,username,title:"Edit Customer"})
  } catch (error) {
    res.status(500).send('Internal server error');
  }
}

// render the add customer Page

const loadAddCustomer=async(req,res)=>{
  try {
    const username=req.session.username;
    const message = req.query.message
    res.status(200).render('admin/addCustomer',{message,username,title:"Add Customer"});
  } catch (error) {
    res.status(500).send('Internal server error');
  }
}


// addNew product post route

const addProducts = async (req, res) => {
  try {
    const { name, description, price, discount, storage, color, quantity, category, condition, connectivity } = req.body;
    // const productExists = await Product.findOne({ name : name});
    // if (productExists) {
    //   return res.status(400).send('Product already exists');
    // }

    const images = [];

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const originalImagePath = req.files[i].path;

        const resizedImagePath = path.join(__dirname, '..', '..', 'public', 'uploads', 'product-images', req.files[i].filename);

        const targetDir = path.dirname(resizedImagePath);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        await sharp(originalImagePath)
          .resize({width:800})
          .toFile(resizedImagePath);
        images.push(`/uploads/product-images/${req.files[i].filename}`);
      }
    } 
    const discountedPrice = price - (price * discount) / 100;
    const categoryDoc = await Category.findOne({ name: category });
    const categoryId = categoryDoc._id;
    if (!categoryDoc) {
      return res.status(400).send('Invalid category');
    }
    const newProduct = new Product({
      name:name.trim(),
      description,
      price,
      Dprice: discountedPrice,
      storage,
      color,
      stock:quantity,
      category:categoryId,
      condition,
      connectivity,
      images
    });

    await newProduct.save();
    
    res.redirect('/admin/addProduct?message=product added successfuly');
  } catch (error) {
    console.error("Error while adding product:", error);
    return res.redirect('admin/pageerror');
  }
};


// add new category route

const addCategory=async(req,res)=>{
 try {
  const categoryDetails= req.body;
  const{name ,description , status }=categoryDetails;
  const trimedName=name.trim();
  const nameExists=await Category.findOne({name:trimedName});
  if(nameExists){
   return res.redirect('/admin/addCategory?message=the category exists&err=false');
  }
  const boolenValue=status==='true';
  const newCategory=new Category({
    name:trimedName,
    description,
    status:boolenValue,
  })
  await newCategory.save();
  res.redirect('/admin/addCategory?message=Catagory added Successfully&err=true');
 } catch (error) {
  res.status(500).send('Inernal server error');
 }
}


// Delete product route

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id); 
    res.redirect('/admin/product?message=Product deleted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


//update category route

const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { categoryName, description, status } = req.body; 
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId, 
      { 
        name: categoryName.trim(),
        description: description,
        status: status
      }, 
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).redirect('/admin/category?message=Category not Found');
    }

    res.status(200).redirect('/admin/category?message=Category updated successfully');
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// Delete category route

const deleteCategory=async(req,res)=>{
  try {
    const categoryId = req.params.id;
    await Product.deleteMany({ category: categoryId });
    await Category.findByIdAndDelete(categoryId); 

    res.redirect('/admin/category?message=Category and its products deleted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}


// Edit proudct route

const editProduct = async (req, res) => {
  try {
    const productId = req.params.id; 
    const { name, description, price, discount, storage, color, quantity, category, condition, connectivity } = req.body;
console.log(req.files)
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).send('Invalid Product ID');
    }


    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send('Product not found');
    }


    const categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      return res.status(400).send('Invalid category');
    }

    const categoryId = categoryDoc._id;
    

    const updates = {};


    if (name) updates.name = name;
    if (description) updates.description = description;
    if (price) updates.price = price;
    if (discount) updates.Dprice = price - (price * discount) / 100;
    if (storage) updates.storage = storage;
    if (color) updates.color = color;
    if (quantity) updates.stock = quantity;
    if (category) updates.category = categoryId;
    if (condition) updates.condition = condition;
    if (connectivity) updates.connectivity = connectivity;


    if (req.files && req.files.length > 0) {
      const images = [];
      for (let i = 0; i < req.files.length; i++) {
        const originalImagePath = req.files[i].path;
        const resizedImagePath = path.join(
          __dirname,
          '..',
          '..',
          'public',
          'uploads',
          'product-images',
          req.files[i].filename
        );

        const targetDir = path.dirname(resizedImagePath);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        await sharp(originalImagePath)
          .resize({width:800})
          .toFile(resizedImagePath);

        images.push(`/uploads/product-images/${req.files[i].filename}`);
      }

      updates.images = [...(product.images || []), ...images];
    }


    updates.updatedAt = Date.now();


    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updates },
      { new: true } 
    );

    if (!updatedProduct) {
      return res.status(500).send('Product update failed');
    }

    res.status(200).redirect(`/admin/product?message=Product edited Successfully`);
  } catch (error) {
    console.error('Error while editing product:', error);
    res.status(500).send('An error occurred while updating the product');
  }
};



// add new admin route

const addAdmin=async(req,res)=>{

 try {
  const adminDetails=req.body;
 const {name,email,password}=adminDetails;
console.log(req.body);
 const user = await Admin.findOne({email});
 if(user) return res.status(400).send("user exist");
 const hashedPassword = await bcrypt.hash(password, 10);
 const newUser=new Admin({

  name:name.trim(),
  email:email.trim(),
  password:hashedPassword,

 })



const response = await newUser.save();
console.log(response);
res.status(200).redirect('/admin/login')
 } catch (error) {
  console.log(error)
  res.status(500).send("Internal Server eroor");
 }
}



// Rendering Dashboard page

const loadDashboard=async(req,res)=>{
try {
  const username=req.session.username;
  const message=req.query.message;
  res.status(200).render('admin/dashboard',{message,username,title:"Dashboard"});
} catch (error) {
  res.status(500).send('internal server error');
}
}


// Delete users route

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id); 
    res.redirect('/admin/customers?message=User deleted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


// check the email exist or not in the db after that edit the email

const checkEmail=async(req,res)=>{
  try {
    const email= req.query.email;
    if(!email){
      return res.status(400).json({error:'Email is required'})
    }
    const user = await User.findOne({ email });
      const exists = user && user.email === email;
  
  res.json({ exists }); 
  } catch (error) {
    res.status(500).send("Internal server error");
  }
}



// update or edit the customer details route

const updateCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;
    const { name, email, phone ,status} = req.body; 
    const updatedUser = await User.findByIdAndUpdate(
      customerId, 
      { 
        username: name.trim(),
        email: email.trim(),
        phone: phone,
        block:status
      }, 
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).redirect('/admin/customers?message=user not Found');
    }

    res.status(200).redirect('/admin/customers?message=User updated successfully');
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



// add new customer route

const addCustomer=async(req,res)=>{
try {
  const newCustomerDetails=req.body;
const {name, email ,phone , password} = newCustomerDetails;
const userExist=await User.findOne({email:email});
if(userExist) return res.redirect('/admin/addCustomer?message=The User exists');
const hashedPassword =await bcrypt.hash(password,10);
const newUser=new User({
  username:name.trim(),
  email:email.trim(),
  phone:phone,
  password:hashedPassword
})

await newUser.save();
res.redirect('/admin/customers?message=User added successfuly')
} catch (error) {
  res.status(500).send("Internal server error");
}
}


// admin logOut route

const logOut=async(req,res)=>{
  try {
    res.status(200).redirect('/admin/login');
  } catch (error) {
    res.status(500).send('Internal server error');
  } 
}



// Delete Product image from the edit page of product

const deleteProductImage = async (req, res) => {
  try {
    const productId = req.params.id;
    const index = parseInt(req.params.index);

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const imageToRemove = product.images[index];
    product.images.splice(index, 1); 
    await product.save();

    // Optionally delete the file from the server
    const filePath = path.join(__dirname, '..', 'public', imageToRemove);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    console.log('deleteProductImage')
    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const transporter = nodeMailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});



// check the email is exist or not for resting password route

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

  
    const user = await Admin.findOne({ email });
    if (!user) {
      return res.redirect('/admin/forgotPassword?message=User not exist'); 
    }
    await sendResetPasswordLink(email, req, res);
  } catch (error) {
    console.error('Error during forgot password process:', error);
    res.status(500).send('Internal Server Error. Please try again later.');
  }
};


// the function for rest password link to the user email

async function sendResetPasswordLink(email, req, res) {
  const resetToken = crypto.randomBytes(32).toString('hex');
  console.log(resetToken);

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

  const mailOptions = {
    from: 'iDeal@gmail.com',
    to: email,
    subject: 'Password Reset Request',
    html: `<p>You requested a password reset. Please click the link below to reset your password:</p>
           <p><a href="https://www.kalarikkal.shop/admin/changePassword/${resetToken}">Reset Password</a></p>
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
    res.status(200).render('admin/forgotPassword', { message: "Password reset link sent successfully. Please check your inbox.",title:"Forgot Password" });

  } catch (error) {
    console.error('Error sending password reset email:', error);
    res.status(500).send('Failed to send password reset email. Please try again later.');
  }
}


// rentering change password page if the rest token valid

const resetPasswordPage = async (req, res) => {
  const  token  = req.params.id;
  try {
   
    const tokenRecord = await OTP.findOne({ otp: token, type: 'resetPassword' });

    if (!tokenRecord || tokenRecord.expiresAt < Date.now()) {
      return res.status(400).send('Invalid or expired token');
    }

 
    res.render('admin/changePassword',{token,title:"Change Password"});
  } catch (error) {
    console.error('Error during reset password page access:', error);
    res.status(500).send('Internal Server Error. Please try again later.');
  }
};


// changepassword password route 

const changePassword = async (req, res) => {
  const token = req.params.id
  const {password}  = req.body;
  try {

    const tokenRecord = await OTP.findOne({ otp: token, type: 'resetPassword' });

    if (!tokenRecord || tokenRecord.expiresAt < Date.now()) {
      return res.status(400).send('Invalid or expired token1');
    }

    const user = await Admin.findOne({ email: tokenRecord.email });
    if (!user) {
      return res.status(400).send('User not found');
    }
    const hashedPassword = await bcrypt.hash(password,10)
    user.password = hashedPassword; 
    await user.save();

    await OTP.deleteOne({ otp: token });
    req.session.destroy();
    res.status(200).redirect('/admin/login?message=Reset password successful&err=true')
  } catch (error) {
    console.error('Error during password reset:', error);
    res.status(500).send('Internal Server Error. Please try again later.');
  }
};


// orders page load


const loadOrder = async (req, res) => {
  try {
    const username = req.session.username;
    const message = req.query.message;

    const orders = await Orders.find()
      .populate('userId', 'firstName lastName email')
      .populate('products.productId', 'name price')
      .exec();

  

    res.status(200).render('admin/orders', { username, message, orders , title:"Orders"});
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};



// load loadDetilas page

const loadDetails = async(req,res)=>{
  try {
  const username=req.session.username;
  const message=req.query.message;
  const orderId = req.params.orderId;
    const order = await Orders.findById(orderId)
      .populate('userId products.productId deliveryAddress billingAddress')
      .exec();

    res.render('admin/orderDetails', {
      order,
      username, 
      message,
      title:"Order Details"
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
}


// add coupon route

const addCoupon = async(req,res)=>{
  try {
    const {
      code,
      description,
      discountPercentage,
      minOrderAmount,
      maxDiscountAmount,
      validFrom,
      validTill,
      usageLimit,
    } = req.body;
console.log(req.body);
    if (!code || !discountPercentage || !validFrom || !validTill) {
      return res.status(400).json({ status: 'error', message: 'All required fields must be provided.' });
    }
    const newCoupon = new Coupon({
      code : code.trim().toUpperCase(),
      discountPercentage : discountPercentage.trim(),
      description : description.trim(),
      minOrderAmount: minOrderAmount || 0,
      maxDiscountAmount: maxDiscountAmount || null,
      validFrom: new Date(validFrom),
      validTill: new Date(validTill),
      usageLimit: usageLimit || null,
    });

    await newCoupon.save();
    res.status(201).redirect('/admin/Coupon');
  } catch (error) {
    console.error('Error adding coupon:', error);
    res.status(500).send('Internal server Error');
  }
}

//function to generate unique transaction id 12 digits
function generateTransactionId() {
  const timestamp = Date.now(); 
  const randomNum = Math.floor(Math.random() * 1000); 
  const transactionId = `${timestamp.toString().slice(-9)}${randomNum.toString().padStart(3, '0')}`;

  return transactionId;
}


//update the order status


const updateOrderStatus = async (req, res) => {
  const orderId = req.params.orderId;
  const { status } = req.body;

  console.log('Received orderId:', orderId);
  console.log('Received new status:', status);

  try {
    const order = await Orders.findById(orderId).populate('products.productId').populate('userId','email'); 

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (status === 'Cancelled') {
      for (const item of order.products) {
        const product = await Product.findById(item.productId); 
        if (product) {
          product.stock += item.quantity; 
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
    }

    order.status = status;
    if(status === 'Delivered')
    {
      order.paymentStatus = 'Paid';
    }
    const updatedOrder = await order.save(); 
    if(status === 'Delivered'){
      const transactionId = generateTransactionId();
      const newTransaction = new Transaction({
       userId : order.userId,
       customer : order.userId.email,
       transactionType : 'credit',
       amount : order.totalAmount,
       transactionId,
       paymentMethod : order.paymentMethod,    
      })
  
      await newTransaction.save();
    }   
    res.status(200).json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// load offer

const loadOffer = async (req, res) => {
  try {
    const username = req.session.username;
    const message = req.query.message;
    const err=req.query.err
    const errBoolean = err === 'true';
    res.status(200).render('admin/offer', {
      title: "Offer",
      username,
      message,
      errBoolean,
    });
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
};



// Load Coupon 

const loadCoupon = async(req,res)=>{
  try {
    const username=req.session.username;
    const message = req.query.message;
    const errBoolean = req.query.err === "true"
    res.status(200).render('admin/coupon',{title:"Coupon",username,message,errBoolean});
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
}


// add coupon



const loadAddCoupon = async(req,res)=>{

  try {
    const username=req.session.username;
    res.status(200).render('admin/addCoupon',{title:"Add Coupon",username});
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
}


//Edit coupon

const loadEditCoupon = async(req,res)=>{

  try {
    const id = req.params.couponId;
    const username=req.session.username;
    const coupon = await Coupon.findById(id);
    res.status(200).render('admin/editCoupon',{title:"Edit Coupon",username,coupon});
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
}


// load Sales report page 

const loadSales = async(req,res)=>{
  try {
    const username=req.session.username;
    res.status(200).render('admin/sales',{username,title:"Sales"});
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
}

// Edit coupon 


const editCoupon = async (req, res) => {
  try {
    const {
      couponId,
      code,
      description,
      discountPercentage,
      minOrderAmount,
      maxDiscountAmount,
      validFrom,
      validTill,
      usageLimit,
      status,
    } = req.body;

    console.log('Edit Coupon Request:', req.body);

    if (!couponId || !code || !discountPercentage || !validFrom || !validTill) {
      return res.redirect('/admin/Coupon?message=All fields are require&err=false'); 
    }

    if (discountPercentage < 0 || discountPercentage > 100) {
      return res.redirect('/admin/Coupon?message=Invalid input dicount percentage exied or less than 0&err=false');
    }

    const validFromDate = new Date(validFrom);
    const validTillDate = new Date(validTill);

    if (validFromDate > validTillDate) {
      return res.redirect('/admin/Coupon?message=Invalid end date&err=false');
    }

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.redirect('/admin/Coupon?message=Invalid Coupon ID&err=false');
    }

    coupon.code = code.trim().toUpperCase();
    coupon.description = description ? description.trim() : coupon.description;
    coupon.discountPercentage = parseFloat(discountPercentage); 
    coupon.minOrderAmount = minOrderAmount ? parseFloat(minOrderAmount) : 0;
    coupon.maxDiscountAmount = maxDiscountAmount ? parseFloat(maxDiscountAmount) : null;
    coupon.validFrom = validFromDate;
    coupon.validTill = validTillDate;
    coupon.usageLimit = usageLimit ? parseInt(usageLimit, 10) : null;
    coupon.isActive = status === 'true';

    await coupon.save();
   console.log(coupon);
    res.redirect('/admin/Coupon?message=Coupen Added SuccessFully&err=true');
  } catch (error) {
    console.error('Error editing coupon:', error);
    res.redirect('/admin/Coupon?message=Internal Server Error Please try again later&err=false');
  }
};


// get the coupon table

const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    const updatedCoupons = coupons.map((coupon) => {
      if (new Date(coupon.validTill) < new Date()) {
        coupon.isActive = false; 
      }
      return coupon;
    });
    res.status(200).json({ status: 'success', coupons: updatedCoupons});
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

// search coupon


const searchCoupon = async (req, res) => {
  const searchTerm = req.query.search || '';
  try {
    const coupons = await Coupon.find({code: { $regex: searchTerm, $options: 'i' }}).exec();

    res.json({ status: 'success', coupons });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch coupons' });
  }
}



// load return page


const loadReturn = async(req,res)=>{
  try {
    const username=req.session.username;
    res.status(200).render('admin/return',{title : "Returns",username});
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
}



// load return table 

const getReturnData = async (req, res) => {
  try {
    const returnData = await ReturnCancel.find({ isReturn: true })
  .populate('userId', 'email') 
  .populate('orderId', 'orderId totalAmount')
  .populate('productId', 'name')
  .sort({ createdAt: -1 }); 

    if (!returnData.length) {
      return res.status(404).json({
        status: false,
        message: 'No return requests found.',
      });
    }
    res.status(200).json({
      status: true,
      data: returnData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: 'Internal Server Error',
    });
  }
};


// approve Return 
const approveReturn = async (req, res) => {
  try {
    const { returnCancelId } = req.body; 
    if (!returnCancelId) {
      return res.status(400).json({ status: false, message: "returnCancelId is required" });
    }

    const returnCancel = await ReturnCancel.findByIdAndUpdate(
      returnCancelId, 
      { $set: { adminStatus: 'Approved' } }, 
      { new: true } 
    );

    if (!returnCancel) {
      return res.status(404).json({ status: false, message: "Return request not found" });
    }

    const user = await User.findById(returnCancel.userId);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }
    const product = await Product.findById(returnCancel.productId);
    if (!product) {
      return res.status(404).json({ status: false, message: "Product not found" });
    }
    const order = await Orders.findByIdAndUpdate(
      returnCancel.orderId,
      {
        $inc: {
          totalAmount: -returnCancel.refundAmount,
          total_Amt_WOT_Discount: -product.Dprice,
        },
      },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ status: false, message: "Order not found" });
    }
 
    const trxId = generateTransactionId();
    let userWallet = await Wallet.findOne({ userId : returnCancel.userId });
    if(!userWallet) return res.status(404).json({ status: false, message: "Wallet not found" });
    userWallet.balance += returnCancel.refundAmount;
    userWallet.transactions.push({
      transactionId: trxId,
      type: "credit",
      amount : returnCancel.refundAmount,
      date: new Date(),
    });

    await userWallet.save();
    await Product.findByIdAndUpdate(
      returnCancel.productId,
      { $inc: { stock: returnCancel.productQauntity } },
      { new: true }
    );

    const newTransaction = new Transaction({
      userId : user._id,
      customer : user.email,
      transactionType : 'debit',
      amount : returnCancel.refundAmount,
      transactionId : trxId,
      paymentMethod : returnCancel.paymentMethod,    
     })
     await newTransaction.save();
    res.status(200).json({ status: true, message: "Return request approved", data: returnCancel });
  } catch (error) {
    console.error("Error approving return:", error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};



// retrun rejsect


const rejectReturn = async (req,res)=>{
  try {
    const { returnCancelId, reason } = req.body;
    if (!returnCancelId) {
      return res.status(400).json({
        status: false,
        message: 'ReturnCancel ID is required.',
      });
    }

    const updatedRequest = await ReturnCancel.findByIdAndUpdate(
      returnCancelId,
      {
        $set: {
          adminStatus: 'Rejected',
          reasonForRejection: reason || 'No reason provided.',
        },
      },
      { new: true } 
    );

    const updateOrderStatus = await Orders.findByIdAndUpdate(
      updatedRequest.orderId, 
      { $set: { status: "Delivered" } }
    );

    if (!updateOrderStatus) {
      return res.status(404).json({
        status: false,
        message: 'Order associated with this return request not found.',
      });
    }


    if (!updatedRequest) {
      return res.status(404).json({
        status: false,
        message: 'ReturnCancel request not found.',
      });
    }

    res.status(200).json({
      status: true,
      message: 'The return request has been successfully rejected.',
      data: updatedRequest,
    });
  } catch (error) {
    console.error('Error rejecting return request:', error);
    res.status(500).json({
      status: false,
      message: 'Internal Server Error',
    });
  }
}

//function to generate unique transaction id 12 digits
function generateTransactionId() {
  const timestamp = Date.now(); 
  const randomNum = Math.floor(Math.random() * 1000); 
  const transactionId = `${timestamp.toString().slice(-9)}${randomNum.toString().padStart(3, '0')}`;

  return transactionId;
}




// get return order details


const getreturnOrderDetails = async (req, res) => {
  try {
      const returnid = req.params.returnId;
      console.log(returnid);
      const returnOrder = await ReturnCancel.findById(returnid).populate('userId', 'firstName lastName email phone').populate('productId','name');

      if (!returnOrder) {
          return res.status(404).send('Return Order Not Found');
      }

      res.status(200).render('admin/returnOrderDetails', { returnOrder,title:"Return Order Details",username:'shikhil'});
  } catch (error) {
      console.error('Error fetching return order details:', error);
      res.status(500).send('Internal Server Error');
  }
};



// load add Offer




const loadAddOffer = async (req, res) => {
  try {
    const username=req.session.username;
    const allCategories = await Category.find();
    const allProducts = await Product.find();


    const activeOffers = await Offer.find({ isActive: true });


    const offeredCategories = activeOffers
      .filter(offer => offer.applicableTo === 'Category')
      .map(offer => offer.category?.toString());
    const offeredProducts = activeOffers
      .filter(offer => offer.applicableTo === 'Product')
      .map(offer => offer.product?.toString());

    const availableCategories = allCategories.filter(
      category => !offeredCategories.includes(category._id.toString())
    );
    const availableProducts = allProducts.filter(
      product => !offeredProducts.includes(product._id.toString())
    );

    res.status(200).render('admin/addOffer', {
      title: "Add Offer",
      username,
      availableCategories,
      availableProducts
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};





// load Edit Offer

const loadEditOffer = async (req, res) => {
  try {
    const offerId = req.params.offerId;
    const username=req.session.username;
    const category = await Category.find();
    const allProducts = await Product.find();

    const offerProduct = await Offer.findById(offerId)
      .populate('product')
      .populate('category');

    if (!offerProduct) {
      return res.status(404).send("Offer not found");
    }

    const productsWithOffers = await Product.find({ 
      offer: { $exists: true },
      _id: { $ne: offerProduct.product?._id }, 
    });

    const availableProducts = allProducts.filter(product =>
      !productsWithOffers.some(offeredProduct => offeredProduct._id.equals(product._id))
    );

    res.status(200).render('admin/editOffer', {
      username,
      title: "Edit Offer",
      category,
      availableProducts,
      offerProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};






// add Offer 

const addOffer = async(req,res)=>{
  try {
const{product,category,title, description,discountValue,discountCap,minOrderAmount,validFrom,validTill,isActive}=req.body
 console.log(req.body);
    if(product!==''){
      const newOffer = new Offer({
        product,
        applicableTo : 'Product',
        title, 
        description,
        discountValue,
        minOrderAmount,
        validFrom,
        validTill,
        isActive,
        discountCap
      })
      await newOffer.save();
      await Product.findByIdAndUpdate(product,{$set:{offer : true}});
    }
    if(category!==''){
      const newOffer = new Offer({
        category,
        applicableTo : 'Category',
        title, 
        description,
        discountValue,
        minOrderAmount,
        validFrom,
        validTill,
        isActive,
        discountCap
      })
      await newOffer.save();
      await Category.findByIdAndUpdate(category,{$set:{offer : true}});
    }
    res.status(200).redirect('/admin/offer?message=Offer Added SuccessFully&err=true');
  } catch (error) {

    console.log(error)
    res.status(500).send('Internal Server Error');
  }
}




// get the offer table


const getOfferTable = async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate('product', 'name')
      .populate('category', 'name').sort({createdAt : -1});

    const sanitizedOffers = offers.map((offer) => ({
      ...offer.toObject(),
      product: offer.product || null,
      category: offer.category || null,
    }));

    res.status(200).json({ status: true, data: sanitizedOffers });
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};




//delete offer

const deleteOffer =async(req,res)=>{
  try {
    const { offerId } = req.params;
    await Offer.findByIdAndDelete(offerId);
    res.status(200).json({status:true,message:"Offer deleted successfully"});
  } catch (error) {
    console.error(error);
    res.status(500).json({status:false,message:"Error deleting offer"});
  }
}


// edit offer


const editOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { title, description,discountValue ,discountCap ,minOrderAmount,applicableTo, category, product, validFrom, validTill, isActive } = req.body;

    const isActiveFlag = isActive === 'true';

    const updateData = {
      minOrderAmount,
      discountValue,
      title,
      description,
      applicableTo,
      validFrom,
      validTill,
      isActive: isActiveFlag,
      discountCap
    };

    if (applicableTo === 'Category') {
      updateData.applicableTo = 'Category';
      updateData.category = category
      updateData.product = null;
      await Category.findByIdAndUpdate(category, { $set: { offer: isActiveFlag } });
    };
    if (applicableTo === 'Product') {
      updateData.applicableTo = 'Product';
      updateData.product = product;
      updateData.category = null; 
      await Product.findByIdAndUpdate(product, { $set: { offer: isActiveFlag } });
    };

    await Offer.findByIdAndUpdate(offerId, updateData);
    res.redirect('/admin/offer?message=Offer Updated SuccessFully&err=true');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


// get the sales table

const getSalesTable = async(req,res)=>{
  try {
    const orderData = await Orders.find().sort({orderDate : -1});
    res.status(200).json({
      status: true,
      data: orderData,
    });
  } catch (error) {
    console.error('Error fetching sales table data:', error);
    res.status(500).json({
      status: false,
      message: 'Internal Server Error',
    });
  }
}

// get the filtered table


const getFilteredSalesTable = async (req, res) => {
  try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
          return res.status(400).json({ status: false, message: 'Start date and end date are required.' });
      }
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return res.status(400).json({ status: false, message: 'Invalid date format. Use YYYY-MM-DD.' });
      }
      end.setHours(23, 59, 59, 999);
      if (start > end) {
          return res.status(400).json({ status: false, message: 'Start date cannot be after end date.' });
      }

      console.log(start,end);
      const orderData = await Orders.find({
          orderDate: { $gte: start, $lte: end }
      }).sort({ orderDate: -1 }); 

      return res.status(200).json({ 
          status: true, 
          orderData, 
          totalOrders: orderData.length 
      });
  } catch (error) {
      console.error('Error fetching filtered sales table:', error);
      return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};



// generate sales report 


function generatePDFReport(data, res) {
  const doc = new PDFDocument({ margin: 50 });
  const filename = `Sales_Report_${Date.now()}.pdf`;


  let totalAmount = 0;
  let totalDiscount = 0;
  let netSales = 0;


  data.forEach(order => {
    const amount = order.total_Amt_WOT_Discount || 0;
    const discount = order.discount || 0;
    const net = order.totalAmount || 0;

    if (isNaN(amount) || isNaN(discount) || isNaN(net)) {
      console.error('Invalid data:', order);
      throw new Error('Invalid data in order object');
    }

    totalAmount += amount;
    totalDiscount += discount;
    netSales += net;
  });


  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  doc.pipe(res);


  doc
    .fontSize(24)
    .text('iDeal Sales Report', { align: 'center' })
    .fontSize(10)
    .fillColor('gray')
    .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' })
    .moveDown(1);


  doc
    .moveTo(50, doc.y)
    .lineTo(550, doc.y)
    .strokeColor('black')
    .stroke()
    .moveDown(1);



  let currentY = doc.y
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor('black')
    .text('Order Date', 50, currentY, { width: 100 })
    .text('Order ID', 150, currentY, { width: 100 })
    .text('Total Amount', 280, currentY, { width: 100 })
    .text('Discount', 390, currentY, { width: 100 })
    .text('Net Amount', 480, currentY, { width: 100 })
    .moveDown(1);
    currentY += 20;

  doc
    .moveTo(50, currentY)
    .lineTo(550, currentY)
    .strokeColor('gray')
    .stroke()
    .moveDown(1);
    currentY += 20;

  doc.font('Helvetica');
  data.forEach(order => {
    doc
      .text(new Date(order.orderDate).toLocaleDateString(), 50,currentY)
      .text(order.orderId || 'N/A', 150,currentY)
      .text(`${(order.total_Amt_WOT_Discount || 0).toFixed(2)}`, 300,currentY)
      .text(`${(order.discount || 0).toFixed(2)}`, 400,currentY)
      .text(`${(order.totalAmount || 0).toFixed(2)}`, 500,currentY);
    doc.moveDown(1); 
    currentY += 30;
  });


  doc
  .moveTo(50, currentY)
  .lineTo(550, currentY)
  .strokeColor('gray')
  .stroke()
  .moveDown(1);
  currentY += 20;


  doc
    .moveDown(1)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Totals:', 50, currentY)
    .text(`${totalAmount.toFixed(2)}`, 300,currentY)
    .text(`${totalDiscount.toFixed(2)}`, 400,currentY)
    .text(`${netSales.toFixed(2)}`, 500,currentY)
    .moveDown(1);
    currentY += 20;
  doc
    .moveDown(1)
    .fontSize(10)
    .font('Helvetica-Oblique')
    .fillColor('gray')
    .text(
      'This report was generated by iDeal. All amounts are in INR.',
      50,
      doc.y,
      { align: 'center', width: 500 }
    )
    .text('For any queries, contact support@ideal.com.', { align: 'center' });

  doc.end();
}



// get the sales repord pdf



const reportPDF = async (req, res) => {
  try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
          return res.status(400).json({ status: false, message: 'Start date and end date are required.' });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return res.status(400).json({ status: false, message: 'Invalid date format. Use YYYY-MM-DD.' });
      }

      end.setHours(23, 59, 59, 999);

      if (start > end) {
          return res.status(400).json({ status: false, message: 'Start date cannot be after end date.' });
      }

      const data = await Orders.find({
          orderDate: { $gte: start, $lte: end }
      }).sort({ orderDate: -1 });

      if (data.length === 0) {
          return res.status(404).json({ status: false, message: 'No data found for the specified date range.' });
      }

      generatePDFReport(data, res);
  } catch (error) {
      console.error('Error generating PDF report:', error);
      return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};



// generate generate excel report

function generateExcelReport(data, res) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sales Report');

  worksheet.mergeCells('A1:E1');
  worksheet.getCell('A1').value = 'iDeal Sales Report';
  worksheet.getCell('A1').font = { size: 16, bold: true };
  worksheet.getCell('A1').alignment = { horizontal: 'center' };

  worksheet.mergeCells('A2:E2');
  worksheet.getCell('A2').value = `Generated on: ${new Date().toLocaleString()}`;
  worksheet.getCell('A2').font = { italic: true };
  worksheet.getCell('A2').alignment = { horizontal: 'center' };

  worksheet.addRow(['Order Date', 'Order ID', 'Total Amount', 'Discount', 'Net Amount']);
  const headerRow = worksheet.getRow(3);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: 'center' };
  headerRow.eachCell(cell => {
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  let totalAmount = 0;
  let totalDiscount = 0;
  let netSales = 0;

  data.forEach(order => {
    const amount = order.total_Amt_WOT_Discount || 0;
    const discount = order.discount || 0;
    const net = order.totalAmount || 0;

    worksheet.addRow([
      new Date(order.orderDate).toLocaleDateString(),
      order.orderId || 'N/A',
      amount,
      discount,
      net,
    ]);

    totalAmount += amount;
    totalDiscount += discount;
    netSales += net;
  });

  const totalsRow = worksheet.addRow(['Totals', '', totalAmount, totalDiscount, netSales]);
  totalsRow.font = { bold: true };
  totalsRow.alignment = { horizontal: 'center' };
  totalsRow.eachCell((cell, colNumber) => {
    if (colNumber > 2) {
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'double' },
      };
    }
  });

  worksheet.getColumn(1).width = 15; 
  worksheet.getColumn(2).width = 20; 
  worksheet.getColumn(3).width = 15; 
  worksheet.getColumn(4).width = 15;
  worksheet.getColumn(5).width = 15; 

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=Sales_Report_${Date.now()}.xlsx`
  );

  workbook.xlsx.write(res).then(() => {
    res.end();
  }).catch(err => {
    console.error('Error generating Excel report:', err);
    res.status(500).send('Error generating report');
  });
}


// get the sales excel report


const reportExcel = async (req,res)=>{
  
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ status: false, message: 'Start date and end date are required.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ status: false, message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    end.setHours(23, 59, 59, 999);

    if (start > end) {
      return res.status(400).json({ status: false, message: 'Start date cannot be after end date.' });
    }

    const data = await Orders.find({
      orderDate: { $gte: start, $lte: end }
    }).sort({ orderDate: -1 });

    if (data.length === 0) {
      return res.status(404).json({ status: false, message: 'No data found for the specified date range.' });
    }

    generateExcelReport(data, res);
  } catch (error) {
    console.error('Error generating Excel report:', error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }


}

// load the transction page 

const loadTransctions = async(req,res)=>{
  try{
    const username=req.session.username;
    res.status(200).render('admin/transaction',{
  username,
  title:'Transaction'
});

  }catch(error){
    res.status(500).send('Internal server Error');
  }
}


// get transaction table

const getTransactionDetails = async(req,res)=>{
  try {
    const transactions = await Transaction.find().sort({createdAt : -1}); 
    res.status(200).json(transactions); 
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
}



// get the top Saling product

const getTopSellingProduct = async(req,res)=>{
  try {
    const salesData = await Orders.aggregate([
     {$unwind : "$products"},
     {
      $group: {
      _id: "$products.productId", 
      totalSold: { $sum: "$products.quantity" },
      productName: { $first: "$products.productName" }, 
    }
  }
    ]);


    const returnData = await ReturnCancel.aggregate([
      {
        $group: {
          _id: "$productId", 
          totalReturned: { $sum: "$productQauntity" } 
        }
      }
    ]);

    const actualSales = salesData.map(sale => {
      const returnInfo = returnData.find(returned => String(returned._id) === String(sale._id)) || { totalReturned: 0 };
      return {
        productId: sale._id,
        productName: sale.productName,
        actualQuantity: sale.totalSold - returnInfo.totalReturned 
      };
    });

    const top5Products =  actualSales.sort((a, b) => b.actualQuantity - a.actualQuantity).slice(0,5);
    
 res.status(200).json({message :"Data featch successFull" ,top5Products});
  } catch (error) {
    console.log(error);
    res.status(500).json({message : 'Internal Server Error'});
  }
}

// get the most selling category

const getMostSoldCategories = async (req, res) => {
  try {
    const soldCategories = await Orders.aggregate([
      { $unwind: "$products" }, 
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $lookup: {
          from: "categories", 
          localField: "productDetails.category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" }, 
      {
        $group: {
          _id: "$categoryDetails._id",
          categoryName: { $first: "$categoryDetails.name" }, 
          totalSold: { $sum: "$products.quantity" }, 
        },
      },
    ]);


    const returnedCategories = await ReturnCancel.aggregate([
      {
        $group: {
          _id: "$productId",
          totalReturned: { $sum: "$productQauntity" },
        },
      },
    ]);

    const finalData = soldCategories.map(sale => {
      const returnInfo = returnedCategories.find(returned => String(returned._id) === String(sale._id)) || { totalReturned: 0 };
      return {
        categoryId: sale._id,
        categoryName: sale.categoryName,
        actualSold: sale.totalSold - returnInfo.totalReturned, 
      };
    });


    const sortedCategories = finalData.sort((a, b) => b.actualSold - a.actualSold).slice(0, 5);

    res.status(200).json({
      message: "Successfully fetched sold categories considering returns",
      data: sortedCategories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// get dashboard revenu per day


const getDailyRevenue = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const todaysOrders = await Orders.find({
      orderDate: { $gte: startOfDay, $lte: endOfDay },status: "Delivered"
    }).populate('products.productId');


    const totalRevenue = todaysOrders.reduce((sum, order) => {
      const orderRevenue = order.products.reduce((productSum, product) => {
        const revenueFromProduct = (product.price * product.quantity) * 0.1;
        return productSum + revenueFromProduct;
      }, 0);
      return sum + orderRevenue;
    }, 0);


    res.status(200).json({
      success: true,
      message: "Today's revenue calculated successfully.",
      totalRevenue: `₹${totalRevenue.toFixed(2)}`,
    });
  } catch (error) {
    console.error('Error calculating today\'s revenue:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating today\'s revenue.',
      error: error.message,
    });
  }
};

// get the user count

const getUserCount = async (req, res) => {
  try {
    const userCount = await User.countDocuments(); 
    res.status(200).json({
      success: true,
      message: "User count fetched successfully.",
      userCount,
    });
  } catch (error) {
    console.error('Error fetching user count:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user count.',
      error: error.message,
    });
  }
};


// get the todays sales count

const getSalesCount = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const todaysOrders = await Orders.find({
      orderDate: { $gte: startOfDay, $lte: endOfDay },
      status: "Delivered", 
    });
    const { totalSalesCount, totalAmount } = todaysOrders.reduce(
      (acc, order) => {
        if (order.products && Array.isArray(order.products)) {
          const orderQuantity = order.products.reduce(
            (sum, product) => sum + product.quantity,
            0
          );
          acc.totalSalesCount += orderQuantity;
        }
        acc.totalAmount += order.totalAmount;

        return acc;
      },
      { totalSalesCount: 0, totalAmount: 0 }
    );
    res.status(200).json({
      success: true,
      message: "Sales data fetched successfully.",
      totalSalesCount,
      totalAmount,
    });
  } catch (error) {
    console.error('Error fetching sales data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales data.',
      error: error.message,
    });
  }
};

// get the chart data

const getChartData = async (req, res) => {
  try {
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const endOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999);
    const revenueData = await Orders.aggregate([
      {
        $match: {
          status: "Delivered", 
          orderDate: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $unwind: "$products",
      },
      {
        $addFields: {
          "products.price": { $ifNull: ["$products.price", 0] },
          "products.quantity": { $ifNull: ["$products.quantity", 0] },
        },
      },
      {
        $group: {
          _id: { $month: "$orderDate" },
          totalRevenue: {
            $sum: {
              $multiply: ["$products.price", "$products.quantity", 0.1],
            },
          },
        },
      },
      {
        $project: {
          month: "$_id",
          totalRevenue: { $round: ["$totalRevenue", 2] },
          _id: 0,
        },
      },
      {
        $sort: { month: 1 },
      },
    ]);

    const monthlyRevenue = Array(12).fill(0);
    revenueData.forEach((item) => {
      if (item.month >= 1 && item.month <= 12) {
        monthlyRevenue[item.month - 1] = item.totalRevenue;
      }
    });


    res.status(200).json({
      success: true,
      data: monthlyRevenue,
    });
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching revenue data.",
      error: error.message,
    });
  }
};


// load banner


const loadBanner = async(req,res)=>{
  try{
    const username=req.session.username;
    res.status(200).render('admin/banner',{
  username,
  title:'Banner'
});
  }catch(error){
    res.status(500).send('Internal server Error');
  }
}


// upload banner

const uploadBanner = async (req, res) => {
  try {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }
console.log(req.file)
    const { bannerType } = req.body;
    if (!bannerType || (bannerType !== 'home' && bannerType !== 'offer')) {
        return res.status(400).json({ error: 'Invalid banner type.' });
    }

    const filePath = `/uploads/re-image/${req.file.filename}`
    const update = bannerType === 'home'
        ? { home_image: filePath }
        : { offer_banner: filePath };

    const updatedBanner = await Banner.findOneAndUpdate({}, update, { new: true, upsert: true });

    res.status(201).json({
        success: true,
        message: 'Banner uploaded successfully!',
        filePath: filePath,
        data: updatedBanner,
    });
} catch (error) {
    console.error('Error uploading banner:', error);
    res.status(500).json({ error: 'Failed to upload the banner.' });
}
};


// get banner images 

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
  loadLogin,
  loadforgotPassword,
  loadProduct,
  loadAddProduct,
  loadEditProduct,
  loadCategory,
  loadEditCategory,
  loadAddCategory,
  loadCustomers,
  loadAddCustomer,
  loadEditCustomer,
  addProducts,
  addCategory,
  deleteProduct,
 updateCategory,
 deleteCategory,
 addAdmin,
 loadDashboard,
 adminValidation,
 deleteUser,
 checkEmail,
 updateCustomer,
 addCustomer,
 logOut,
 editProduct,
 deleteProductImage,
 forgotPassword,
 resetPasswordPage,
 changePassword,
 loadOrder,
 loadDetails,
 addCoupon,
 updateOrderStatus,
 loadOffer,
 loadCoupon,
 loadAddCoupon,
 loadEditCoupon,
 loadSales,
 getCoupons,
 editCoupon,
 searchCoupon,
 loadReturn,
 getReturnData,
 approveReturn,
 rejectReturn,
 getreturnOrderDetails,
 loadAddOffer,
 loadEditOffer,
 addOffer,
 getOfferTable,
 deleteOffer,
 editOffer,
 getSalesTable,
 getFilteredSalesTable,
 reportPDF,
 reportExcel,
 loadTransctions,
 getTransactionDetails,
 getTopSellingProduct,
 getMostSoldCategories,
 getDailyRevenue,
 getUserCount,
 getSalesCount,
 getChartData,
 loadBanner,
 uploadBanner,
 getbanners
}