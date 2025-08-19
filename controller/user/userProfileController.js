
const {User} = require('../../model/user/userModel')
const {Address} = require('../../model/user/addressModel')
require('dotenv').config()
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const STATUS_CODES = require('../../util/statusCode');
const RESPONSE_MESSAGES = require('../../util/responseMessage');

// rendering the route for profile

const loadProfile = async(req,res)=>{
  try {
    res.status(STATUS_CODES.OK).render('user/profileDetails',{title:"Profile"})
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('user/internalError');
  }
  }
  
// get the user details

  const getUserDetails = async(req,res)=>{
    try {
      const email = req.session.isLoggedEmail;
      const user =await User.findOne({email});
      res.status(STATUS_CODES.OK).json({user,status : true})
    } catch (error) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({status : false , message :RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR});
    }
  }



 // ajax for checking the email exist or not

const checkEmail=async(req,res)=>{
  try {
    const email= req.query.email;
    const userEmail = req.query.userEmail;
    if(!email){
      return res.status(STATUS_CODES.BAD_REQUEST).json({error:RESPONSE_MESSAGES.EMAIL_REQUIRED})
    }
    const user = await User.findOne({ email });
    const exists = user ? email !== userEmail : false;
  
  res.json({ exists }); 
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('user/internalError');
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
      return res.status(STATUS_CODES.BAD_REQUEST).send(RESPONSE_MESSAGES.NO_FIELDS_PROVIDED);
    }
    const result = await User.updateOne(
      { email: req.session.isLoggedEmail },
      { $set: updateFields },
      { upsert: true }
    );
    res.status(STATUS_CODES.OK).json({ message: RESPONSE_MESSAGES.DATA_SAVED_SUCCESSFULLY });
  } catch (error) {
    console.error('Error saving user details:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('user/internalError');
  }
};

// userProfile update password

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const email = req.session.isLoggedEmail;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'User not found' });
    }

    if (!user.password) {
      if (!newPassword) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ message: RESPONSE_MESSAGES.NEW_PASSWORD_REQUIRED });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await User.updateOne({ email }, { $set: { password: hashedPassword } });

      return res.status(STATUS_CODES.OK).json({ message: RESPONSE_MESSAGES.PASSWORD_SET_SUCCESSFULLY });
    }

    if (!currentPassword || !newPassword) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: RESPONSE_MESSAGES.BOTH_PASSWORDS_REQUIRED });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: RESPONSE_MESSAGES.CURRENT_PASSWORD_NOT_MATCH });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.updateOne({ email }, { $set: { password: hashedPassword } });

    res.status(STATUS_CODES.OK).json({ message: RESPONSE_MESSAGES.PASSWORD_UPDATED_SUCCESSFULLY });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
  }
};

//load address page

const loadAddress = async(req,res)=>{
  try {

    const errBoolean = req.query.err === 'true'?true:false;
    const message = req.query.message;
    res.status(STATUS_CODES.OK).render('user/address',{message,errBoolean,title:"Address"});
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('user/internalError');
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
      return res.status(STATUS_CODES.NOT_FOUND).send(RESPONSE_MESSAGES.ADDRESS_NOT_FOUND);
    }

    res.status(STATUS_CODES.OK).render('user/editAddress', { message, errBoolean, editedAddress,title:"Edit Address"});
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).render('user/internalError');
  }
};

// add new address


const addAddress = async(req,res)=>{
  try {
    const { fname, lname, companyName, houseName, country, state, city, zipCode, email, phone } = req.body;
    const userEmail = req.session.isLoggedEmail ;
    if (!userEmail) return res.status(STATUS_CODES.BAD_REQUEST).json({ message: 'User ID is required' });
    const user = await User.findOne({email:userEmail});
    if(user.addresses.length>=5) return res.status(STATUS_CODES.OK).json({status : false , message :RESPONSE_MESSAGES.MAX_ADDRESSES_REACHED});
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
  
    if (!user) return res.status(STATUS_CODES.NOT_FOUND).json({status :false});
    user.addresses.push(address._id);
    await user.save();
    res.status(STATUS_CODES.OK).json({status:true ,message:RESPONSE_MESSAGES.NEW_ADDRESS_ADDED_SUCCESSFULLY});
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({status : false});
  }
}

// save the updated address

const saveUpdatedAddress = async (req, res) => {
  try {
    const sessionEmail = req.session.isLoggedEmail;
    const user = await User.findOne({ email: sessionEmail });
    const addressId = req.params.addressId;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({status : false,message :RESPONSE_MESSAGES.INVALID_ADDRESS_ID});
    }

    const { fname, lname, companyName, houseName, country, state, city, zipCode, email, phone } = req.body;

    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({status : false,message :RESPONSE_MESSAGES.USER_NOT_FOUND});
    }

    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(STATUS_CODES.NOT_FOUND).json({status : false,message :RESPONSE_MESSAGES.ADDRESS_NOT_FOUND});
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
    
    res.status(STATUS_CODES.OK).json({status : true ,message:RESPONSE_MESSAGES.ADDRESS_UPDATED_SUCCESSFULLY,data :address});
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({status : true ,message :'Internal Server Error'});
  }
};

// delete the address

const deleteAddress = async (req,res)=>{
  try {
    const addressId = req.params.id;

    if (!addressId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({status:false, message: RESPONSE_MESSAGES.INVALID_ADDRESS_ID});
    }

    const deletedAddress = await Address.findByIdAndDelete(addressId);

    if (!deletedAddress) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ status:false, message: RESPONSE_MESSAGES.ADDRESS_NOT_FOUND});
    }


    await User.updateOne(
      { _id: deletedAddress.user },
      { $pull: { addresses: addressId } } 
    );

    res.status(STATUS_CODES.OK).json({ status: true , message: RESPONSE_MESSAGES.ADDRESS_DELETED_SUCCESSFULLY });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({status:false , message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR });
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