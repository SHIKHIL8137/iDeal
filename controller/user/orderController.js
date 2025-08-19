
const {User} = require('../../model/user/userModel');
const {Orders} = require('../../model/user/orderModel');
const {Wallet} = require('../../model/user/walletModel');
const {ReturnCancel} = require('../../model/user/returnCancelModel');
const {PendingOrder} = require('../../model/user/pendingModel');
const { Product} = require('../../model/admin/ProductModel');
const {Coupon } = require('../../model/admin/couponModel');
const {Transaction} =require('../../model/admin/transactionModel');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const STATUS_CODES = require('../../util/statusCode');
const RESPONSE_MESSAGES = require('../../util/responseMessage');
require('dotenv').config()


// load order history page


const loadOrderHistory = async (req, res) => {
  try {
    const email = req.session.isLoggedEmail;  
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'User not found' });
    }

    const userId = new mongoose.Types.ObjectId(user._id);
    const orders = await Orders.find({ userId }).sort({ orderDate: -1 }); 
    const Pending = await PendingOrder.find({ userId }).sort({ createdAt: -1 });

    for (let order of orders) {
      const firstProduct = order.products[0]; 
      order.firstProductName = firstProduct.productName;
      order.firstProductQuantity = firstProduct.quantity; 
    }
    for (let order of Pending) {
      const firstProduct = order.products[0]; 
      order.firstProductName = firstProduct.productName;
      order.firstProductQuantity = firstProduct.quantity; 
    }
    res.status(STATUS_CODES.OK).render('user/orderHistory', { Pending ,orders ,title:"Order History"});
  } catch (error) {
    console.log(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('user/internalError');
  }
};



// load order detailes page


const loadOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;

    if (!orderId) {
      return res.status(400).send(RESPONSE_MESSAGES.ORDER_ID_REQUIRED);
    }
    const order = await Orders.findOne({ orderId }).populate('userId', 'username email');

    if (!order) {
      return res.status(STATUS_CODES.NOT_FOUND).send(RESPONSE_MESSAGES.ORDER_NOT_FOUND);
    }

    let returnStatusMap = {};
    if (order.status === 'Delivered') {
      const returnRequests = await ReturnCancel.find({ orderId: order._id });

 
      returnRequests.forEach((req) => {
        if (req.productId) { 
          returnStatusMap[req.productId.toString()] = req;
        }
      });
    }
    res.status(STATUS_CODES.OK).render('user/orderDetails', {
      order,
      returnStatusMap,
      title: 'Order Details',
    });
  } catch (error) {
    console.error('Error loading order details:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('user/internalError');
  }
};

//load conformation page

const loadOrderConformation = async (req, res) => {
  try {
    const orderId = req.params.id;
    const orderDetails = await Orders.findOne({ orderId }).populate('userId').exec();
    if (!orderDetails) {
      return res.status(STATUS_CODES.NOT_FOUND).send(RESPONSE_MESSAGES.ORDER_NOT_FOUND);
    }

    if (orderDetails.status === 'expired') {
      return res.status(STATUS_CODES.FORBIDDEN).redirect('/user/shop');
    }
    res.status(STATUS_CODES.OK).render('user/orderConformation', { orderDetails ,title:"Order Conformation"});
  } catch (error) {
    console.error('Error in loadOrderConformation:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('user/internalError');
  }
};

// generate the order invoice

const generateSalesInvoice = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Orders.findOne({orderId}).populate('userId').populate('products.productId');

    if (!order) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'Order not found' });
    }

    generateInvoice(order, res);
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};


function generateInvoice(order, res) {
  const doc = new PDFDocument({ margin: 50 });
  const fileName = `invoice-${order.orderId}.pdf`;

  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Content-Type', 'application/pdf');


  doc.pipe(res);


  doc
    .fontSize(24)
    .text('iDeal Order Invoice', { align: 'center' })
    .fontSize(10)
    .fillColor('gray')
    .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' })
    .moveDown(2);


  doc
    .fontSize(10)
    .fillColor('#000000')
    .text('Kalarikkal Ltd.', 50, 100)
    .text('Irinjalakuda, VT / 82021', 50, 115)
    .text('Phone: 8137046575', 50, 130);

  doc
    .text(`${order.billingAddress.houseName}`, 400, 100 , { align: 'right' })
    .text(`${order.billingAddress.country}, ${order.billingAddress.state}, ${order.billingAddress.city}`, 400, 115, { align: 'right' })
    .text(`${order.billingAddress.zipCode}`, 400, 130, { align: 'right' })
    .text(`${order.billingAddress.email}`, 400, 145 , { align: 'right' })
    .text(`${order.billingAddress.phone}`, 400, 160 , { align: 'right' });


  doc
    .moveDown(2)
    .fontSize(10)
    .fillColor('#333333')
    .text(`Invoice Number: ${order.orderId}`, 50, STATUS_CODES.OK)
    .text(`Date: ${new Date(order.orderDate).toLocaleDateString()}`, 50, 215);


  const tableTop = 270;
  const tableHeaderHeight = 20;
  doc
    .fontSize(10)
    .fillColor('#333333')
    .text('Product', 50, tableTop)
    .text('Description', 150, tableTop, { width: 100, align: 'left' })
    .text('Rate', 300, tableTop, { width: 50, align: 'right' })
    .text('Quantity', 380, tableTop, { width: 50, align: 'right' })
    .text('Total', 470, tableTop, { width: 50, align: 'right' });

  doc
    .moveTo(50, tableTop + 15)
    .lineTo(550, tableTop + 15)
    .stroke('#cccccc');


  let position = tableTop + tableHeaderHeight;
  order.products.forEach((product) => {
    doc
      .fontSize(10)
      .fillColor('#000000')
      .text(product.productName, 50, position)
      .text(product.productColor, 150, position, { width: 100, align: 'left' })
      .text(`${product.price.toFixed(2)}`, 300, position, { width: 50, align: 'right' })
      .text(product.quantity, 380, position, { width: 50, align: 'right' })
      .text(`${(product.total * product.quantity).toFixed(2)}`, 470, position, { width: 50, align: 'right' });

    position += tableHeaderHeight;
  });

  doc
    .moveTo(50, position)
    .lineTo(550, position)
    .stroke('#cccccc')
    .moveDown(1);

  position += 10;

  doc
    .fontSize(12)
    .fillColor('#333333')
    .text('Subtotal:', 300, position)
    .text(`${order.subtotal.toFixed(2)}`, 480, position);

  doc
    .text('Discount:', 300, position + 20)
    .text(`-${order.discount.toFixed(2)}`, 480, position + 20);

  doc
    .text('Delivery Fee:', 300, position + 40)
    .text(`${order.deliveryFee.toFixed(2)}`, 480, position + 40);

  doc
    .text('Total Amount:', 300, position + 60)
    .fontSize(16)
    .text(`${order.totalAmount.toFixed(2)}`, 480, position + 60);

  doc
    .moveDown(4)
    .fontSize(10)
    .fillColor('#333333')
    .text('Terms', 50, position + 100)
    .fontSize(8)
    .fillColor('#666666')
    .text('Please make a transfer to:', 50, position + 115)
    .text('Kalarikkal', 50, position + 130)
    .text('IBAN: GB23 2344 2334423234423', 50, position + 145)
    .text('BIC: Kalarikkal', 50, position + 160);

    doc
    .moveDown(1)
    .fontSize(10)
    .font('Helvetica-Oblique')
    .fillColor('gray')
    .text(
      'This report was generated by iDeal. All amounts are in INR.',
      50,
      doc.y,
      { align: 'center', width: STATUS_CODES.INTERNAL_SERVER_ERROR }
    )
    .text('For any queries, contact support@ideal.com.', { align: 'center' });

  doc.end();
}


// cancel the order



const cancelOreder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { reason } = req.body;

    const order = await Orders.findById(orderId).populate('userId');
    if (!order) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: RESPONSE_MESSAGES.ORDER_NOT_FOUND });
    }

    for (const productItem of order.products) {
      if(!productItem.cancelStatus){
        const product = await Product.findById(productItem.productId);
        if (product) {
          product.stock += productItem.quantity;
          await product.save();
        }
      }
    }

    if (order.appliedCoupon) {
      const coupon = await Coupon.findOne({ code: order.appliedCoupon });
      if (coupon) {
        if (coupon.usageCount > 0) {
          coupon.usageCount -= 1;
        }
        coupon.usersUsed = coupon.usersUsed.filter(
          (userId) => userId.toString() !== order.userId.toString()
        );
        await coupon.save();
      }
    }

    const refundAmount = order.totalAmount; 
    const newUserReason = new ReturnCancel({
      reason: reason.trim(),
      userId: order.userId,
      orderId: order._id,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      isReturn: false,
      refundAmount: order.paymentMethod === "COD" ? 0 : refundAmount, 
    });

    await newUserReason.save();
    order.status = "Cancelled";
    await order.save();

    if (order.paymentStatus === "Paid" && order.paymentMethod !== "COD") {
      const trxId = generateTransactionId();

      let userWallet = await Wallet.findOne({ userId: order.userId });
      if (!userWallet) {
        return res.status(STATUS_CODES.NOT_FOUND).json({ status: false, message: RESPONSE_MESSAGES.WALLET_NOT_FOUND });
      }

      userWallet.balance += refundAmount; 
      userWallet.transactions.push({
        transactionId: trxId,
        type: "credit",
        amount: refundAmount,
        date: new Date(),
      });

      await userWallet.save();

      const newTransaction = new Transaction({
        userId : newUserReason.userId,
        customer : order.userId.email,
        transactionType : 'debit',
        amount : newUserReason.refundAmount,
        transactionId : trxId,
        paymentMethod : newUserReason.paymentMethod,    
       })
       await newTransaction.save();


    }
    res.status(STATUS_CODES.OK).json({ message: RESPONSE_MESSAGES.ORDER_CANCELED_SUCCESSFULLY, order });
  } catch (err) {
    console.error(err);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "Server Error" });
  }
};

//function to generate unique transaction id 12 digits
function generateTransactionId() {
  const timestamp = Date.now(); 
  const randomNum = Math.floor(Math.random() * 1000); 
  const transactionId = `${timestamp.toString().slice(-9)}${randomNum.toString().padStart(3, '0')}`;

  return transactionId;
}


// chenge oreder conformation expire status

const changeOrderConformationStatus = async(req,res)=>{

  const { orderId } = req.params;

  try {
    const order = await Orders.findById(orderId);

    if (!order) {
      return res.status(STATUS_CODES.NOT_FOUND).send({ message: RESPONSE_MESSAGES.ORDER_NOT_FOUND });
    }

    if (order.status === 'expired') {
      return res.status(STATUS_CODES.BAD_REQUEST).send({ message: RESPONSE_MESSAGES.ORDER_ALREADY_EXPIRED });
    }
    order.orderConformStatus = 'expired';
    await order.save();

    res.status(STATUS_CODES.OK).send({ message: RESPONSE_MESSAGES.ORDER_EXPIRED_SUCCESSFULLY });
  } catch (error) {
    console.error('Error expiring order:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send({ message: 'Server error' });
  }


}

// return the order


const returnOrder = async(req,res)=>{
  try {
    const {reason,address} = req.body;
    const productId = req.query.productId
    const orderId = req.query.orderId;
    if(!req.session.isLoggedEmail) return res.status(400).json({status:false,message:"user not found"})
    if (!reason || !address || !orderId || !productId) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        status: false,
        message: RESPONSE_MESSAGES.ALL_FIELDS_REQUIRED,
      });
    }
    const order = await Orders.findById(orderId);
     
    const product = order.products.find(p => p.productId.toString() === productId);

    if(!order) return res.status(400).json({status:false,message:RESPONSE_MESSAGES.ORDER_NOT_FOUND})

    const returnOrderData = new ReturnCancel({
      orderId:order._id,
      userId : order.userId,
      productId : productId,
      productQauntity : product.quantity,
      reason,
      paymentMethod : order.paymentMethod,
      paymentStatus : order.paymentStatus,
      isReturn: true, 
      pickupStatus: 'Not Scheduled', 
      refundAmount : product.total,
      pickupAddress: address, 
      adminStatus : 'Pending',
    });
    await returnOrderData.save();
    product.returnStatus = true;
    await order.save();
    res.status(STATUS_CODES.CREATE).json({
      status: true,
      message: RESPONSE_MESSAGES.RETURN_ORDER_INITIATED,
    });
  } catch (error) {
    console.log(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({status:false,message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR});
  }
}

// cnceled individual product 

const cancelIndiProduct = async(req,res)=>{
  try {
    const {reason} = req.body;
    const productId = req.query.productId
    const orderId = req.query.orderId;
    if(!req.session.isLoggedEmail) return res.status(400).json({status:false,message:"user not found"})
    if (!reason || !orderId || !productId) {
      return res.status(400).json({
        status: false,
        message: RESPONSE_MESSAGES.ALL_FIELDS_REQUIRED,
      });
    }
    const order = await Orders.findById(orderId);
     
    const product = order.products.find(p => p.productId.toString() === productId);

    if(!order) return res.status(400).json({status:false,message:RESPONSE_MESSAGES.ORDER_NOT_FOUND})

    const cancelledOrderData = new ReturnCancel({
      orderId:order._id,
      userId : order.userId,
      productId : productId,
      productQauntity : product.quantity,
      reason,
      isReturn: false,
      paymentMethod : order.paymentMethod,
      paymentStatus : order.paymentStatus, 
      refundAmount : product.total,
    });
    await cancelledOrderData.save();
    product.cancelStatus = true;
    await order.save();


    const user = await User.findById(cancelledOrderData.userId);
    if (!user) return res.status(STATUS_CODES.NOT_FOUND).json({ status: false, message: RESPONSE_MESSAGES.USER_NOT_FOUND });
    const products = await Product.findById(cancelledOrderData.productId);
    if (!products) return res.status(STATUS_CODES.NOT_FOUND).json({ status: false, message: RESPONSE_MESSAGES.PRODUCT_NOT_FOUND });
    const orders = await Orders.findByIdAndUpdate(
      cancelledOrderData.orderId,
      {
        $inc: {
          totalAmount: -cancelledOrderData.refundAmount,
          total_Amt_WOT_Discount: -products.Dprice,
        },
      },
      { new: true }
    );
    if (orders) {
      await Orders.findByIdAndUpdate(
        cancelledOrderData.orderId,
        {
          $max: {
            totalAmount: 0,
            total_Amt_WOT_Discount: 0,
          },
        },
        { new: true }
      );
    }

    if (!order) return res.status(STATUS_CODES.NOT_FOUND).json({ status: false, message: RESPONSE_MESSAGES.ORDER_NOT_FOUND });
    await Product.findByIdAndUpdate(
      cancelledOrderData.productId,
      { $inc: { stock: cancelledOrderData.productQauntity } },
      { new: true }
    );
    if (order.paymentStatus === "Paid" && order.paymentMethod !== "COD") {
          const trxId = generateTransactionId();
          let userWallet = await Wallet.findOne({ userId : cancelledOrderData.userId });
          if(!userWallet) return res.status(STATUS_CODES.NOT_FOUND).json({ status: false, message: RESPONSE_MESSAGES.WALLET_NOT_FOUND });
          userWallet.balance += cancelledOrderData.refundAmount;
          userWallet.transactions.push({
            transactionId: trxId,
            type: "credit",
            amount : cancelledOrderData.refundAmount,
            date: new Date(),
          });
          await userWallet.save();
          const newTransaction = new Transaction({
            userId : user._id,
            customer : user.email,
            transactionType : 'debit',
            amount : cancelledOrderData.refundAmount,
            transactionId : trxId,
            paymentMethod : cancelledOrderData.paymentMethod,    
          })
          await newTransaction.save();
    }
    res.status(STATUS_CODES.CREATE).json({
      status: true,
      message: RESPONSE_MESSAGES.ORDER_CANCELED_SUCCESSFULLY,
    });
  } catch (error) {
    console.log(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({status:false,message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR});
  }
}



// get the ordered product details

const orderDetails = async(req,res)=>{
  try{
    const orderId = req.params.id;

    if (!orderId) {
      return res.status(400).send(RESPONSE_MESSAGES.ORDER_ID_REQUIRED);
    }
    const order = await Orders.findOne({ orderId }).populate('userId', 'username email');

    if (!order) {
      return res.status(STATUS_CODES.NOT_FOUND).send(RESPONSE_MESSAGES.ORDER_NOT_FOUND);
    }

    let returnStatusMap = {};
    if (order.status === 'Delivered') {
      const returnRequests = await ReturnCancel.find({ orderId: order._id });

 
      returnRequests.forEach((req) => {
        if (req.productId) { 
          returnStatusMap[req.productId.toString()] = req;
        }
      });
    }
    res.status(STATUS_CODES.OK).json({
      order,
      returnStatusMap,
      status :true
    });
  }catch(error){
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({status : false , message : RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR})
  }
}



module.exports = {
  loadOrderHistory,
  loadOrderDetails,
  loadOrderConformation,
  generateSalesInvoice,
  cancelOreder,
  changeOrderConformationStatus,
  returnOrder,
  orderDetails,
  cancelIndiProduct
}