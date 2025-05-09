require('dotenv').config();

const express = require('express'); // import express framework
const session = require("express-session"); 
const cors = require("cors"); // This because we are connecting React (Frontend) and Express (Backend) from diff ports.
const {auth} = require('express-openid-connect'); // This helps the auth0 middleware.
const connectDB = require('./config/db');
// const {configureAuth } = require('./middleware/auth'); // This will help import the Auth0 MDW
const CartRoutes = require('./routes/cartRoutes'); // this imports the routes
const ProductRoutes = require('./routes/productRoutes');
const CategoryRoutes = require('./routes/categoryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const artisanRoutes = require('./routes/artisanRoutes')

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

// This is the session config.
app.use(session({ // This helps t manage the sessiosn like carts,users, login etc.
    secret: `craftly-secret`, // Note this is a random secret key for the session. 
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // This helps to secure cookiees in production.
        maxAge: 24 * 60 * 60 * 1000  // this is equals a day.
    }
}))

//The router attaches /login/logout and callback route  to the baseurl.
// app.use(auth(auth0Config));

// To check the auth0 status 
app.get('/', (req,res) => {
    res.send(req.oidc.isAuthenticated() ? 'logged in' : 'logged out');
});


// Implementing the Auth0 Routes

app.get('/login', (req,res) => {
    res.oidc.login({ returnTo: '/'});
});

app.get('/logout', (req,res) => {
    res.oidc.logout({returnTo: '/'})
})

// User profile endpoint
app.get('/profile', (req, res) => {
    res.json(req.oidc.user || { isAuthenticated: false });
});

// This is the API routes 
app.use('/api', CartRoutes); // This shows all cart routes will have to get the prefix with /api
app.use('/api', ProductRoutes); // This shows all product routes 
app.use('/api', CategoryRoutes); // This shows all cartegories.
app.use('/api', reviewRoutes); // This shows reviews on all projects.
app.use('/api', artisanRoutes);


// To Handle the middleware errors

app.use((err,req,res,next) => {
    console.error(err.stack);
    res.status(500).json({
        error: {
            message: err.message || 'Server Error',
            status: 500
        }
    })
})

// Start the Application server.
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Craftly is running on port ${PORT}`);
});