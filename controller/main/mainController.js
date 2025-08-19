
const mongoose = require('mongoose');
const {Product} = require('../../model/admin/ProductModel');
const {Offer} = require('../../model/admin/offerModel');
const STATUS_CODES = require('../../util/statusCode');
const RESPONSE_MESSAGES = require('../../util/responseMessage');
require('dotenv').config();


const validColors = {
  pink: "#FFC0CB",
  yellow: "#FFFF00",
  green: "#008000",
  blue: "#0000FF",
  black: "#000000",
  white: "#FFFFFF",
  titanium: "#BEBEBE",
  purple: "#800080",
  midnight: "#191970",
  starlight: "#F5F5F5",
  red: "#FF0000",
  gold: "#FFD700",
  spaceGray: "#4B4B4B",
  jetBlack: "#343434",
  alpineGreen: "#355E3B",
  spaceBlue: "#1A1F71",
  cosmicSilver: "#C0C0C0",
  starlightGold :"#FFD700"
};


// rendering the home page

const loadHome = async (req, res) => {
  try {
    
    const productDetails = await Product.find()
      .populate({
        path: 'category',
        match: { status: true }, 
      });


    const filteredProducts = productDetails.filter(product => product.category);

    let recentAddProduct = await Product.find()
      .populate({
        path: 'category',
        match: { status: true }, 
      })
      .sort({ createdAt: -1 })
      .limit(10);
      recentAddProduct = recentAddProduct.filter(product => product.category);
    const categoryImages = {};
    const categories = [];

    filteredProducts.forEach((product) => {
      const categoryId = product.category._id.toString();

      if (!categoryImages[categoryId]) {
        categoryImages[categoryId] = product.images[0];

        categories.push({
          id: categoryId,
          name: product.category.name,
        });
      }
    });

    const sessionCheck = req.session.isUser || false;
    res.status(STATUS_CODES.OK).render('user/home', { 
      productDetails: filteredProducts, 
      categoryImages, 
      categories, 
      recentAddProduct ,
      sessionCheck,
      title:"Home"
    });
  } catch (error) {
    console.log(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};


//rendering the shop page

const loadShop = async (req, res) => {
  try {
   const sessionCheck = req.session.isUser || false;

    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const allProducts = await Product.find()
      .populate({
        path: 'category',
        match: { status: true },
      })
      .populate('reviews');

    const filteredProducts = allProducts.filter(product => product.category);

    for (let i = filteredProducts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filteredProducts[i], filteredProducts[j]] = [filteredProducts[j], filteredProducts[i]];
    }

    const activeCategories = [...new Set(filteredProducts.map(product => product.category.name))];

    const totalProducts = filteredProducts.length;
    const totalPages = Math.ceil(totalProducts / limit);
    const paginatedProducts = filteredProducts.slice(skip, skip + limit);

    res.status(STATUS_CODES.OK).render('user/shop', {
      productDetails: paginatedProducts,
      categories: activeCategories,
      sessionCheck,
      title: 'Shop',
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};


//get product data 

const getProductData = async(req,res)=>{
try {

    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const allProducts = await Product.find()
      .populate({
        path: 'category',
        match: { status: true },
      })
      .populate('reviews').select('-__v');

    const filteredProducts = allProducts.filter(product => product.category);

    for (let i = filteredProducts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filteredProducts[i], filteredProducts[j]] = [filteredProducts[j], filteredProducts[i]];
    }

    const activeCategories = [...new Set(filteredProducts.map(product => product.category.name))];

    const totalProducts = filteredProducts.length;
    const totalPages = Math.ceil(totalProducts / limit);
    const paginatedProducts = filteredProducts.slice(skip, skip + limit);

    res.status(STATUS_CODES.OK).json({
      products: paginatedProducts,
      categories: activeCategories,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
  }
}

// shop product searching

const productSearching = async (req, res) => {
  const searchQuery = req.query.search || ''; 

  try {
    const products = await Product.find({
      name: { $regex: searchQuery, $options: 'i' }, 
    })
      .populate({
        path: 'category',
        match: { status: true },
      })
      .populate('reviews');


    const filteredProducts = products.filter((product) => product.category !== null);

    res.json({ products: filteredProducts });
  } catch (err) {
    console.error(err);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ error: 'An error occurred while searching for products' });
  }
};


// product sorting

const sortedProduct = async (req, res) => {
  try {
    const order = req.query.order?.toLowerCase();
    const sortOrder = order === "desc" ? -1 : 1; 

    const { price, storage, connectivity, rating, condition } = req.body;

    const query = [];

    if (price) {
      query.push({
        $match: {
          price: { $lte: parseFloat(price) } 
        }
      });
    }

    if (storage && storage.length > 0) {
      query.push({
        $match: {
          storage: { $in: storage.map(Number) } 
        }
      });
    }

    if (connectivity && connectivity.length > 0) {
      query.push({
        $match: {
          connectivity: { $in: connectivity }
        }
      });
    }


    if (rating && rating.length > 0) {
      query.push({
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'productId',
          as: 'reviews'
        }
      });

      query.push({
        $addFields: {
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: "$reviews" }, 0] },
              then: { $avg: "$reviews.rating" },
              else: 0
            }
          }
        }
      });

      query.push({
        $match: {
          averageRating: { $gte: Math.min(...rating), $lte: Math.max(...rating) }
        }
      });
    }

    if (condition && condition.length > 0) {
      query.push({
        $match: {
          condition: { $in: condition }
        }
      });
    }

    query.push({
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryDetails'
      }
    });

    query.push({
      $unwind: '$categoryDetails'
    });

    query.push({
      $match: {
        'categoryDetails.status': true
      }
    });

    query.push({
      $sort: { price: sortOrder }
    });

    const products = await Product.aggregate(query);

    if (!products.length) {
      return res.status(404).json({ message: 'No products found' });
    }

    res.status(STATUS_CODES.OK).json({ products });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ error: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};


// filter for  product

const filterProduct = async (req, res) => {
  try {
    const { price, storage, connectivity, rating ,condition} = req.body;


    const query = [];


    if (price) {
      query.push({
        $match: {
          price: { $lte: parseFloat(price) } 
        }
      });
    }


    if (storage && storage.length > 0) {
      query.push({
        $match: {
          storage: { $in: storage.map(Number) } 
        }
      });
    }


    if (connectivity && connectivity.length > 0) {
      query.push({
        $match: {
          connectivity: { $in: connectivity } 
        }
      });
    }

    if (rating && rating.length > 0) {
      query.push({
        $lookup: {
          from: 'reviews',  
          localField: '_id',
          foreignField: 'productId',
          as: 'reviews' 
        }
      });

      query.push({
        $addFields: {
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: "$reviews" }, 0] },
              then: { $avg: "$reviews.rating" },
              else: 0 
            }
          }
        }
      });

      query.push({
        $match: {
          averageRating: { $gte: Math.min(...rating), $lte: Math.max(...rating) }
        }
      });
    }
    if (condition && condition.length > 0) {
      query.push({
        $match: {
          condition: { $in: condition } 
        }
      });
    }

    query.push({
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id', 
        as: 'categoryDetails' 
      }
    });
    

    query.push({
      $unwind: '$categoryDetails'
    });
    
   
    query.push({
      $match: {
        'categoryDetails.status': true
      }
    });


    const products = await Product.aggregate(query);

    res.status(STATUS_CODES.OK).json(products);
  } catch (error) {
    console.error("Error filtering products:", error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send("Internal Server Error");
  }
};


// rendering the product details page+

const loadProductDetails = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId)
      .populate({
        path: 'category',
        match: { status: true }, 
      })
      .populate({
        path: 'reviews',
        populate: {
          path: 'userId',
          select: 'username profilePicture',
        },
      });
      const relatedProducts = await Product.find({
        _id: { $ne: productId },
        price: { $lt: product.price }, 
        $or: [
          { category: product.category },  
          { category: { $ne: product.category } }  
        ]
      })
      .limit(10);
      for (let i = relatedProducts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [relatedProducts[i], relatedProducts[j]] = [relatedProducts[j], relatedProducts[i]];
      }
      
    if (!product || !product.category) { 
      return res.status(404).send('Product not found or category is unlisted');
    }
    const offerProduct = await Offer.findOne({ product: productId, isActive: true });
    const productOffer = offerProduct || null;
    const offerCategory = await Offer.findOne({category:product.category._id , isActive : true});
    const categoryOffer = offerCategory || null;
    const sessionCheck = req.session.isUser || false;
    res.status(STATUS_CODES.OK).render('user/productDetails', { product, validColors,sessionCheck ,relatedProducts,title:"Product Details",productOffer,categoryOffer});
  } catch (error) {
    console.log(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};



// rendering the category shop page 

const loadCategoryShop = async (req, res) => {
  try {
    const sessionCheck = req.session.isUser || false;
    const categoryId = req.params.id; 
    const productDetails = await Product.find({ category: categoryId })
      .populate({
        path: 'category',
        match: { status: true }, 
      })
      .populate('reviews');
    const filteredProducts = productDetails.filter(product => product.category);

    for (let i = filteredProducts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filteredProducts[i], filteredProducts[j]] = [filteredProducts[j], filteredProducts[i]];
    }


    res.status(STATUS_CODES.OK).render('user/categoryShop', { productDetails: filteredProducts ,sessionCheck,title:"Shop Category"});
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};

// search the category product


const categoryProductSearching = async (req, res) => {
  const searchQuery = req.query.search || ''; 
  const categoryId = req.query.id

  try {
    const products = await Product.find({
      category : categoryId,
      name: { $regex: searchQuery, $options: 'i' }, 
    })
      .populate({
        path: 'category',
        match: { status: true },
      })
      .populate('reviews');


    const filteredProducts = products.filter((product) => product.category !== null);

    res.json({ products: filteredProducts });
  } catch (err) {
    console.error(err);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ error: 'An error occurred while searching for products' });
  }
};

// sort the product in category route
const sortCategoryProduct = async (req, res) => {
  try {
    const categoryId = req.query.id;
    const order = req.query.order?.toLowerCase();
    const sortOrder = order === "desc" ? -1 : 1; // Determine sort order
    const { price, storage, connectivity, rating, condition } = req.body;

    if (!categoryId) {
      return res.status(400).json({ message: "Category ID is required" });
    }

    const query = [];
    query.push({
      $match: {
        category: new mongoose.Types.ObjectId(categoryId),
      },
    });

    if (price) {
      query.push({
        $match: {
          price: { $lte: parseFloat(price) },
        },
      });
    }

    if (storage && storage.length > 0) {
      query.push({
        $match: {
          storage: { $in: storage.map(Number) },
        },
      });
    }

    if (connectivity && connectivity.length > 0) {
      query.push({
        $match: {
          connectivity: { $in: connectivity },
        },
      });
    }

    if (rating && rating.length > 0) {
      query.push({
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "productId",
          as: "reviews",
        },
      });

      query.push({
        $addFields: {
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: "$reviews" }, 0] },
              then: { $avg: "$reviews.rating" },
              else: 0,
            },
          },
        },
      });

      query.push({
        $match: {
          averageRating: { $gte: Math.min(...rating), $lte: Math.max(...rating) },
        },
      });
    }

    if (condition && condition.length > 0) {
      query.push({
        $match: {
          condition: { $in: condition },
        },
      });
    }

    query.push({
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryDetails",
      },
    });

    query.push({
      $unwind: "$categoryDetails",
    });

    query.push({
      $match: {
        "categoryDetails.status": true,
      },
    });

    query.push({
      $sort: { price: sortOrder },
    });

    const products = await Product.aggregate(query);

    if (!products.length) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(STATUS_CODES.OK).json({ products });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
  }
};


// category shop filter


const categoryShopFilter = async(req,res)=>{
  try {
    const categoryId = req.query.id
    const { price, storage, connectivity, rating ,condition} = req.body;


    const query = [];
    query.push({
      $match: {
        category: new mongoose.Types.ObjectId(categoryId),
      },
    });

    if (price) {
      query.push({
        $match: {
          price: { $lte: parseFloat(price) } 
        }
      });
    }


    if (storage && storage.length > 0) {
      query.push({
        $match: {
          storage: { $in: storage.map(Number) } 
        }
      });
    }


    if (connectivity && connectivity.length > 0) {
      query.push({
        $match: {
          connectivity: { $in: connectivity } 
        }
      });
    }

    if (rating && rating.length > 0) {
      query.push({
        $lookup: {
          from: 'reviews',  
          localField: '_id',
          foreignField: 'productId',
          as: 'reviews' 
        }
      });

      query.push({
        $addFields: {
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: "$reviews" }, 0] },
              then: { $avg: "$reviews.rating" },
              else: 0 
            }
          }
        }
      });

      query.push({
        $match: {
          averageRating: { $gte: Math.min(...rating), $lte: Math.max(...rating) }
        }
      });
    }
    if (condition && condition.length > 0) {
      query.push({
        $match: {
          condition: { $in: condition } 
        }
      });
    }

    query.push({
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id', 
        as: 'categoryDetails' 
      }
    });
    

    query.push({
      $unwind: '$categoryDetails'
    });
    
   
    query.push({
      $match: {
        'categoryDetails.status': true
      }
    });


    const products = await Product.aggregate(query);

    res.status(STATUS_CODES.OK).json(products);
  } catch (error) {
    console.error("Error filtering products:", error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send("Internal Server Error");
  }
}


// load about page

const loadAbout = async(req,res)=>{
  try {
    res.status(STATUS_CODES.OK).render('user/about',{title:"About"});
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
  }
}

// load the contact page

const loadContact = async(req,res)=>{
  try {
    res.status(STATUS_CODES.OK).render('user/contact',{title:"Contact"});
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
  }
}




module.exports = {
  loadHome,
  loadShop,
  productSearching,
  sortedProduct,
  filterProduct,
  loadProductDetails,
  loadCategoryShop,
  categoryProductSearching,
  sortCategoryProduct,
  categoryShopFilter,
  loadAbout,
  loadContact,
  getProductData
}