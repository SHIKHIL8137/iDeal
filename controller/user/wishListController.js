
const {Offer} = require('../../model/admin/offerModel');
const {User} = require('../../model/user/userModel');
const {WishList} = require('../../model/user/wishlistModel');
const RESPONSE_MESSAGES = require('../../util/responseMessage');
const STATUS_CODES = require('../../util/statusCode');

require('dotenv').config();


// load whish list

const loadWishlist = async (req, res) => {
  try {
const offer = await Offer.find({applicableTo : 'Product'});
    res.status(STATUS_CODES.OK).render('user/wishlist', {
      title: "Wish List",
      offer
    });
  } catch (error) {
    console.error("Error loading wishlist:", error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('user/internalError');
  }
};

// get wishlist data 

const getWishlistData = async (req, res) => {
  try {
    const email = req.session.isLoggedEmail;
    if (!email) {
      return res.status(401).json({ status: "false", message: "Unauthorized access" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ status: "false", message:RESPONSE_MESSAGES.USER_NOT_FOUND });
    }

    const wishlist = await WishList.findOne({ userId: user._id })
      .populate('items.productId')
      .exec();

    if (wishlist) {
      wishlist.items.sort((a, b) => b.addedAt - a.addedAt); 
    }

    res.status(STATUS_CODES.OK).json({
      status: "true",
      wishlist: wishlist ? wishlist.items : [],
    });
  } catch (error) {
    console.error("Error loading wishlist:", error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ status: "false", message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR});
  }
};

// add to wishList


const addtoWishlist = async (req, res) => {
  try {
    const productId = req.params.id; 
    const email = req.session.isLoggedEmail;
    console.log(email);
    const user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ status: false, message: RESPONSE_MESSAGES.USER_NOT_FOUND });
    }

    const userId = user._id;
    let wishlist = await WishList.findOne({ userId });

    if (!wishlist) {
      wishlist = new WishList({
        userId,
        items: [{ productId }],
      });
      await wishlist.save();
      return res.status(STATUS_CODES.CREATE).json({ status: true, message: "Product added to wishlist" });
    }
    if (wishlist.items.length >= 20) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ status: false, message: "Wishlist is full. You can only have 20 items." });
    }

    const itemExists = wishlist.items.some(
      (item) => item.productId.toString() === productId
    );

    if (itemExists) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ status: false, message: "Product already in wishlist" });
    }

    wishlist.items.push({ productId });
    await wishlist.save();

    res.status(STATUS_CODES.OK).json({ status: true, message: "Product added to wishlist" });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ status: false, message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};


// Detlet item from the cart


const deleteFromWishlist = async (req, res) => {
  try {
    const productId = req.params.id;
    const email = req.session.isLoggedEmail; 
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ status: false, message: RESPONSE_MESSAGES.USER_NOT_FOUND });
    }

    const updatedWishlist = await WishList.findOneAndUpdate(
      { userId: user._id },
      { $pull: { items: { productId } } },
      { new: true }
    );

    if (updatedWishlist) {
      res.status(STATUS_CODES.OK).json({ status: true, message: "Item removed from wishlist" });
    } else {
      res.status(STATUS_CODES.BAD_REQUEST).json({ status: false, message: "Wishlist not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ status: false, message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};



module.exports = {
  loadWishlist,
  getWishlistData,
  addtoWishlist,
  deleteFromWishlist,
}