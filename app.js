require('dotenv').config();

const express = require('express'); // import express framework
const session = require("express-session"); 
const cors = require("cors"); // This because we are connecting React (Frontend) and Express (Backend) from diff ports.
const connectDB = require('./config/db');
const CartRoutes = require('./routes/cartRoutes'); // this imports the routes
const ProductRoutes = require('./routes/productRoutes');
const CategoryRoutes = require('./routes/categoryRoutes');

//variable for express function
const app = express();

// Connect to MongoDB
connectDB()

// Express's built-in middleware

app.use((req,res,next) => {
    console.log(`Receieved ${req.method} request for ${req.url}`);
    next();
});

app.use(cors({origin: 'http://localhost:3000', credentials: true})) // This allows request from the front end. 
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application

app.use(session({ // This helps t manage the sessiosn like carts,users, login etc.
    secret: `craftly-secret`, // Note this is a random secret key for the session. 
    resave: false,
    saveUninitialized: true,
}))

app.use('/api', CartRoutes); // This shows all cart routes will have to get the prefix with /api
app.use('/api', ProductRoutes); // This shows all product routes 
app.use('/api', CategoryRoutes); // This shows all cartegories.



// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Craftly is running on port ${PORT}`);
});