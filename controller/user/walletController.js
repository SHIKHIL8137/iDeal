const { Product, Category ,Review,Coupon, Offer, Transaction ,Banner} = require('../../model/adminModel');
const {User,Address,OTP,Cart,CheckOut,Orders,WishList,Wallet,Referral,ReturnCancel,PendingOrder}=require('../../model/userModel');
require('dotenv').config();
const mongoose = require('mongoose');




// load wallet 

const loadWallet = async (req, res) => {
  try {
    res.status(200).render('user/wallet', {
      title: 'Wallet'});
  } catch (error) {
    console.error('Error loading wallet:', error);
    res.status(500).send('Internal Server Error');
  }
};

// add money to wallet 

const addMoneyToWallet = async (req, res) => {
  try {
    const { amount } = req.body; 
    const email = req.session.isLoggedEmail; 
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ status: false, message: "Invalid amount" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const userId = user._id;

    const trxId = generateTransactionId();

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({
        userId,
        balance: parsedAmount,
        transactions: [
          {
            transactionId: trxId,
            type: "credit",
            amount,
            date: new Date(),
          },
        ],
      });
    } else {
      wallet.balance += parsedAmount;
      wallet.transactions.push({
        transactionId: trxId,
        type: "credit",
        amount,
        date: new Date(),
      });
    }
    await wallet.save();

    res.status(200).json({
      status: true,
      message: "Amount added to wallet successfully",
      transactionId: trxId,
      balance: wallet.balance,
    });
  } catch (error) {
    console.error("Error adding money to wallet:", error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};



//function to generate unique transaction id 12 digits
function generateTransactionId() {
  const timestamp = Date.now(); 
  const randomNum = Math.floor(Math.random() * 1000); 
  const transactionId = `${timestamp.toString().slice(-9)}${randomNum.toString().padStart(3, '0')}`;

  return transactionId;
}

// get transaction details data

const getTransactionDetails = async(req,res)=>{
  try {
    const email = req.session.isLoggedEmail;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send('User not found');
    }

    const wallet = await Wallet.findOne({ userId: user._id }).lean();

    const transactions = wallet
      ? wallet.transactions.sort((a, b) => new Date(b.date) - new Date(a.date))
      : [];

    const formattedTransactions = transactions.map((transaction) => ({
      id: transaction.transactionId,
      date: new Date(transaction.date).toLocaleDateString(),
      withdrawal: transaction.type === 'debit' ? `₹${transaction.amount}` : '-',
      deposit: transaction.type === 'credit' ? `₹${transaction.amount}` : '-',
    }));

    res.status(200).json({status : true , transactions:formattedTransactions ,balance: wallet ? wallet.balance : 0})
  } catch (error) {
    
  }
}




module.exports = {
  loadWallet,
  addMoneyToWallet,
  getTransactionDetails,
}