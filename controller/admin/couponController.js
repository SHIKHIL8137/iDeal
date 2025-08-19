
const { json } = require('express');
const {Coupon} = require('../../model/admin/couponModel');
const { fillAndStroke } = require('pdfkit');
const STATUS_CODES = require('../../util/statusCode');
const RESPONSE_MESSAGES = require('../../util/responseMessage');

// Load Coupon 

const loadCoupon = async(req,res)=>{
  try {
    const username=req.session.username;
    const message = req.query.message;
    const errBoolean = req.query.err === "true"
    res.status(STATUS_CODES.OK).render('admin/coupon',{title:"Coupon",username,message,errBoolean});
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
  }
}


// add coupon



const loadAddCoupon = async(req,res)=>{

  try {
    const username=req.session.username;
    res.status(STATUS_CODES.OK).render('admin/addCoupon',{title:"Add Coupon",username});
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
  }
}


//Edit coupon

const loadEditCoupon = async(req,res)=>{

  try {
    const id = req.params.couponId;
    const username=req.session.username;
    const coupon = await Coupon.findById(id);
    res.status(STATUS_CODES.OK).render('admin/editCoupon',{title:"Edit Coupon",username,coupon});
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
  }
}


// add coupon route

const addCoupon = async(req,res)=>{
  try {
    const {
      code,
      description,
      discountPercentage,
      minOrderAmount,
      maxDiscountAmount,
      validFrom,
      validTill,
      usageLimit,
    } = req.body;
    const coupenCodeFromClient = code.trim().toUpperCase();
    const coupenCode = await Coupon.findOne({code:coupenCodeFromClient});
    if(coupenCode) return res.status(400).json({status:false,message:"Copen code already exist try another code"});
    if (!code || !discountPercentage || !validFrom || !validTill) {
      return res.status(400).json({ status: false, message: 'All required fields must be provided.' });
    }
    const newCoupon = new Coupon({
      code : code.trim().toUpperCase(),
      discountPercentage : discountPercentage.trim(),
      description : description.trim(),
      minOrderAmount: minOrderAmount || 0,
      maxDiscountAmount: maxDiscountAmount || null,
      validFrom: new Date(validFrom),
      validTill: new Date(validTill),
      usageLimit: usageLimit || null,
    });

    await newCoupon.save();
    res.status(STATUS_CODES.OK).json({message:'Coupon added successFully',status :true});;
  } catch (error) {
    console.error('Error adding coupon:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
  }
}

// Edit coupon 


const editCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountPercentage,
      minOrderAmount,
      maxDiscountAmount,
      validFrom,
      validTill,
      usageLimit,
      status,
    } = req.body;
    const  couponId =req.params.couponId;
    console.log('Edit Coupon Request:', req.body);

    if (!couponId || !code || !discountPercentage || !validFrom || !validTill) {
      return res.status(400).json({status : false,message:'All fields are require'}); 
    }

    if (discountPercentage < 0 || discountPercentage > 100) {
      return res.status(400).json({message:'Invalid input dicount percentage exied or less than 0',status:false});
    }

    const validFromDate = new Date(validFrom);
    const validTillDate = new Date(validTill);

    if (validFromDate > validTillDate) {
      return res.status(400).json({message:'Invalid end date',status:false});
    }
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(400).json({message:'Invalid Coupon ID',status:false});
    }

    coupon.code = code.trim().toUpperCase();
    coupon.description = description ? description.trim() : coupon.description;
    coupon.discountPercentage = parseFloat(discountPercentage); 
    coupon.minOrderAmount = minOrderAmount ? parseFloat(minOrderAmount) : 0;
    coupon.maxDiscountAmount = maxDiscountAmount ? parseFloat(maxDiscountAmount) : null;
    coupon.validFrom = validFromDate;
    coupon.validTill = validTillDate;
    coupon.usageLimit = usageLimit ? parseInt(usageLimit, 10) : null;
    coupon.isActive = status === 'true';

    await coupon.save();
    console.log(coupon)
    res.status(STATUS_CODES.OK).json({status :true ,message:'Coupen Added SuccessFully',data :coupon});
  } catch (error) {
    console.error('Error editing coupon:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({status:false,message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR});
  }
};


// get the coupon table

const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    const updatedCoupons = coupons.map((coupon) => {
      if (new Date(coupon.validTill) < new Date()) {
        coupon.isActive = false; 
      }
      return coupon;
    });
    res.status(STATUS_CODES.OK).json({ status: 'success', coupons: updatedCoupons});
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ status: 'error', message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

// search coupon


const searchCoupon = async (req, res) => {
  const searchTerm = req.query.search || '';
  try {
    const coupons = await Coupon.find({code: { $regex: searchTerm, $options: 'i' }}).exec();

    res.json({ status: 'success', coupons });
  } catch (err) {
    console.error(err);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ status: 'error', message: 'Failed to fetch coupons' });
  }
}



module.exports = {
  getCoupons,
  editCoupon,
  searchCoupon,
  loadCoupon,
  loadAddCoupon,
  loadEditCoupon,
  addCoupon,
}