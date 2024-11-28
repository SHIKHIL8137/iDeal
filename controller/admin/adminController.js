const {Product,Category,Admin} = require('../../model/adminModel');
const {User,Address,OTP}=require('../../model/userModel');
const fs= require('fs');
const path = require('path');
const sharp=require('sharp');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodeMailer=require('nodemailer');


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


const loadLogin=async(req,res)=>{
  try {

    const message = req.query.message;
    const err=req.query.err
    const errBoolean = err === 'true';
    res.status(200).render('admin/login',{message,errBoolean})
  } catch (error) {
    res.status(500).send('Internal server error');
  }
}


const loadforgotPassword=async(req,res)=>{
  try {
    const message = req.query.message;
    res.status(200).render('admin/forgotPassword',{message})
  } catch (error) {
    res.status(500).send('Internal server error');
  }
}




const loadProduct=async(req,res)=>{
  try {
    const username=req.session.username;
    const message=req.query.message;
    const products=await Product.find().populate('category');
    res.status(200).render('admin/product',{products,message,username})
  } catch (error) {
    res.status(500).send('Internal server error');
  }
}


const loadAddProduct=async(req,res)=>{
  try {
    const username=req.session.username;
    let message=req.query.message
    req.query.message=null;
    const category=await Category.find();

    res.status(200).render('admin/addProduct',{message,category,username})
    message=null
  } catch (error) {
    console.log(error)
    res.status(500).send('Internal server error');
  }
}

const loadEditProduct=async(req,res)=>{
  try {
    const username=req.session.username;
    const productId=req.params.id;
    const productDetails = await Product.findById(productId).populate('category');
    const categoryDetails = await Category.find();
    res.status(200).render('admin/editProduct',{productDetails,categoryDetails,username});
  } catch (error) {
    res.status(500).send('Internal server error');
  }
}

const loadCategory=async(req,res)=>{
  try {
    const username=req.session.username;
const category=await Category.find();
const message=req.query.message;
    res.status(200).render('admin/category',{category,message,username})
  } catch (error) {
    res.status(500).send('Internal server error');
  }
}

const loadAddCategory=async(req,res)=>{
  try {
    const username=req.session.username;
    const message=req.query.message;
    const err=req.query.err;
    const errBoolean = err === 'true';
    res.status(200).render('admin/addCategory',{message,errBoolean,username})
  } catch (error) {
    res.status(500).send('Internal server error');
  }
}

const loadEditCategory=async(req,res)=>{
  try{  
    const username=req.session.username;
    const categoryId=req.params.id
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).redirect('/admin/category?message=Category not found please try again later');
    }
  res.status(200).render('admin/editCategory',{category,username});
  } catch (err) {
    res.status(500).send('Server error');
  }
}

const loadCustomers=async(req,res)=>{
  try {
    const message = req.query.message;
    const username=req.session.username;
    const userDetails=await User.find();
    res.status(200).render('admin/customers',{userDetails,message,username})
  } catch (error) {
    res.status(500).send('Internal server error');
  }
}


const loadEditCustomer=async(req,res)=>{
  try {
    const userid=req.params.id;
    const username=req.session.username;
    const userDetails=await User.findById(userid)
    if (!userDetails) {
      return res.status(404).redirect('/admin/customers?message=Category not found please try again later');
    }
    res.status(200).render('admin/editCustomer',{userDetails,username})
  } catch (error) {
    res.status(500).send('Internal server error');
  }
}


const loadAddCustomer=async(req,res)=>{
  try {
    const username=req.session.username;
    const message = req.query.message
    res.status(200).render('admin/addCustomer',{message,username})
  } catch (error) {
    res.status(500).send('Internal server error');
  }
}



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


const deleteImageFromProduct=async(req,res)=>{
  try {
    const { id } = req.params;
    const { index } = req.body;

    const product = await Product.findById(id);
    product.images.splice(index, 1); 
    const imgCount=product.images.length;
    await product.save();
    res.status(200).json({ count: imgCount });
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to delete image');
  }
}



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


const loadDashboard=async(req,res)=>{
try {
  const username=req.session.username;
  const message=req.query.message;
  res.status(200).render('admin/dashboard',{message,username});
} catch (error) {
  res.status(500).send('internal server error');
}
}



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


const logOut=async(req,res)=>{
  try {
    res.status(200).redirect('/admin/login');
  } catch (error) {
    res.status(500).send('Internal server error');
  } 
}




const deleteProductImage = async (req, res) => {
  try {
    const productId = req.params.id;
    const index = parseInt(req.params.index);

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const imageToRemove = product.images[index];
    product.images.splice(index, 1); // Remove the image from the array
    await product.save();

    // Optionally delete the file from the server
    const filePath = path.join(__dirname, '..', 'public', imageToRemove);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

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
    res.status(200).render('admin/forgotPassword', { message: "Password reset link sent successfully. Please check your inbox." });

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

 
    res.render('admin/changePassword',{token});
  } catch (error) {
    console.error('Error during reset password page access:', error);
    res.status(500).send('Internal Server Error. Please try again later.');
  }
};



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
 deleteImageFromProduct,
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
 changePassword
}