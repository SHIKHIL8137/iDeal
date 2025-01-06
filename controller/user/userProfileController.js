const { Product, Category ,Review,Coupon, Offer, Transaction ,Banner} = require('../../model/adminModel');
const {User,Address,OTP,Cart,CheckOut,Orders,WishList,Wallet,Referral,ReturnCancel,PendingOrder}=require('../../model/userModel');
require('dotenv').config()


// rendering the route for profile

const loadProfile = async(req,res)=>{
  try {
    res.status(200).render('user/profileDetails',{title:"Profile"})
  } catch (error) {
    res.status(401).send('Internal Server Error');
  }
  }
  
// get the user details

  const getUserDetails = async(req,res)=>{
    try {
      const email = req.session.isLoggedEmail;
      const user =await User.findOne({email});
      res.status(200).json({user,status : true})
    } catch (error) {
      res.status(401).json({status : false , message :'Internal Server Error'});
    }
  }



 // ajax for checking the email exist or not

const checkEmail=async(req,res)=>{
  try {
    const email= req.query.email;
    const userEmail = req.query.userEmail;
    if(!email){
      return res.status(400).json({error:'Email is required'})
    }
    const user = await User.findOne({ email });
    const exists = user ? email !== userEmail : false;
  
  res.json({ exists }); 
  } catch (error) {
    res.status(500).send("Internal server error");
  }
} 

// save the user data


const userDetailsSave = async (req, res) => {
  try {
    const { fname, lname, username, email, secondEmail, phone } = req.body;

    const updateFields = {};
    if (fname) updateFields.firstName = fname;
    if (lname) updateFields.lastName = lname;
    if (username) updateFields.username = username;
    if (email) updateFields.email = email;
    if (secondEmail) updateFields.secondEmail = secondEmail;
    if (phone) updateFields.phone = phone;

    if (req.file) {
      updateFields.profilePicture = `/uploads/re-image/${req.file.filename}`;  
    }

    updateFields.updatedAt = new Date();

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).send('No fields provided for update');
    }
    const result = await User.updateOne(
      { email: req.session.isLoggedEmail },
      { $set: updateFields },
      { upsert: true }
    );
    res.status(200).json({ message: 'Data saved successfully!' });
  } catch (error) {
    console.error('Error saving user details:', error);
    res.status(500).send('Internal Server Error');
  }
};

// userProfile update password

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const email = req.session.isLoggedEmail;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.password) {
      if (!newPassword) {
        return res.status(400).json({ message: 'New password is required' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await User.updateOne({ email }, { $set: { password: hashedPassword } });

      return res.status(200).json({ message: 'Password set successfully for the first time' });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new passwords are required' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'The current password does not match' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.updateOne({ email }, { $set: { password: hashedPassword } });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//load address page

const loadAddress = async(req,res)=>{
  try {

    const errBoolean = req.query.err === 'true'?true:false;
    const message = req.query.message;
    res.status(200).render('user/address',{message,errBoolean,title:"Address"});
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
}

//load edit address 

const loadEditAddress = async (req, res) => {
  try {
    const message = req.query.message;
    const addressId = req.params.id; 
    const errBoolean = req.query.err === "true";

    // Correct usage of findById
    const editedAddress = await Address.findById(addressId); 

    if (!editedAddress) {
      return res.status(404).send('Address not found');
    }

    res.status(200).render('user/editAddress', { message, errBoolean, editedAddress,title:"Edit Address"});
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
};

// add new address


const addAddress = async(req,res)=>{
  try {
    const { fname, lname, companyName, houseName, country, state, city, zipCode, email, phone } = req.body;
    const userEmail = req.session.isLoggedEmail ;
    if (!userEmail) return res.status(400).json({ message: 'User ID is required' });
    const user = await User.findOne({email:userEmail});
    if(user.addresses.length>=5) return res.status(200).json({status : false , message : 'You can only store up to 5 addresses'});
    const userId = user._id;
    const address = new Address({ 
      user: userId, 
      fname:fname.trim(), 
      lname:lname.trim(), 
      companyName:companyName.trim(), 
      houseName:houseName.trim(), 
      country:country.trim(), 
      state:state.trim(), 
      city:city.trim(), 
      zipCode:zipCode.trim(), 
      email:email.trim(), 
      phone :phone.trim()
    });

    await address.save();
  
    if (!user) return res.status(404).json({status :false});
    user.addresses.push(address._id);
    await user.save();
    res.status(200).json({status:true ,message:'New address added successFully'});
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({status : false});
  }
}

// save the updated address

const saveUpdatedAddress = async (req, res) => {
  try {
    const sessionEmail = req.session.isLoggedEmail;
    const user = await User.findOne({ email: sessionEmail });
    const addressId = req.params.addressId;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).send('Invalid address ID');
    }

    const { fname, lname, companyName, houseName, country, state, city, zipCode, email, phone } = req.body;

    if (!user) {
      return res.status(404).send('User not found');
    }

    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(404).send('Address not found');
    }

    address.fname = fname;
    address.lname = lname;
    address.companyName = companyName;
    address.houseName = houseName;
    address.country = country;
    address.state = state;
    address.city = city;
    address.zipCode = zipCode;
    address.email = email;
    address.phone = phone;

    await address.save();
    const addressIndex = user.addresses.findIndex(
      (addressIdObj) => addressIdObj.toString() === addressId
    );
    if (addressIndex !== -1) {
      user.addresses[addressIndex] = address._id; 
    }

    await user.save();
    
    res.status(200).redirect('/user/checkOut?message=Address updation SuccessFully&err=true');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

// delete the address

const deleteAddress = async (req,res)=>{
  try {
    const addressId = req.params.id;

    if (!addressId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({status:false, message: 'Invalid address ID' });
    }

    const deletedAddress = await Address.findByIdAndDelete(addressId);

    if (!deletedAddress) {
      return res.status(404).json({ status:false, message: 'Address not found' });
    }


    await User.updateOne(
      { _id: deletedAddress.user },
      { $pull: { addresses: addressId } } 
    );

    res.status(200).json({ status: true , message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({status:false , message: 'Internal server error' });
  }
}



module.exports = {
  loadProfile,
  getUserDetails,
  checkEmail,
  userDetailsSave,
  updatePassword,
  loadAddress,
  loadEditAddress,
  addAddress,
  saveUpdatedAddress,
  deleteAddress,
}