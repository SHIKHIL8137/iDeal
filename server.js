const express=require('express');
const app=express();
require('dotenv').config();
const path=require('path');
const userRoute=require('./route/user');
const adminRoute=require('./route/admin');
const connectDB=require('./config/connectDB');
const session=require('express-session');
const { strict } = require('assert');
const passport=require('./config/passport')



const PORT=process.env.PORT_SERVER || 4000;
const sessionSecretKey=process.env.SESSION_SECRATE_KEY
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(session({
  secret:sessionSecretKey,
  resave:false,
  saveUninitialized:true,
  cookie:{
    secure:false,
    maxAge:60000*30,
  }
}))
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
app.use(passport.initialize());
app.use(passport.session())

app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.use('/user',userRoute);
app.use('/admin',adminRoute);

connectDB();

app.listen(PORT,()=>{
  console.log(`Server started at PORT ${PORT}`)
})