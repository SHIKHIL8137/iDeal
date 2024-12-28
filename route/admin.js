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
router.get('/orders',adminAuth.isLoggedIn,adminController.loadOrder)
router.get('/orderDetails/:orderId',adminAuth.isLoggedIn ,adminController.loadDetails);
router.get('/offer',adminAuth.isLoggedIn ,adminController.loadOffer);
router.get('/coupon',adminAuth.isLoggedIn ,adminController.loadCoupon);
router.get('/addCoupon' ,adminAuth.isLoggedIn ,adminController.loadAddCoupon);
router.get('/editCoupon/:couponId' ,adminAuth.isLoggedIn ,adminController.loadEditCoupon);
router.get('/sales',adminAuth.isLoggedIn ,adminController.loadSales);
router.get('/coupon-data',adminAuth.isLoggedIn ,adminController.getCoupons);
router.get('/search-coupons',adminAuth.isLoggedIn ,adminController.searchCoupon);
router.get('/return',adminAuth.isLoggedIn ,adminController.loadReturn);
router.get('/return-requests' ,adminAuth.isLoggedIn ,adminController.getReturnData);
router.get('/returnOrderDetails/:returnId',adminAuth.isLoggedIn ,adminController.getreturnOrderDetails);
router.get('/addOffer',adminAuth.isLoggedIn ,adminController.loadAddOffer);
router.get('/editOffer/:offerId',adminAuth.isLoggedIn ,adminController.loadEditOffer);
router.get('/getOfferTable',adminAuth.isLoggedIn ,adminController.getOfferTable);
router.get('/getSalesTable',adminAuth.isLoggedIn ,adminController.getSalesTable);
router.get('/getFillterdSalesTable',adminAuth.isLoggedIn ,adminController.getFilteredSalesTable);
router.get('/downloadSalesPDF',adminAuth.isLoggedIn ,adminController.reportPDF);
router.get('/downloadSalesEXCEl',adminAuth.isLoggedIn ,adminController.reportExcel);
router.get('/transaction',adminAuth.isLoggedIn,adminController.loadTransctions);
router.get('/transactionsTable',adminAuth.isLoggedIn,adminController.getTransactionDetails);
router.get('/getTopSellingProduct',adminAuth.isLoggedIn,adminController.getTopSellingProduct);
router.get('/getMostSoldCategories',adminAuth.isLoggedIn,adminController.getMostSoldCategories);
router.get('/getDailyRevenue',adminAuth.isLoggedIn,adminController.getDailyRevenue);
router.get('/getUserCount',adminAuth.isLoggedIn,adminController.getUserCount);
router.get('/getTodaySales',adminAuth.isLoggedIn,adminController.getSalesCount);
router.get('/getChartData',adminAuth.isLoggedIn,adminController.getChartData);
router.get('/banner',adminAuth.isLoggedIn,adminController.loadBanner);
router.get('/getbanners',adminController.getbanners);




router.post('/editCoupon',adminController.editCoupon);
router.post('/addProduct',uploads.array("images",4),adminController.addProducts);
router.post('/editProduct/:id', uploads.array("images", 4), adminController.editProduct);
router.post('/updateCategory/:id',adminController.updateCategory)
router.post('/addCategory',adminAuth.isLoggedIn ,adminController.addCategory);
router.post('/addAdmin',adminAuth.isLoggedIn ,adminController.addAdmin);  
router.post('/adminValidation',adminController.adminValidation);
router.post('/editCustomer/:id',adminAuth.isLoggedIn ,adminController.updateCustomer);
router.post('/addCustomer',adminAuth.isLoggedIn ,adminController.addCustomer);
router.post('/forgotPassword',adminController.forgotPassword)
router.post('/changePassword/:id',adminAuth.checkSessionResetPassword,adminController.changePassword);
router.post('/addCoupon',adminController.addCoupon);
router.post('/updateStatusOrder/:orderId',adminAuth.isLoggedIn ,adminController.updateOrderStatus);
router.post('/returnApprove',adminController.approveReturn);
router.post('/returnReject',adminController.rejectReturn);
router.post('/addOffer',adminController.addOffer);
router.post('/editOffer/:offerId',adminController.editOffer);
router.post('/upload-banners', uploads.single('banner_image'), adminController.uploadBanner);



router.delete('/deleteProductImage/:id/:index',adminAuth.isLoggedIn,adminController.deleteProductImage);
router.delete('/offerDelete/:offerId',adminController.deleteOffer);
module.exports=router