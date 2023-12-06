const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authorize = require("./middleware/tokenAuth");

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors({
  origin: '*',
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const uri = process.env.ATLAS_URI;

mongoose.connect(uri);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})

const buyerRouter = require('./routes/Buyer');
const vendorRouter = require('./routes/Vendor');
const foodRouter = require('./routes/Food');
const authRouter = require('./routes/Authenticate');
const userRouter = require('./routes/User');
const orderRouter = require('./routes/Order');
app.use('/auth', authRouter);
app.use(authorize);
app.use('/vendor', vendorRouter);
app.use('/food', foodRouter);
app.use('/orders', orderRouter);
app.use('/buyer', buyerRouter);
app.use('/user', userRouter);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});


