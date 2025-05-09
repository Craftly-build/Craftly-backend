const express = require('express');
const router = express.Router();
const {check , validationResult} = require('express-validator');
const Artisan = require('../models/Artisan');
const Product = require('../models/Product');
const {requireAuth, checkRole} = require('../middleware/auth');
const asyncHandler = require('../middleware/async');
const {auth} = require('express-openid-connect');


//GET all Artisan routes: This is a public routes that all users can access.

router.get('/', asyncHandler(async (req, res) => {
    try{
        const artisans = await Artisan.find().select('-password');
        res.json(artisans);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}));

//GET ArtisanRoutes by ID:

router.get('/:id', asyncHandler(async (req, res) => {
    try {
      const artisan = await Artisan.findById(req.params.id).select('-password');
      
      if (!artisan){
        return res.status(404).json({ msg: 'Artisan not Found'});
      }
      res.json(artisan);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'OjectId') {
            return res.status(404).json({ msg: 'Artisan not found'});
        }
        res.status(500).send('Server Error');
    }
}));


// To Create New Artisan Profile: This route is protected , so it requires authentication

router.post('/', [
    requireAuth,
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6}),
    check('skills', 'Skills are required').not().isEmpty(),
    check('location', 'location is required').not().isEmpty()
],
async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: error.array()});
    }

    const { name, email, password, skills, location, bio, website } = req.body;


    // This is to check if Auth0 user ID is present.
    const auth0Id = req.auth?.sub;
    if (!auth0Id) {
        return res.status(401).json({message:'Authentication is required'});
    }
    try {

        let artisan = await Artisan.findOne({ email});
        if (artisan) {
            return res.status(400).json({errors: [{msg: 'Artisan already exists'}]});     
        }
        artisan = new Artisan ({
            name,
            email,
            password,
            skills,
            location,
            bio,
            website,
            auth0Id // this helps store the Auth0 user ID
        });

        await artisan.save();

        const token = artisan.generateAuthToken(); // The Auth0 generates the token.

        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
});

// To update the Artisan Profile: This route is protected , so it requires authentication

router.put('/:id', requireAuth, asyncHandler(async (req, res) => {
    const {name,skills, location,bio,website} = req.body;

    const artisanFields = {};
    if (name) artisanFields.name = name;
    if (skills) artisanFields.skills = skills;
    if (location) artisanFields.location = location;
    if (bio) artisanFields.bio = bio;
    if (website) artisanFields.website = website;

    try { 
        let artisan = await Artisan.findById(req.params.id);

        if (!artisan) {
            return res.status(404).json({msg: 'Artisan not Found'});
        }

        // This helps to check if user is updating its profile or the admin is doing it.
        const auth0Id = req.auth?.sub;
        if (artisan.auth0Id !==auth0Id && !req.auth?.permission?.includes('update:any_artisan')) {
            return res.status(401).json({ msg: 'Not Authorized'});
        }

       const updatedArtisan = await Artisan.findByIdAndUpdate(
            req.params.id,
            { $set: artisanFields },
            { new: true }
        ).select('-password');
        res.json(updatedArtisan);
        res.json(updatedArtisan);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}));

// To Delete Artisan profile: This route is protected and so requires Authentication.

router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
    try {
        const artisan = await Artisan.findById(req.params.id);

        if (!artisan) {
            return res.status(404).json({msg: 'Artisan Not Found'});
        }

               // This helps to check if user is deleting its profile or the admin is doing it.
               const auth0Id = req.auth?.sub;
               if (artisan.auth0Id !==auth0Id && !req.auth?.permission?.includes('delete:any_artisan')) {
                   return res.status(401).json({ msg: 'Not Authorized'});
               }

        if (artisan._id.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not Authorized'})
        }
        await Artisan.deleteOne({_id:req.params.id});
        res.json({ msg: 'Artisan removed'});

       // Then catch the error  
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Artisan not Found'});
        }
        res.status(500).send('Server Error');
    }
}));



// This is Route for artisans to list their products/goods/services or anything they can offer.

router.post('/:id/products', requireAuth, [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('price', 'Price is required and must be a number').isNumeric(),
    check('category', 'Category is required').not().isEmpty()
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const artisan = await Artisan.findById(req.params.id);
    if (!artisan) {
        return res.status(404).json({ msg: 'Artisan not found' });
    }

    // Verify the authenticated user is the artisan
    const auth0Id = req.auth?.sub;
    if (artisan.auth0Id !== auth0Id) {
        return res.status(401).json({ msg: 'Not authorized to add products for this artisan' });
    }

    const { title, description, price, category, images, inventory } = req.body;
    
    const newProduct = new Product({
        artisan: req.params.id,
        title,
        description,
        price,
        category,
        images: images || [],
        inventory: inventory || 0
    });

    const product = await newProduct.save();
    res.status(201).json(product);
}));

// Get all products by an artisan
router.get('/:id/products', asyncHandler(async (req, res) => {
    const products = await Product.find({ artisan: req.params.id });
    res.json(products);
}));








module.exports = router;