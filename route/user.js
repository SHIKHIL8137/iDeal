const express=require('express');
const userController=require('../controller/user/userController');
const userMiddleWare = require('../middleware/userAuth')
const passport = require('passport');
const router=express.Router();
const uploads= require('../helpers/multer');



router.get('/logIn',userMiddleWare.checkSession,userController.loadlogin);
router.get('/signUp',userMiddleWare.checkSession,userController.loadsignUp);
router.get('/forgotPassword',userMiddleWare.checkSession,userController.loadForgotPassword)
router.get('/changePassword',userMiddleWare.checkSessionResetPassword,userController.loadChangePassword);
router.get('/home',userController.loadHome);
router.get('/shop',userController.loadShop);
router.get('/categoryShop/:id',userController.loadCategoryShop);
router.get('/productDetails/:id',userController.loadProductDetails);
router.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}));
router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/user/signUp'}),userMiddleWare.storeSessionEmail,userController.googleLogin)
router.get('/changePassword/:id',userMiddleWare.checkSessionResetPassword,userController.resetPasswordPage);
router.get('/userProfile',userMiddleWare.isLoggedIn,userController.loadProfile);
router.get('/logOut',userMiddleWare.logOut,userController.logOut) 
router.get('/search',userController.productSearching)
router.get('/sortProduct',userController.sortedProduct);
router.get('/sortCategoryProduct',userController.sortCategoryProduct);
router.get('/searchCategoryProduct',userController.categoryProductSearching);
router.get('/orderHistory',userMiddleWare.isLoggedIn,userController.loadOrderHistory);
router.get('/orderDetails/:id',userMiddleWare.isLoggedIn,userController.loadOrderDetails)
router.get('/cart',userMiddleWare.isLoggedIn,userController.loadCart)
router.get('/checkOut',userMiddleWare.isLoggedIn,userMiddleWare.checkOutPageUserValid,userController.loadCheckout)
router.get('/address',userMiddleWare.isLoggedIn,userController.loadAddress);
router.get('/loadOrderConformation/:id',userMiddleWare.isLoggedIn,userController.loadOrderConformation);
router.get('/check-email',userMiddleWare.isLoggedIn,userController.checkEmail);
router.get('/checkoutSummery',userMiddleWare.isLoggedIn,userController.getCheckoutSummery);
router.get('/editAddress/:id',userMiddleWare.isLoggedIn,userController.loadEditAddress);





router.post('/productReview/:id',userController.productReview);
router.post('/filterProducts',userController.filterProduct);
router.post('/categoryShopFilter',userController.categoryShopFilter);
router.post('/changePassword/:id', userController.changePassword);
router.post('/register',userController.registerUserNormal);
router.post('/otpVarification',userController.otpVerification)
router.post('/resend-otp',userController.resendPassword)
router.post('/loginVelidation',userController.loginVelidation)
router.post('/forgotPassword',userController.forgotPassword);
router.post('/saveUserDetails',uploads.single('profilePicture'),userController.userDetailsSave);
router.post('/updatePassword',userMiddleWare.isLoggedIn,userController.updatePassword);
router.post('/addtoCartProduct',userMiddleWare.isLoggedIn,userController.addProductToCart)
router.post('/updateCartQuantity',userMiddleWare.isLoggedIn,userController.updateCartQuantity);
router.post('/removeFromCart',userMiddleWare.isLoggedIn,userController.removeFromCart);
router.post('/applyCoupon',userMiddleWare.isLoggedIn,userController.couponValidationCheckout);
router.post('/removeCoupon',userMiddleWare.isLoggedIn,userController.removeCoupon);
router.post('/saveAddress',userMiddleWare.isLoggedIn,userController.addAddress);
router.post('/checkout',userMiddleWare.isLoggedIn,userController.checkoutDataStore);
router.post('/editAddress',userMiddleWare.isLoggedIn,userController.editAddress);
router.post('/updateAddress/:addressId',userMiddleWare.isLoggedIn,userController.saveUpdatedAddress)
router.post('/orderSubmit',userMiddleWare.isLoggedIn,userController.submitOrder);
router.post('/cancel-order/:orderId',userMiddleWare.isLoggedIn,userController.cancelOreder);
router.post('/expireOrder/:orderId',userController.chnageOrderConformationStatus);


router.delete('/deleteAddress/:id',userMiddleWare.isLoggedIn,userController.deleteAddress);


module.exports=router