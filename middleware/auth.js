// The Auth middleware file.

const {auth} = require('express-openid-connect');
require('dotenv').config();

// The Auth0 config middleware , this handles the authentication using the Auth0. @returns{fuctions}

const configureAuth = () => {
    // for the configure object

    const config = {
        authRequired: false,  // this allows the public route
        authLogout: true,   // This helps enable the logout feature implemented in the Auth0.
        secret: process.env.AUTH0_SECRET, //  Help keep the session secret intact.
        baseURL: process.env.BASE_URL || 'http://localhost:8000', // this is the base URL of the craftly backend.
        clientID: process.env.AUTH0_CLIENT_ID, // this is the Auth0 client ID from the AUTH0 login.
        issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL, // Auth0 domain link.
        clientSecret: process.env.AUTH0_CLIENT_SECRET, // auth0 client secret
        authorizationParams: {
            response_type: 'code',
            scope: 'openid profile email'
        },
        routes: {
            login: '/login',
            logout: '/logout',
            callback: '/callback'
        }
    };
    return auth(config);
};


// The Auth0 config middleware , this handles the authentication to check if user is authenticated @params {object} for req and rex and {Function} for next

const requireAuth = (req, res, next) => {
    if (!req.oidc.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  };


  // Middleware to check roles  for each user. @params{string} for role and @returns{function} for mdw 

  const checkRole = (role) => {
    return (req, res, next) => {
      // This is to certain user is authenticated first.
      if (!req.oidc.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // To Check for roles in the user metadata
      const userRoles = req.oidc.user?.['https://craftly.com/roles'] || [];
      
      if (Array.isArray(userRoles) && userRoles.includes(role)) {
        return next();
      }
      
      return res.status(403).json({ message: 'Insufficient permissions' });
    };
  };
  
  module.exports = {
    configureAuth,
    requireAuth,
    checkRole
  };