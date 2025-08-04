const checkSessionResetPassword=async(req,res,next)=>{
  if (!req.session.resetTokenPending ) {
    return res.redirect('/admin/login');
  }next();
}


const checkSession=async(req,res,next)=>{
  if (req.session.isValidAdmin) {
    return res.redirect('/admin');
  }next();
}

const isLoggedIn =async (req, res, next) => {
  if (!req.session.isValidAdmin) {
    return res.redirect('/admin/login');
  }next(); 
}


const logOut=async (req,res,next)=>{
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    res.clearCookie('connect.sid');
    res.redirect('/admin/login');
  });
}


module.exports={
  checkSession,
  isLoggedIn,
  logOut,
  checkSessionResetPassword
}