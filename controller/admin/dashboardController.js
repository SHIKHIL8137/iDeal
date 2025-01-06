const {Product,Category,Admin,Coupon, Offer,Transaction,Banner} = require('../../model/adminModel');
const {User,Address,OTP,Orders,ReturnCancel,Wallet}=require('../../model/userModel');





// get the top Saling product

const getTopSellingProduct = async(req,res)=>{
  try {
    const salesData = await Orders.aggregate([
     {$unwind : "$products"},
     {
      $group: {
      _id: "$products.productId", 
      totalSold: { $sum: "$products.quantity" },
      productName: { $first: "$products.productName" }, 
    }
  }
    ]);


    const returnData = await ReturnCancel.aggregate([
      {
        $group: {
          _id: "$productId", 
          totalReturned: { $sum: "$productQauntity" } 
        }
      }
    ]);

    const actualSales = salesData.map(sale => {
      const returnInfo = returnData.find(returned => String(returned._id) === String(sale._id)) || { totalReturned: 0 };
      return {
        productId: sale._id,
        productName: sale.productName,
        actualQuantity: sale.totalSold - returnInfo.totalReturned 
      };
    });

    const top5Products =  actualSales.sort((a, b) => b.actualQuantity - a.actualQuantity).slice(0,5);
    
 res.status(200).json({message :"Data featch successFull" ,top5Products});
  } catch (error) {
    console.log(error);
    res.status(500).json({message : 'Internal Server Error'});
  }
}

// get the most selling category

const getMostSoldCategories = async (req, res) => {
  try {
    const soldCategories = await Orders.aggregate([
      { $unwind: "$products" }, 
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $lookup: {
          from: "categories", 
          localField: "productDetails.category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" }, 
      {
        $group: {
          _id: "$categoryDetails._id",
          categoryName: { $first: "$categoryDetails.name" }, 
          totalSold: { $sum: "$products.quantity" }, 
        },
      },
    ]);


    const returnedCategories = await ReturnCancel.aggregate([
      {
        $group: {
          _id: "$productId",
          totalReturned: { $sum: "$productQauntity" },
        },
      },
    ]);

    const finalData = soldCategories.map(sale => {
      const returnInfo = returnedCategories.find(returned => String(returned._id) === String(sale._id)) || { totalReturned: 0 };
      return {
        categoryId: sale._id,
        categoryName: sale.categoryName,
        actualSold: sale.totalSold - returnInfo.totalReturned, 
      };
    });


    const sortedCategories = finalData.sort((a, b) => b.actualSold - a.actualSold).slice(0, 5);

    res.status(200).json({
      message: "Successfully fetched sold categories considering returns",
      data: sortedCategories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// get dashboard revenu per day


const getDailyRevenue = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const todaysOrders = await Orders.find({
      orderDate: { $gte: startOfDay, $lte: endOfDay },status: "Delivered"
    }).populate('products.productId');


    const totalRevenue = todaysOrders.reduce((sum, order) => {
      const orderRevenue = order.products.reduce((productSum, product) => {
        const revenueFromProduct = (product.price * product.quantity) * 0.1;
        return productSum + revenueFromProduct;
      }, 0);
      return sum + orderRevenue;
    }, 0);


    res.status(200).json({
      success: true,
      message: "Today's revenue calculated successfully.",
      totalRevenue: `₹${totalRevenue.toFixed(2)}`,
    });
  } catch (error) {
    console.error('Error calculating today\'s revenue:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating today\'s revenue.',
      error: error.message,
    });
  }
};

// get the user count

const getUserCount = async (req, res) => {
  try {
    const userCount = await User.countDocuments(); 
    res.status(200).json({
      success: true,
      message: "User count fetched successfully.",
      userCount,
    });
  } catch (error) {
    console.error('Error fetching user count:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user count.',
      error: error.message,
    });
  }
};


// get the todays sales count

const getSalesCount = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const todaysOrders = await Orders.find({
      orderDate: { $gte: startOfDay, $lte: endOfDay },
      status: "Delivered", 
    });
    const { totalSalesCount, totalAmount } = todaysOrders.reduce(
      (acc, order) => {
        if (order.products && Array.isArray(order.products)) {
          const orderQuantity = order.products.reduce(
            (sum, product) => sum + product.quantity,
            0
          );
          acc.totalSalesCount += orderQuantity;
        }
        acc.totalAmount += order.totalAmount;

        return acc;
      },
      { totalSalesCount: 0, totalAmount: 0 }
    );
    res.status(200).json({
      success: true,
      message: "Sales data fetched successfully.",
      totalSalesCount,
      totalAmount,
    });
  } catch (error) {
    console.error('Error fetching sales data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales data.',
      error: error.message,
    });
  }
};

// get the chart data

const getChartData = async (req, res) => {
  try {
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const endOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999);
    const revenueData = await Orders.aggregate([
      {
        $match: {
          status: "Delivered", 
          orderDate: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $unwind: "$products",
      },
      {
        $addFields: {
          "products.price": { $ifNull: ["$products.price", 0] },
          "products.quantity": { $ifNull: ["$products.quantity", 0] },
        },
      },
      {
        $group: {
          _id: { $month: "$orderDate" },
          totalRevenue: {
            $sum: {
              $multiply: ["$products.price", "$products.quantity", 0.1],
            },
          },
        },
      },
      {
        $project: {
          month: "$_id",
          totalRevenue: { $round: ["$totalRevenue", 2] },
          _id: 0,
        },
      },
      {
        $sort: { month: 1 },
      },
    ]);

    const monthlyRevenue = Array(12).fill(0);
    revenueData.forEach((item) => {
      if (item.month >= 1 && item.month <= 12) {
        monthlyRevenue[item.month - 1] = item.totalRevenue;
      }
    });


    res.status(200).json({
      success: true,
      data: monthlyRevenue,
    });
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching revenue data.",
      error: error.message,
    });
  }
};



// Rendering Dashboard page

const loadDashboard=async(req,res)=>{
  try {
    const username=req.session.username;
    const message=req.query.message;
    res.status(200).render('admin/dashboard',{message,username,title:"Dashboard"});
  } catch (error) {
    res.status(500).send('internal server error');
  }
  }





module.exports = {
  getTopSellingProduct,
  getMostSoldCategories,
  getDailyRevenue,
  getUserCount,
  getSalesCount,
  getChartData,
  loadDashboard,
}