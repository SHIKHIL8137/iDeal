
const {Product} = require('../../model/admin/ProductModel');
const {Category} = require('../../model/admin/categoryModel');
const fs= require('fs');
const path = require('path');
const sharp=require('sharp');
const mongoose = require('mongoose');




// redering the product page

const loadProduct=async(req,res)=>{
  try {
    const username=req.session.username;
    const message=req.query.message;
    res.status(200).render('admin/product',{message,username,title:"Products"})
  } catch (error) {
    res.status(500).send('Internal server error');
  }
}


// render the product table

const loadProductDetails = async(req,res)=>{
  try {
    const products=await Product.find().populate('category');
    res.status(200).json({status : true ,products})
  } catch (error) {
    res.status(500).json({message : 'Internal server error'});
  }
}



// render the add product page

const loadAddProduct=async(req,res)=>{
  try {
    const username=req.session.username;
    let message=req.query.message
    req.query.message=null;
    const category=await Category.find();

    res.status(200).render('admin/addProduct',{message,category,username,title:"Add Product"})
    message=null
  } catch (error) {
    console.log(error)
    res.status(500).send('Internal server error');
  }
}

// render the Edit Product page

const loadEditProduct=async(req,res)=>{
  try {
    const username=req.session.username;
    const productId=req.query.productId;
    const productDetails = await Product.findById(productId).populate('category');
    const categoryDetails = await Category.find();
    res.status(200).render('admin/editProduct',{productDetails,categoryDetails,username,title:"Edit Product"});
  } catch (error) {
    res.status(500).send('Internal server error');
  }
}


// render the category page

const loadCategory=async(req,res)=>{
  try {
    const username=req.session.username;
    res.status(200).render('admin/category',{username,title:"Category"});
  } catch (error) {
    res.status(500).send('Internal server error');
  }
}


// get category details table

const getCategoryDetails = async(req,res)=>{
  try {
    const category=await Category.find();
    res.status(200).json({status:true ,category});
  } catch (error) {
    res.status(500).json({message : 'Internal server error'});
  }
}

// render the add category page

const loadAddCategory=async(req,res)=>{
  try {
    const username=req.session.username;
    const message=req.query.message;
    const err=req.query.err;
    const errBoolean = err === 'true';
    res.status(200).render('admin/addCategory',{message,errBoolean,username,title:"Add Category"});
  } catch (error) {
    res.status(500).send('Internal server error');
  }
}

// render the edit category page

const loadEditCategory=async(req,res)=>{
  try{  
    const username=req.session.username;
    const categoryId=req.params.id
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).redirect('/admin/category?message=Category not found please try again later');
    }
  res.status(200).render('admin/editCategory',{category,username,title:"Edit Category"});
  } catch (err) {
    res.status(500).send('Server error');
  }
}

// addNew product post route

const addProducts = async (req, res) => {
  try {
    const { name, description, price, discount, storage, color, quantity, category, condition, connectivity } = req.body;
    // const productExists = await Product.findOne({ name : name});
    // if (productExists) {
    //   return res.status(400).send('Product already exists');
    // }

    const images = [];

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const originalImagePath = req.files[i].path;

        const resizedImagePath = path.join(__dirname, '..', '..', 'public', 'uploads', 'product-images', req.files[i].filename);

        const targetDir = path.dirname(resizedImagePath);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        await sharp(originalImagePath)
          .resize({width:800})
          .toFile(resizedImagePath);
        images.push(`/uploads/product-images/${req.files[i].filename}`);
      }
    } 
    const discountedPrice = price - (price * discount) / 100;
    const categoryDoc = await Category.findOne({ name: category });
    const categoryId = categoryDoc._id;
    if (!categoryDoc) {
      return res.status(400).send('Invalid category');
    }
    const newProduct = new Product({
      name:name.trim(),
      description,
      price,
      Dprice: discountedPrice,
      storage,
      color,
      stock:quantity,
      category:categoryId,
      condition,
      connectivity,
      images
    });

    await newProduct.save();
    
    res.redirect('/admin/product?message=product added successfuly');
  } catch (error) {
    console.error("Error while adding product:", error);
    return res.redirect('admin/pageerror');
  }
};


// add new category route

const addCategory=async(req,res)=>{
 try {
  const categoryDetails= req.body;
  const{name ,description , status }=categoryDetails;
  const trimedName=name.trim();
  const nameExists = await Category.findOne({ 
    name: { $regex: `^${trimedName}$`, $options: 'i' } 
  });
  if(nameExists){
   return res.redirect('/admin/addCategory?message=the category exists&err=false');
  }
  const boolenValue=status==='true';
  const newCategory=new Category({
    name:trimedName,
    description,
    status:boolenValue,
  })
  await newCategory.save();
  res.redirect('/admin/category?message=Catagory added Successfully');
 } catch (error) {
  res.status(500).send('Inernal server error');
 }
}


// Delete product route

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ status: false, message: 'Product not found.' });
    }
    res.status(200).json({ status: true, message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ status: false, message: 'Server error. Unable to delete product.' });
  }
};



//update category route

const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { categoryName, description, status } = req.body; 
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId, 
      { 
        name: categoryName.trim(),
        description: description,
        status: status
      }, 
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).redirect('/admin/category?message=Category not Found');
    }

    res.status(200).redirect('/admin/category?message=Category updated successfully');
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// Delete category route

const deleteCategory=async(req,res)=>{
  try {
    const categoryId = req.params.id;
    await Product.deleteMany({ category: categoryId });
    await Category.findByIdAndDelete(categoryId); 
    res.status(200).json({ status: true, message: 'Category and its products deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: 'Server error. Unable to delete category.' });
  }
}


// Edit proudct route

const editProduct = async (req, res) => {
  try {
    const productId = req.params.id; 
    const { name, description, price, discount, storage, color, quantity, category, condition, connectivity } = req.body;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).send('Invalid Product ID');
    }


    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send('Product not found');
    }


    const categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      return res.status(400).send('Invalid category');
    }

    const categoryId = categoryDoc._id;
    

    const updates = {};


    if (name) updates.name = name;
    if (description) updates.description = description;
    if (price) updates.price = price;
    if (discount) updates.Dprice = price - (price * discount) / 100;
    if (storage) updates.storage = storage;
    if (color) updates.color = color;
    if (quantity) updates.stock = quantity;
    if (category) updates.category = categoryId;
    if (condition) updates.condition = condition;
    if (connectivity) updates.connectivity = connectivity;


    if (req.files && req.files.length > 0) {
      const images = [];
      for (let i = 0; i < req.files.length; i++) {
        const originalImagePath = req.files[i].path;
        const resizedImagePath = path.join(
          __dirname,
          '..',
          '..',
          'public',
          'uploads',
          'product-images',
          req.files[i].filename
        );

        const targetDir = path.dirname(resizedImagePath);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        await sharp(originalImagePath)
          .resize({width:800})
          .toFile(resizedImagePath);

        images.push(`/uploads/product-images/${req.files[i].filename}`);
      }

      updates.images = [...(product.images || []), ...images];
    }


    updates.updatedAt = Date.now();


    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updates },
      { new: true } 
    );

    if (!updatedProduct) {
      return res.status(500).send('Product update failed');
    }

    res.status(200).redirect(`/admin/product?message=Product edited Successfully`);
  } catch (error) {
    console.error('Error while editing product:', error);
    res.status(500).send('An error occurred while updating the product');
  }
};

// Delete Product image from the edit page of product

const deleteProductImage = async (req, res) => {
  try {
    const productId = req.params.id;
    const index = parseInt(req.params.index);

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const imageToRemove = product.images[index];
    product.images.splice(index, 1); 
    await product.save();

    // Optionally delete the file from the server
    const filePath = path.join(__dirname, '..', 'public', imageToRemove);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    console.log('deleteProductImage')
    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};






module.exports = {
  loadProduct,
  loadProductDetails,
  loadAddProduct,
  loadEditProduct,
  loadCategory,
  getCategoryDetails,
  loadAddCategory,
  loadEditCategory,
  addProducts,
  addCategory,
  deleteProduct,
 updateCategory,
 deleteCategory,
 editProduct,
 deleteProductImage,
}