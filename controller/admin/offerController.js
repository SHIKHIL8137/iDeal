
const {Product} = require('../../model/admin/ProductModel');
const {Category} = require('../../model/admin/categoryModel');
const {Offer} = require('../../model/admin/offerModel');
const RESPONSE_MESSAGES = require('../../util/responseMessage');
const STATUS_CODES = require('../../util/statusCode');

// load offer

const loadOffer = async (req, res) => {
  try {
    const username = req.session.username;
    const message = req.query.message;
    const err=req.query.err
    const errBoolean = err === 'true';
    res.status(STATUS_CODES.OK).render('admin/offer', {
      title: "Offer",
      username,
      message,
      errBoolean,
    });
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};

// load add Offer

const loadAddOffer = async (req, res) => {
  try {
    const username=req.session.username;
    const allCategories = await Category.find();
    const allProducts = await Product.find();


    const activeOffers = await Offer.find({ isActive: true });


    const offeredCategories = activeOffers
      .filter(offer => offer.applicableTo === 'Category')
      .map(offer => offer.category?.toString());
    const offeredProducts = activeOffers
      .filter(offer => offer.applicableTo === 'Product')
      .map(offer => offer.product?.toString());

    const availableCategories = allCategories.filter(
      category => !offeredCategories.includes(category._id.toString())
    );
    const availableProducts = allProducts.filter(
      product => !offeredProducts.includes(product._id.toString())
    );

    res.status(STATUS_CODES.OK).render('admin/addOffer', {
      title: "Add Offer",
      username,
      availableCategories,
      availableProducts
    });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};





// load Edit Offer

const loadEditOffer = async (req, res) => {
  try {
    const offerId = req.params.offerId;
    const username=req.session.username;
    const category = await Category.find();
    const allProducts = await Product.find();

    const offerProduct = await Offer.findById(offerId)
      .populate('product')
      .populate('category');

    if (!offerProduct) {
      return res.status(STATUS_CODES.NOT_FOUND).send("Offer not found");
    }

    const productsWithOffers = await Product.find({ 
      offer: { $exists: true },
      _id: { $ne: offerProduct.product?._id }, 
    });

    const availableProducts = allProducts.filter(product =>
      !productsWithOffers.some(offeredProduct => offeredProduct._id.equals(product._id))
    );

    res.status(STATUS_CODES.OK).render('admin/editOffer', {
      username,
      title: "Edit Offer",
      category,
      availableProducts,
      offerProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};


// add Offer 

const addOffer = async(req,res)=>{
  try {
const{product,category,title, description,discountValue,discountCap,validFrom,validTill,isActive}=req.body
 console.log(req.body);
 const customNow = new Date();
    const validTillDate = new Date(validTill);
    const validFromDate = new Date(validFrom);
    if(validTillDate<customNow){
      isActive = false;
     }
    if(product!==''){
      const newOffer = new Offer({
        product,
        applicableTo : 'Product',
        title, 
        description,
        discountValue,
        validFrom : validFromDate,
        validTill :validTillDate,
        isActive,
        discountCap
      })
      await newOffer.save();
      await Product.findByIdAndUpdate(product,{$set:{offer : true}});
    }
    if(category!==''){
      const newOffer = new Offer({
        category,
        applicableTo : 'Category',
        title, 
        description,
        discountValue,
        validFrom :validFromDate,
        validTill : validTillDate,
        isActive,
        discountCap
      })
      await newOffer.save();
    }
    res.status(STATUS_CODES.OK).redirect('/admin/offer?message=Offer Added SuccessFully&err=true');
  } catch (error) {

    console.log(error)
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
  }
}




// get the offer table


const getOfferTable = async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate('product', 'name')
      .populate('category', 'name').sort({createdAt : -1});

    const sanitizedOffers = offers.map((offer) => ({
      ...offer.toObject(),
      product: offer.product || null,
      category: offer.category || null,
    }));
    res.status(STATUS_CODES.OK).json({ status: true, data: sanitizedOffers });
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ status: false, message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};




//delete offer

const deleteOffer =async(req,res)=>{
  try {
    const { offerId } = req.params;
    const offeredProduct = await Offer.findById(offerId);
    if (!offeredProduct) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ status: false, message: "Offer not found" });
    }
    if(offeredProduct.product){
      const productId = offeredProduct.product;
    await Product.findByIdAndUpdate(productId,{ $set : { offer : false} });
    }else if(offeredProduct.category){
      const categoryId = offeredProduct.category;
      await Product.updateMany(
        { category: categoryId },
        { $set: { offer: false } }
      );
    }  
    await Offer.findByIdAndDelete(offerId);
    res.status(STATUS_CODES.OK).json({status:true,message:"Offer deleted successfully"});
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({status:false,message:"Error deleting offer"});
  }
}


// edit offer


const editOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { title, description,discountValue ,discountCap ,applicableTo, category, product, validFrom, validTill, isActive } = req.body;

    let isActiveFlag = isActive === 'true';
    const customNow = new Date();
    const validTillDate = new Date(validTill);
    const validFromDate = new Date(validFrom);
    if(validTillDate<customNow){
      isActiveFlag = false;
     }
    const updateData = {
      discountValue,
      title,
      description,
      applicableTo,
      validFrom :validFromDate,
      validTill :validTillDate,
      isActive: isActiveFlag,
      discountCap
    };

    if (applicableTo === 'Category') {
      updateData.applicableTo = 'Category';
      updateData.category = category
      updateData.product = null;
    };
    if (applicableTo === 'Product') {
      updateData.applicableTo = 'Product';
      updateData.product = product;
      updateData.category = null; 
      await Product.findByIdAndUpdate(product, { $set: { offer: isActiveFlag } });
    };

    await Offer.findByIdAndUpdate(offerId, updateData);
    res.redirect('/admin/offer?message=Offer Updated SuccessFully&err=true');
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};




module.exports = {
  loadAddOffer,
  loadEditOffer,
  addOffer,
  getOfferTable,
  deleteOffer,
  editOffer,
  loadOffer,
}