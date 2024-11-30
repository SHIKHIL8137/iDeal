const mongoosh=require('mongoose');
require('dotenv').config()

const connectDB=async()=>{
try {
 const connect= await mongoosh.connect(process.env.MONGODB_CONNECTION_LINK);
 console.log(`MongoDB connected:${connect.connection.host}`)
} catch (error) {
  console.error(error);
  process.exit(1);
}
}
module.exports=connectDB;

 