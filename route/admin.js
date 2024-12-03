const express=require('express');
const adminController=require('../controller/admin/adminController');
const router=express.Router();
const multer= require('multer')
const uploads= require('../helpers/multer');
const adminAuth =require('../middleware/adminauth');



router.get('/login',adminAuth.checkSession,adminController.loadLogin)
router.get('/forgotPassword',adminController.loadforgotPassword);
router.get('/changePassword/:id',adminAuth.checkSessionResetPassword,adminController.resetPasswordPage);
router.get('/product',adminAuth.isLoggedIn,adminController.loadProduct);
router.get('/addProduct',adminAuth.isLoggedIn,adminController.loadAddProduct);
router.get('/editProduct/:id',adminAuth.isLoggedIn,adminController.loadEditProduct);
router.get('/category',adminAuth.isLoggedIn,adminController.loadCategory);
router.get('/addCategory',adminAuth.isLoggedIn,adminController.loadAddCategory);
router.get('/editCategory/:id',adminAuth.isLoggedIn,adminController.loadEditCategory)
router.get('/customers',adminAuth.isLoggedIn,adminController.loadCustomers);
router.get('/addCustomer',adminAuth.isLoggedIn,adminController.loadAddCustomer);
router.get('/editCustomer/:id',adminAuth.isLoggedIn,adminController.loadEditCustomer)
router.get('/deleteProduct/:id',adminAuth.isLoggedIn ,adminController.deleteProduct);
router.get('/deleteCategory/:id',adminAuth.isLoggedIn ,adminController.deleteCategory);
router.get('/dashboard',adminAuth.isLoggedIn,adminController.loadDashboard);
router.get('/deleteUser/:id',adminAuth.isLoggedIn,adminController.deleteUser);
router.get('/check-email',adminAuth.isLoggedIn,adminController.checkEmail);
router.get('/logOut',adminAuth.logOut,adminController.logOut) 
router.get('/orders',adminController.loadOrder)
router.get('/orderDetails',adminController.loadDetails);





router.post('/addProduct',uploads.array("images",4),adminController.addProducts);
router.post('/editProduct/:id', uploads.array("images", 4), adminController.editProduct);
router.delete('/deleteProductImage/:id/:index', adminController.deleteProductImage);



router.post('/updateCategory/:id',adminController.updateCategory)
router.post('/addCategory',adminController.addCategory);
router.post('/addAdmin',adminController.addAdmin);  
router.post('/adminValidation',adminController.adminValidation);
router.post('/editCustomer/:id',adminController.updateCustomer);
router.post('/addCustomer',adminController.addCustomer);
router.post('/forgotPassword',adminController.forgotPassword)
router.post('/changePassword/:id',adminAuth.checkSessionResetPassword,adminController.changePassword);
router.post('/addCoupon',adminController.addCoupon);

module.exports=router