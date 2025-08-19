
const {User} = require('../../model/user/userModel');
const {Orders} = require('../../model/user/orderModel');
const {ReturnCancel} = require('../../model/user/returnCancelModel');
const {Wallet} = require('../../model/user/walletModel');
const {Product} = require('../../model/admin/ProductModel');
const {Coupon} = require('../../model/admin/couponModel');
const {Transaction} = require('../../model/admin/transactionModel');
const STATUS_CODES = require('../../util/statusCode');
const RESPONSE_MESSAGES = require('../../util/responseMessage');



// orders page load


const loadOrder = async (req, res) => {
  try {
    const username = req.session.username;
    const message = req.query.message;

    const orders = await Orders.find()
      .populate('userId', 'firstName lastName email')
      .populate('products.productId', 'name price')
      .exec();
    res.status(STATUS_CODES.OK).render('admin/orders', { username, message, orders , title:"Orders"});
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};

// get the order details 

const getOrderDetails = async (req,res)=>{
  try {
    const orders = await Orders.find()
    .populate('userId', 'firstName lastName email')
    .populate('products.productId', 'name price')
    .sort({orderDate : -1})
    .exec();
    res.status(STATUS_CODES.OK).json({status : true , orders});
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({status : false , message :RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR});
  }
}


// load loadDetilas page

const loadDetails = async(req,res)=>{
  try {
  const username=req.session.username;
  const message=req.query.message;
  const orderId = req.params.orderId;
    const order = await Orders.findById(orderId)
      .populate('userId products.productId deliveryAddress billingAddress')
      .exec();

    res.render('admin/orderDetails', {
      order,
      username, 
      message,
      title:"Order Details"
    });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
  }
}


//update the order status


const updateOrderStatus = async (req, res) => {
  const orderId = req.params.orderId;
  const { status } = req.body;

  try {
    const order = await Orders.findById(orderId).populate('products.productId').populate('userId','email'); 

    if (!order) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: 'Order not found' });
    }
    if (status === 'Cancelled') {
      for (const item of order.products) {
        const product = await Product.findById(item.productId); 
        if (product) {
          product.stock += item.quantity; 
          await product.save(); 
        }
      }
      if (order.appliedCoupon) {
        const coupon = await Coupon.findOne({ code: order.appliedCoupon });
        if (coupon) {
          if (coupon.usageCount > 0) {
            coupon.usageCount -= 1;
          }
          coupon.usersUsed = coupon.usersUsed.filter((userId) => userId.toString() !== order.userId.toString());
          await coupon.save();
        }
      }
    }

    order.status = status;
    if(status === 'Delivered')
    {
      order.paymentStatus = 'Paid';
    }
    const updatedOrder = await order.save(); 
    if(status === 'Delivered'){
      const transactionId = generateTransactionId();
      const newTransaction = new Transaction({
       userId : order.userId,
       customer : order.userId.email,
       transactionType : 'credit',
       amount : order.totalAmount,
       transactionId,
       paymentMethod : order.paymentMethod,    
      })
  
      await newTransaction.save();
    }   
    res.status(STATUS_CODES.OK).json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};


// load return page


const loadReturn = async(req,res)=>{
  try {
    const username=req.session.username;
    res.status(STATUS_CODES.OK).render('admin/return',{title : "Returns",username});
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
  }
}



// load return table 

const getReturnData = async (req, res) => {
  try {
    const returnData = await ReturnCancel.find({ isReturn: true })
  .populate('userId', 'email') 
  .populate('orderId', 'orderId totalAmount')
  .populate('productId', 'name')
  .sort({ createdAt: -1 }); 

    if (!returnData.length) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        status: false,
        message: 'No return requests found.',
      });
    }
    res.status(STATUS_CODES.OK).json({
      status: true,
      data: returnData,
    });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};


// approve Return 
const approveReturn = async (req, res) => {
  try {
    const { returnCancelId } = req.body; 
    if (!returnCancelId) return res.status(STATUS_CODES.BAD_REQUEST).json({ status: false, message: "returnCancelId is required" });
    const returnCancel = await ReturnCancel.findByIdAndUpdate(
      returnCancelId, 
      { $set: { adminStatus: 'Approved' ,pickupStatus : 'Completed',refundStatus : 'Completed'} }, 
      { new: true } 
    );
    if (!returnCancel) return res.status(STATUS_CODES.NOT_FOUND).json({ status: false, message: "Return request not found" });
    const user = await User.findById(returnCancel.userId);
    if (!user) return res.status(STATUS_CODES.NOT_FOUND).json({ status: false, message: "User not found" });
    const product = await Product.findById(returnCancel.productId);
    if (!product) return res.status(STATUS_CODES.NOT_FOUND).json({ status: false, message: "Product not found" });
    const order = await Orders.findByIdAndUpdate(
      returnCancel.orderId,
      {
        $inc: {
          totalAmount: -returnCancel.refundAmount,
          total_Amt_WOT_Discount: -product.Dprice,
        },
      },
      { new: true }
    );
    if (order) {
      await Orders.findByIdAndUpdate(
        returnCancel.orderId,
        {
          $max: {
            totalAmount: 0,
            total_Amt_WOT_Discount: 0,
          },
        },
        { new: true }
      );
    }
    if (!order) return res.status(STATUS_CODES.NOT_FOUND).json({ status: false, message: "Order not found" });
    const trxId = generateTransactionId();
    let userWallet = await Wallet.findOne({ userId : returnCancel.userId });
    if(!userWallet) return res.status(STATUS_CODES.NOT_FOUND).json({ status: false, message: "Wallet not found" });
    userWallet.balance += returnCancel.refundAmount;
    userWallet.transactions.push({
      transactionId: trxId,
      type: "credit",
      amount : returnCancel.refundAmount,
      date: new Date(),
    });
    await userWallet.save();
    await Product.findByIdAndUpdate(
      returnCancel.productId,
      { $inc: { stock: returnCancel.productQauntity } },
      { new: true }
    );

    const newTransaction = new Transaction({
      userId : user._id,
      customer : user.email,
      transactionType : 'debit',
      amount : returnCancel.refundAmount,
      transactionId : trxId,
      paymentMethod : returnCancel.paymentMethod,    
     })
     await newTransaction.save();
    res.status(STATUS_CODES.OK).json({ status: true, message: "Return request approved", data: returnCancel });
  } catch (error) {
    console.error("Error approving return:", error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ status: false, message: "Internal Server Error" });
  }
};



// retrun rejsect


const rejectReturn = async (req,res)=>{
  try {
    const { returnCancelId, reason } = req.body;
    if (!returnCancelId) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        status: false,
        message: 'ReturnCancel ID is required.',
      });
    }

    const updatedRequest = await ReturnCancel.findByIdAndUpdate(
      returnCancelId,
      {
        $set: {
          adminStatus: 'Rejected',
          reasonForRejection: reason || 'No reason provided.',
        },
      },
      { new: true } 
    );

    const updateOrderStatus = await Orders.findByIdAndUpdate(
      updatedRequest.orderId, 
      { $set: { status: "Delivered" } }
    );

    if (!updateOrderStatus) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        status: false,
        message: 'Order associated with this return request not found.',
      });
    }


    if (!updatedRequest) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        status: false,
        message: 'ReturnCancel request not found.',
      });
    }

    res.status(STATUS_CODES.OK).json({
      status: true,
      message: 'The return request has been successfully rejected.',
      data: updatedRequest,
    });
  } catch (error) {
    console.error('Error rejecting return request:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
}

//function to generate unique transaction id 12 digits
function generateTransactionId() {
  const timestamp = Date.now(); 
  const randomNum = Math.floor(Math.random() * 1000); 
  const transactionId = `${timestamp.toString().slice(-9)}${randomNum.toString().padStart(3, '0')}`;

  return transactionId;
}




// get return order details


const getreturnOrderDetails = async (req, res) => {
  try {
      const returnid = req.params.returnId;
      console.log(returnid);
      const returnOrder = await ReturnCancel.findById(returnid).populate('userId', 'firstName lastName email phone').populate('productId','name');

      if (!returnOrder) {
          return res.status(STATUS_CODES.NOT_FOUND).send('Return Order Not Found');
      }

      res.status(STATUS_CODES.OK).render('admin/returnOrderDetails', { returnOrder,title:"Return Order Details",username:'shikhil'});
  } catch (error) {
      console.error('Error fetching return order details:', error);
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};




module.exports = {
  loadReturn,
  getReturnData,
  approveReturn,
  rejectReturn,
  getreturnOrderDetails,
  loadOrder,
  loadDetails,
  updateOrderStatus,
  getOrderDetails,
}