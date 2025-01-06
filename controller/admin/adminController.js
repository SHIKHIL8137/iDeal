
const {Admin} = require('../../model/admin/adminModel');
const {Banner} = require('../../model/admin/bannerModel');
const {User} = require('../../model/user/userModel');
const {OTP} = require('../../model/user/otpModel');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodeMailer=require('nodemailer');

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


// get the customers details

const getCustomersDetails = async(req,res)=>{
  try{
    const userDetails=await User.find();
    res.status(200).json({status : true , userDetails});
  }catch (error){
    res.status(500).json({status : false , message : "Internal Server Error"});
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






// Delete users route

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id); 
    res.status(200).json({status : true , message :"Customer deleted successfully"});
  } catch (error) {
    console.error(error);
    res.status(500).json({status:false,message :'Internal Server Error'});
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
  loadCustomers,
  loadAddCustomer,
  loadEditCustomer,
 addAdmin,
 adminValidation,
 deleteUser,
 checkEmail,
 updateCustomer,
 addCustomer,
 logOut,
 forgotPassword,
 resetPasswordPage,
 changePassword,
 loadBanner,
 uploadBanner,
 getbanners,
 getCustomersDetails
}