const express=require('express');
const mainController=require('../controller/main/mainController');
const router=express.Router();


router.get('/',mainController.loadHome);
router.get('/shop',mainController.loadShop);
router.get('/search',mainController.productSearching);
router.get('/productDetails/:id',mainController.loadProductDetails);
router.get('/categoryShop/:id',mainController.loadCategoryShop);
router.get('/searchCategoryProduct',mainController.categoryProductSearching);
router.get('/about',mainController.loadAbout);
router.get('/contact',mainController.loadContact);


router.post('/sortProduct',mainController.sortedProduct);
router.post('/filterProducts',mainController.filterProduct);
router.post('/sortCategoryProduct',mainController.sortCategoryProduct);
router.post('/categoryShopFilter',mainController.categoryShopFilter);


module.exports = router;