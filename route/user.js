const express=require('express');
const userController=require('../controller/user/userController');
const userMiddleWare = require('../middleware/userAuth');
const userProfileController = require('../controller/user/userProfileController');
const cartController = require('../controller/user/cartController');
const walletController = require('../controller/user/walletController');
const wishListController = require('../controller/user/wishListController');
const orderController = require('../controller/user/orderController');
const passport = require('passport');
const router=express.Router();
const uploads= require('../helpers/multer');



router.get('/logIn',userMiddleWare.checkSession,userController.loadlogin);
router.get('/signUp',userMiddleWare.checkSession,userController.loadsignUp);
router.get('/forgotPassword',userMiddleWare.checkSession,userController.loadForgotPassword)
// router.get('/changePassword',userMiddleWare.checkSessionResetPassword,userController.loadChangePassword);
router.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}));
router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/user/signUp'}),userMiddleWare.storeSessionEmail,userController.googleLogin)
router.get('/changePassword/:id',userController.resetPasswordPage);
router.get('/checkoutSummery',userMiddleWare.isLoggedIn,userController.getCheckoutSummery);
router.get('/logOut',userMiddleWare.logOut,userController.logOut);
router.get('/checkOut',userMiddleWare.checkOutPageUserValid,userController.loadCheckout)
router.get('/referral',userMiddleWare.isLoggedIn,userController.loadReferral);
router.get('/faild',userMiddleWare.isLoggedIn,userController.loadFaild);
router.get('/pendingDetails',userMiddleWare.isLoggedIn,userController.loadPending);
router.get('/getbanners',userController.getbanners);
router.get('/getCheckOutData',userMiddleWare.isLoggedIn,userController.getCheckOutData);

router.post('/productReview/:id',userMiddleWare.isLoggedIn,userController.productReview);
router.post('/changePassword/:id', userController.changePassword);
router.post('/register',userController.registerUserNormal);
router.post('/otpVarification',userController.otpVerification)
router.post('/resend-otp',userController.resendPassword)
router.post('/loginVelidation',userController.loginVelidation)
router.post('/forgotPassword',userController.forgotPassword);
router.post('/orderSubmit',userMiddleWare.isLoggedIn,userController.submitOrder);
router.post('/verify-payment/:orderId',userMiddleWare.isLoggedIn,userController.verifyPayment);
router.post('/applyCoupon',userMiddleWare.isLoggedIn,userController.couponValidationCheckout);
router.post('/removeCoupon',userMiddleWare.isLoggedIn,userController.removeCoupon);
/////////////////////////////////////////////////////////////


router.get('/orderHistory',userMiddleWare.isLoggedIn,orderController.loadOrderHistory);
router.get('/orderDetails/:id',userMiddleWare.isLoggedIn,orderController.loadOrderDetails);
router.get('/loadOrderConformation/:id',userMiddleWare.isLoggedIn,orderController.loadOrderConformation);
router.get('/downloadInvoice/:orderId',userMiddleWare.isLoggedIn,orderController.generateSalesInvoice);
router.get('/getOrderDetails/:id',userMiddleWare.isLoggedIn,orderController.orderDetails);

router.post('/cancel-order/:orderId',userMiddleWare.isLoggedIn,orderController.cancelOreder);
router.post('/expireOrder/:orderId',userMiddleWare.isLoggedIn,orderController.changeOrderConformationStatus);
router.post('/return-order',userMiddleWare.isLoggedIn,orderController.returnOrder);
router.post('/cancelProductOrder',userMiddleWare.isLoggedIn,orderController.cancelIndiProduct);
/////////////////////////////////////////////////////////////


router.get('/address',userMiddleWare.isLoggedIn,userProfileController.loadAddress);
router.get('/editAddress/:id',userMiddleWare.isLoggedIn,userProfileController.loadEditAddress);
router.get('/getUserDetails',userMiddleWare.isLoggedIn,userProfileController.getUserDetails);
router.get('/check-email',userMiddleWare.isLoggedIn,userProfileController.checkEmail);
router.get('/userProfile',userMiddleWare.isLoggedIn,userProfileController.loadProfile);

router.post('/saveUserDetails',uploads.single('profilePicture'),userProfileController.userDetailsSave);
router.post('/updatePassword',userMiddleWare.isLoggedIn,userProfileController.updatePassword);
router.post('/saveAddress',userMiddleWare.isLoggedIn,userProfileController.addAddress);
router.post('/updateAddress/:addressId',userMiddleWare.isLoggedIn,userProfileController.saveUpdatedAddress);

router.delete('/deleteAddress/:id',userMiddleWare.isLoggedIn,userProfileController.deleteAddress);
/////////////////////////////////////////////////////////////


router.get('/wallet',userMiddleWare.isLoggedIn,walletController.loadWallet);
router.get('/getTransactionTable',userMiddleWare.isLoggedIn,walletController.getTransactionDetails);

router.post('/addToWallet',userMiddleWare.isLoggedIn,walletController.addMoneyToWallet);
/////////////////////////////////////////////////////////////


router.get('/wishlist',userMiddleWare.isLoggedIn,wishListController.loadWishlist);
router.get('/getWishListData',userMiddleWare.isLoggedIn,wishListController.getWishlistData);

router.post('/addToWishlist/:id',userMiddleWare.isLoggedInForCart,userMiddleWare.isLoggedIn,wishListController.addtoWishlist);

router.delete('/deleteFromWishlist/:id',userMiddleWare.isLoggedIn,wishListController.deleteFromWishlist);
/////////////////////////////////////////////////////////////


router.get('/cart',userMiddleWare.isLoggedIn,cartController.loadCart)
router.get('/getCartDetails',userMiddleWare.isLoggedIn,cartController.getCartDetails);
router.get('/cartSummary',userMiddleWare.isLoggedIn,cartController.cartSummery);

router.post('/addtoCartProduct',userMiddleWare.isLoggedInForCart,userMiddleWare.isLoggedIn,cartController.addProductToCart)
router.post('/updateCartQuantity',userMiddleWare.isLoggedIn,cartController.updateCartQuantity);
router.post('/removeFromCart',userMiddleWare.isLoggedIn,cartController.removeFromCart);
router.post('/checkout',userMiddleWare.isLoggedIn,cartController.checkoutDataStore);


module.exports=router