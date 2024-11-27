const mongoosh=require('mongoose')

const connectDB=async()=>{
try {
 const connect= await mongoosh.connect('mongodb://localhost:27017/iDeal');
 console.log(`MongoDB connected:${connect.connection.host}`)
} catch (error) {
  console.error(error);
  process.exit(1);
}
}
module.exports=connectDB;

 