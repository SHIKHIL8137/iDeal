const express=require('express');
const adminController=require('../controller/admin/adminController');
const productCategoryController = require('../controller/admin/productCategoryController');
const couponController = require('../controller/admin/couponController');
const orderReturnController = require('../controller/admin/orderRetrunController');
const offerController = require('../controller/admin/offerController');
const dashboardController = require('../controller/admin/dashboardController');
const salesTransactionController = require('../controller/admin/salesTransactionController');
const router=express.Router();
const multer= require('multer')
const uploads= require('../helpers/multer');
const adminAuth =require('../middleware/adminauth');




router.get('/login',adminAuth.checkSession,adminController.loadLogin)
router.get('/forgotPassword',adminController.loadforgotPassword);
router.get('/changePassword/:id',adminAuth.checkSessionResetPassword,adminController.resetPasswordPage);
router.get('/check-email',adminAuth.isLoggedIn,adminController.checkEmail);
router.get('/logOut',adminAuth.logOut,adminController.logOut) 
router.get('/customers',adminAuth.isLoggedIn,adminController.loadCustomers);
router.get('/editCustomer/:id',adminAuth.isLoggedIn,adminController.loadEditCustomer)
router.get('/getCustomersDetails',adminAuth.isLoggedIn,adminController.getCustomersDetails);
router.get('/banner',adminAuth.isLoggedIn,adminController.loadBanner);
router.get('/getbanners',adminAuth.isLoggedIn,adminController.getbanners);

router.post('/addAdmin',adminController.addAdmin);  
router.post('/adminValidation',adminController.adminValidation);
router.post('/editCustomer/:id',adminAuth.isLoggedIn ,adminController.updateCustomer);
router.post('/forgotPassword',adminController.forgotPassword)
router.post('/changePassword/:id',adminAuth.checkSessionResetPassword,adminController.changePassword);

router.post('/upload-banners', uploads.single('banner_image'), adminController.uploadBanner);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



router.get('/product',adminAuth.isLoggedIn,productCategoryController.loadProduct);
router.get('/addProduct',adminAuth.isLoggedIn,productCategoryController.loadAddProduct);
router.get('/editProduct',adminAuth.isLoggedIn,productCategoryController.loadEditProduct);
router.get('/category',adminAuth.isLoggedIn,productCategoryController.loadCategory);
router.get('/getTheProductDetails',adminAuth.isLoggedIn,productCategoryController.loadProductDetails);
router.get('/getCategoryDetails',adminAuth.isLoggedIn,productCategoryController.getCategoryDetails);
router.get('/addCategory',adminAuth.isLoggedIn,productCategoryController.loadAddCategory);
router.get('/editCategory/:id',adminAuth.isLoggedIn,productCategoryController.loadEditCategory)

router.post('/updateCategory/:id',adminAuth.isLoggedIn,productCategoryController.updateCategory)
router.post('/addCategory',adminAuth.isLoggedIn ,productCategoryController.addCategory);
router.post('/addProduct',uploads.array("images",4),productCategoryController.addProducts);
router.post('/editProduct/:id', uploads.array("images", 4), productCategoryController.editProduct);

router.delete('/deleteProduct/:id',adminAuth.isLoggedIn ,productCategoryController.deleteProduct);
router.delete('/deleteCategory/:id',adminAuth.isLoggedIn ,productCategoryController.deleteCategory);
router.delete('/deleteProductImage/:id/:index',adminAuth.isLoggedIn,productCategoryController.deleteProductImage);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



router.get('/',adminAuth.isLoggedIn,dashboardController.loadDashboard);
router.get('/getTopSellingProduct',adminAuth.isLoggedIn,dashboardController.getTopSellingProduct);
router.get('/getMostSoldCategories',adminAuth.isLoggedIn,dashboardController.getMostSoldCategories);
router.get('/getDailyRevenue',adminAuth.isLoggedIn,dashboardController.getDailyRevenue);
router.get('/getUserCount',adminAuth.isLoggedIn,dashboardController.getUserCount);
router.get('/getTodaySales',adminAuth.isLoggedIn,dashboardController.getSalesCount);
router.get('/getChartData',adminAuth.isLoggedIn,dashboardController.getChartData);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



router.get('/sales',adminAuth.isLoggedIn ,salesTransactionController.loadSales);
router.get('/getSalesTable',adminAuth.isLoggedIn ,salesTransactionController.getSalesTable);
router.get('/getFillterdSalesTable',adminAuth.isLoggedIn ,salesTransactionController.getFilteredSalesTable);
router.get('/downloadSalesPDF',adminAuth.isLoggedIn ,salesTransactionController.reportPDF);
router.get('/downloadSalesEXCEl',adminAuth.isLoggedIn ,salesTransactionController.reportExcel);
router.get('/transaction',adminAuth.isLoggedIn,salesTransactionController.loadTransctions);
router.get('/transactionsTable',adminAuth.isLoggedIn,salesTransactionController.getTransactionDetails);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



router.get('/offer',adminAuth.isLoggedIn,offerController.loadOffer);
router.get('/addOffer',adminAuth.isLoggedIn ,offerController.loadAddOffer);
router.get('/editOffer/:offerId',adminAuth.isLoggedIn ,offerController.loadEditOffer);
router.get('/getOfferTable',adminAuth.isLoggedIn,offerController.getOfferTable);

router.post('/addOffer',adminAuth.isLoggedIn,offerController.addOffer);
router.post('/editOffer/:offerId',adminAuth.isLoggedIn,offerController.editOffer);

router.delete('/offerDelete/:offerId',adminAuth.isLoggedIn,offerController.deleteOffer);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



router.get('/orders',adminAuth.isLoggedIn,orderReturnController.loadOrder)
router.get('/orderDetails/:orderId',adminAuth.isLoggedIn ,orderReturnController.loadDetails);
router.get('/return',adminAuth.isLoggedIn,orderReturnController.loadReturn);
router.get('/return-requests' ,adminAuth.isLoggedIn,orderReturnController.getReturnData);
router.get('/returnOrderDetails/:returnId',adminAuth.isLoggedIn ,orderReturnController.getreturnOrderDetails);
router.get('/getOrderDetails',adminAuth.isLoggedIn,orderReturnController.getOrderDetails);

router.patch('/updateStatusOrder/:orderId',adminAuth.isLoggedIn ,orderReturnController.updateOrderStatus);
router.post('/returnApprove',adminAuth.isLoggedIn,orderReturnController.approveReturn);
router.post('/returnReject',adminAuth.isLoggedIn,orderReturnController.rejectReturn);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



router.get('/coupon',adminAuth.isLoggedIn,couponController.loadCoupon);
router.get('/addCoupon' ,adminAuth.isLoggedIn ,couponController.loadAddCoupon);
router.get('/editCoupon/:couponId' ,adminAuth.isLoggedIn ,couponController.loadEditCoupon);
router.get('/coupon-data',adminAuth.isLoggedIn ,couponController.getCoupons);
router.get('/search-coupons',adminAuth.isLoggedIn ,couponController.searchCoupon);

router.post('/editCoupon/:couponId',couponController.editCoupon);
router.post('/addCoupon',couponController.addCoupon);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


module.exports=router