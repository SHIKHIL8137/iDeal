const {User}=require('../model/userModel');


const checkSessionResetPassword=async(req,res,next)=>{
  if (!req.session.resetTokenPending ) {
    return res.redirect('/user/login');
  }next();
}


const checkSession=async(req,res,next)=>{
  if (req.session.isUser) {
    return res.redirect('/user/shop');
  }next();
}

const isLoggedIn =async (req, res, next) => {
  const email = req.session.isLoggedEmail;
  const user = await User.findOne({email});
  if (!req.session.isUser || user.block === true) {
    req.session.destroy();
    return res.redirect('/user/login');
  }next(); 
}

const logOut=async (req,res,next)=>{
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    res.clearCookie('connect.sid');
    res.redirect('/user/home');
  });
}


module.exports ={
  checkSessionResetPassword,
  logOut,
  checkSession,
  isLoggedIn
}