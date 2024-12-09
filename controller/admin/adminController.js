const {Product,Category,Admin,Coupon} = require('../../model/adminModel');
const {User,Address,OTP,Orders}=require('../../model/userModel');
const fs= require('fs');
const path = require('path');
const sharp=require('sharp');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodeMailer=require('nodemailer');
const { title } = require('process');


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
       return res.status(200).redirect('/admin/dashboard?message=Login SuccessFul');
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

 const user = await Admin.findOne({email:email});
 if(user) return res.status(400).send("user exist");
 const hashedPassword = await bcrypt.hash(password, 10);
 const newUser=new Admin({

  name:name.trim(),
  email:email.trim(),
  password:hashedPassword,

 })
await newUser.save();
res.status(200).redirect('/admin/login')
 } catch (error) {
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
           <p><a href="http://localhost:3000/admin/changePassword/${resetToken}">Reset Password</a></p>
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


//update the order status


const updateOrderStatus = async (req, res) => {
  const orderId = req.params.orderId;
  const { status } = req.body;

  console.log('Received orderId:', orderId);
  console.log('Received new status:', status);

  try {
    const order = await Orders.findById(orderId).populate('products.productId'); 

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
    const updatedOrder = await order.save(); 

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
    const category = await Category.find();
    const allProducts = await Product.find();
    const productsWithOffers = await Product.find({ offer: { $exists: true } });
    const availableProducts = allProducts.filter(product =>
      !productsWithOffers.some(offeredProduct => offeredProduct._id.equals(product._id))
    );
    res.status(200).render('admin/offer', {
      title: "Offer",
      username,
      category,
      availableProducts, 
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


// Delete coupon

const deleteCoupon = async(req,res)=>{
  const couponId = req.params.couponId; 
  try {
    const result = await Coupon.findByIdAndDelete(couponId);
    if (!result) {
      return res.status(404).json();
    }
    res.json();
  } catch (err) {
    console.error(err);
    res.status(500).json();
  }
}




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
 deleteCoupon
}