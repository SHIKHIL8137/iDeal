const { Product, Category ,Review,Coupon, Offer, Transaction ,Banner} = require('../../model/adminModel');
const {User,Address,OTP,Cart,CheckOut,Orders,WishList,Wallet,Referral,ReturnCancel,PendingOrder}=require('../../model/userModel');
require('dotenv').config()
const mongoose = require('mongoose');

// add the product from product details to cart


const addProductToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, price ,actualPrice} = req.body; 
    const email = req.session.isLoggedEmail ;

    if (!productId || !price || !actualPrice) {
      return res.status(400).json({ status: 'error', message: 'Product ID and price are required.' });
    }

    if (!email) {
      return res.status(401).json({ status: 'error', message: 'User is not logged in.' });
    }


    const validProduct = await Product.findById(productId);
    if (!validProduct) {
      return res.status(404).json({ status: 'error', message: 'Invalid product ID.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found.' });
    }

    let cart = await Cart.findOne({ userId: user._id });

    if (cart) {

      if (cart.items.length >= 10 && !cart.items.some((item) => item.productId.toString() === productId)) {
        return res.status(400).json({
          status: 'error',
          message: 'Cart limit reached. You can only have 10 products in the cart.',
        });
      }


      const existingItemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (existingItemIndex > -1) {

        const newQuantity = cart.items[existingItemIndex].quantity + quantity;

        if (newQuantity > 10) {
          return res.status(400).json({
            status: 'error',
            message: 'Maximum quantity for a product is 10.',
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

    res.status(200).json({ status: 'success', message: 'Product updated in cart successfully.' });
  } catch (error) {
    console.error('Error updating product in cart:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
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
      return res.status(404).json({ message: 'Cart not found.' });
    }
    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart.' });
    }

    const item = cart.items[itemIndex];
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found in the inventory.' });
    }
    if (action === 'increment') {
      if (item.quantity >= 10) {
        return res.status(400).json({ message: 'Maximum quantity reached (10).' });
      }
      if (item.quantity + 1 > product.stock) {
        return res.status(400).json({ message: 'Insufficient stock available.' });
      }
      item.quantity += 1;
      item.totalPrice = item.quantity * item.price;
      item.totalActualPrice = item.quantity *item.actualPrice;

    } else if (action === 'decrement') {
      if (item.quantity <= 1) {
        return res.status(400).json({ message: 'Minimum quantity is 1.' });
      }
      item.quantity -= 1;
      item.totalPrice = item.quantity * item.price;
      item.totalActualPrice = item.quantity *item.actualPrice;
    }

    cart.totalAmount = cart.items.reduce((total, item) => total + item.totalPrice, 0);
    cart.totalActualAmount = cart.items.reduce((total, item) => total + item.totalActualPrice, 0);
    await cart.save();

    res.status(200).json({ message: 'Cart updated successfully.' });
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    res.status(500).json({ message: 'Internal server error.' });
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
      return res.status(404).json({ message: 'Cart not found.' });
    }

    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart.' });
    }

    cart.items.splice(itemIndex, 1); 
    cart.totalAmount = cart.items.reduce((total, item) => total + item.totalPrice, 0);
    cart.totalActualAmount = cart.items.reduce((total, item) => total + item.totalActualPrice, 0);
    await cart.save();

    res.status(200).json({ message: 'Item removed from cart successfully.' });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};


// load cart page


const loadCart = async (req, res) => {
  try {
    res.status(200).render('user/cart', {
      title: "Cart",
    });
  } catch (error) {
    console.error('Error loading cart:', error);
    res.status(500).send('Internal Server Error');
  }
};

// get the cart items 



const getCartDetails = async(req,res)=>{
  try {
    const email = req.session.isLoggedEmail;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).send('User not found');
      }

      const userId = user._id;

      const userCart = await Cart.findOne({ userId }).populate('items.productId');
      if(!userCart) return res.status(200).json({status:false,message : 'Cart items Not found'});

       res.status(200).json({
        data: { userCart },status:true
      });
  } catch (error) {
    console.error('Error fetching cart details:', error);
    res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
}
     

const cartSummery = async(req,res)=>{
  try {
    const email = req.session.isLoggedEmail;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).send('User not found');
      }

      const userId = user._id;

      const userCart = await Cart.findOne({ userId }).populate('items.productId');
      if(!userCart) return res.status(200).json({status:false,message : 'Cart items Not found'});

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

      res.status(200).json({
        status: true,
        data: {
          userCart,
          discountCategoryOffer,
          totalCategoryDiscount,
        },
      });
  } catch (error) {
    console.error('Error fetching cart details:', error);
    res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
}

// post the checkout data amd  store in a collecion

const checkoutDataStore = async (req, res) => {
  try {
    const  checkOutData  = req.body;
    const email = req.session.isLoggedEmail;
    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
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
        return res.status(404).json({ message: 'Record not found for update' });
      }
    } else {
      const newCheckOut = new CheckOut({ userId, ...checkOutData });
      await newCheckOut.save();
    }
     req.session.checkOutData = true;
    res.status(200).json({ message: 'Checkout data saved successfully.' });
  } catch (error) {
    console.error('Error in checkoutDataStore:', error);
    res.status(500).json({ message: 'Internal server error.' });
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