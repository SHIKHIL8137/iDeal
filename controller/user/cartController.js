
const { User} = require('../../model/user/userModel')
const {Cart , CheckOut} = require('../../model/user/cartModel')
const { Product} = require('../../model/admin/ProductModel');
const {Offer } = require('../../model/admin/offerModel');
require('dotenv').config()
const mongoose = require('mongoose');
const STATUS_CODES = require('../../util/statusCode');
const RESPONSE_MESSAGES = require('../../util/responseMessage');

// add the product from product details to cart


const addProductToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, price ,actualPrice} = req.body; 
    const email = req.session.isLoggedEmail ;

    if (!productId || !price || !actualPrice) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ status: 'error', message: RESPONSE_MESSAGES.PRODUCT_ID_PRICE_REQUIRED });
    }

    if (!email) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({ status: 'error', message: RESPONSE_MESSAGES.USER_NOT_LOGGED_IN });
    }


    const validProduct = await Product.findById(productId);
    if (!validProduct) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ status: 'error', message: RESPONSE_MESSAGES.INVALID_PRODUCT_ID });
    }

      if (validProduct.stock <= 0) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        status: 'error',
        message: 'Product is out of stock',
      });
    }



    const user = await User.findOne({ email });
    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ status: 'error', message: RESPONSE_MESSAGES.USER_NOT_FOUND });
    }

    let cart = await Cart.findOne({ userId: user._id });

    if (cart) {

      if (cart.items.length >= 10 && !cart.items.some((item) => item.productId.toString() === productId)) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          status: 'error',
          message: RESPONSE_MESSAGES.CART_LIMIT_REACHED,
        });
      }


      const existingItemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (existingItemIndex > -1) {

        const newQuantity = cart.items[existingItemIndex].quantity + quantity;

        if (newQuantity > validProduct.stock) {
          return res.status(STATUS_CODES.BAD_REQUEST).json({
            status: 'error',
            message: 'Insufficient stock available',
          });
        }

        if (newQuantity > 10) {
          return res.status(STATUS_CODES.BAD_REQUEST).json({
            status: 'error',
            message: RESPONSE_MESSAGES.MAX_QUANTITY_REACHED,
          });
        }

        cart.items[existingItemIndex].quantity = newQuantity;
        cart.items[existingItemIndex].totalPrice = newQuantity * price;
        cart.items[existingItemIndex].totalActualPrice = newQuantity * actualPrice;


        if (newQuantity <= 0) {
          cart.items.splice(existingItemIndex, 1);
        }
      } else {

        cart.items.push({
          productId,
          quantity,
          price,
          actualPrice,
          totalPrice: quantity * price,
          totalActualPrice : quantity * actualPrice,
        });
      }
    } else {

      cart = new Cart({
        userId: user._id,
        items: [
          {
            productId,
            quantity,
            price,
            actualPrice,
            totalPrice: quantity * price,
            totalActualPrice : quantity * actualPrice,
          },
        ],
      });
    }

   
    cart.totalAmount = cart.items.reduce((total, item) => total + item.totalPrice, 0);
    cart.totalActualAmount = cart.items.reduce((total, item) => total + item.totalActualPrice, 0);

    await cart.save();

    res.status(STATUS_CODES.OK).json({ status: 'success', message: RESPONSE_MESSAGES.PRODUCT_UPDATED_IN_CART });
  } catch (error) {
    console.error('Error updating product in cart:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ status: 'error', message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

// update Quantity in cart

const updateCartQuantity = async (req, res) => {
  try {
    const { productId, action } = req.body;
    const email = req.session.isLoggedEmail;
    const user = await User.findOne({ email });
    const cart = await Cart.findOne({ userId: user._id });

    if (!cart) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: RESPONSE_MESSAGES.CART_NOT_FOUND });
    }
    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);

    if (itemIndex === -1) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: RESPONSE_MESSAGES.PRODUCT_NOT_IN_CART });
    }

    const item = cart.items[itemIndex];
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: RESPONSE_MESSAGES.PRODUCT_NOT_IN_INVENTORY });
    }
    if (action === 'increment') {
      if (item.quantity >= 10) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ message: RESPONSE_MESSAGES.MAX_QUANTITY_REACHED });
      }
      if (item.quantity + 1 > product.stock) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ message: RESPONSE_MESSAGES.INSUFFICIENT_STOCK });
      }
      item.quantity += 1;
      item.totalPrice = item.quantity * item.price;
      item.totalActualPrice = item.quantity *item.actualPrice;

    } else if (action === 'decrement') {
      if (item.quantity <= 1) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ message: RESPONSE_MESSAGES.MIN_QUANTITY_REACHED });
      }
      item.quantity -= 1;
      item.totalPrice = item.quantity * item.price;
      item.totalActualPrice = item.quantity *item.actualPrice;
    }

    cart.totalAmount = cart.items.reduce((total, item) => total + item.totalPrice, 0);
    cart.totalActualAmount = cart.items.reduce((total, item) => total + item.totalActualPrice, 0);
    await cart.save();

    res.status(STATUS_CODES.OK).json({ message: RESPONSE_MESSAGES.CART_UPDATED_SUCCESSFULLY });
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

// delete product from cart


const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const email = req.session.isLoggedEmail ;

    const user = await User.findOne({ email });
    const cart = await Cart.findOne({ userId: user._id });

    if (!cart) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: RESPONSE_MESSAGES.CART_NOT_FOUND });
    }

    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);

    if (itemIndex === -1) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: RESPONSE_MESSAGES.PRODUCT_NOT_IN_CART });
    }

    cart.items.splice(itemIndex, 1); 
    cart.totalAmount = cart.items.reduce((total, item) => total + item.totalPrice, 0);
    cart.totalActualAmount = cart.items.reduce((total, item) => total + item.totalActualPrice, 0);
    await cart.save();

    res.status(STATUS_CODES.OK).json({ message: RESPONSE_MESSAGES.ITEM_REMOVED_FROM_CART });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};


// load cart page


const loadCart = async (req, res) => {
  try {
    res.status(STATUS_CODES.OK).render('user/cart', {
      title: "Cart",
    });
  } catch (error) {
    console.error('Error loading cart:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('user/internalError');
  }
};

// get the cart items 



const getCartDetails = async(req,res)=>{
  try {
    const email = req.session.isLoggedEmail;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(STATUS_CODES.NOT_FOUND).send(RESPONSE_MESSAGES.USER_NOT_FOUND);
      }

      const userId = user._id;

      const userCart = await Cart.findOne({ userId }).populate('items.productId');
      if(!userCart) return res.status(STATUS_CODES.OK).json({status:false,message : RESPONSE_MESSAGES.CART_ITEMS_NOT_FOUND});

       res.status(STATUS_CODES.OK).json({
        data: { userCart },status:true
      });
  } catch (error) {
    console.error('Error fetching cart details:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ status: false, message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR });
  }
}
     

const cartSummery = async(req,res)=>{
  try {
    const email = req.session.isLoggedEmail;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(STATUS_CODES.NOT_FOUND).send('User not found');
      }

      const userId = user._id;

      const userCart = await Cart.findOne({ userId }).populate('items.productId');
      if(!userCart) return res.status(STATUS_CODES.OK).json({status:false,message : 'Cart items Not found'});

      let discountCategoryOffer = null; 
      let totalCategoryDiscount = 0; 

      if (userCart && userCart.items.length > 0) {

        for (const cartItem of userCart.items) {
          const product = cartItem.productId;
          if (product) {
            const checkOffer = await Offer.findOne({
              category: product.category, 
              isActive: true,           
            }).populate('category'); 

            if (checkOffer) {
              discountCategoryOffer = checkOffer;


              const productPrice = product.price;
              const discountPercentage = checkOffer.discountValue; 
              const discountCap = checkOffer.discountCap || Infinity; 
              const quantity = cartItem.quantity;

              let calculatedDiscount = (productPrice * (discountPercentage / 100)) * quantity;

              if (calculatedDiscount > discountCap) {
                calculatedDiscount = discountCap;
              }

              totalCategoryDiscount += calculatedDiscount;

              break; 
            }
          }
        }
      } 

      res.status(STATUS_CODES.OK).json({
        status: true,
        data: {
          userCart,
          discountCategoryOffer,
          totalCategoryDiscount,
        },
      });
  } catch (error) {
    console.error('Error fetching cart details:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ status: false, message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR });
  }
}

// post the checkout data amd  store in a collecion

const checkoutDataStore = async (req, res) => {
  try {
    const  checkOutData  = req.body;
    const email = req.session.isLoggedEmail;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'User not found' });
    }
    const userId = new mongoose.Types.ObjectId(user._id);

    const existUser = await CheckOut.findOne({ userId });
    const cart = await Cart.findOne({userId});
    const cartId = cart._id;
    checkOutData.cartId = cartId;
    if (existUser) {
      const result = await CheckOut.updateOne(
        { userId },
        { $set:checkOutData}
      );
      if (result.matchedCount === 0) {
        console.error('No matching record found for update.');
        return res.status(STATUS_CODES.NOT_FOUND).json({ message: RESPONSE_MESSAGES.RECORD_NOT_FOUND_FOR_UPDATE });
      }
    } else {
      const newCheckOut = new CheckOut({ userId, ...checkOutData });
      await newCheckOut.save();
    }
     req.session.checkOutData = true;
    res.status(STATUS_CODES.OK).json({ message: RESPONSE_MESSAGES.CHECKOUT_DATA_SAVED });
  } catch (error) {
    console.error('Error in checkoutDataStore:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};


module.exports = {
  addProductToCart,
  updateCartQuantity,
  removeFromCart,
  loadCart,
  getCartDetails,
  cartSummery,
  checkoutDataStore,
}