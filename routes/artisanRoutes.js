const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get('/', async (req, res) => {
    try{
        const artisans = await Artisan.find().select('-password');
        res.json(artisans);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/:id', async (req, res) => {
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
});

router.post('/', [
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
            website
        });

        await artisan.save();

        const token = artisan.generateAuthToken();

        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
});

router.put('/:id', auth, async (req, res) => {
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

        if (artisan._id.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not Authorized'});
        }

        artisan = await Artisan.findByIdAndUpdate(
            req,params.id,
            { $set: artisanFields },
            { new: true }
        ).select('-password');
        res.json(artisan);
        res.json(artisan);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const artisan = await Artisan.findById(req.params.id);

        if (!artisan) {
            return res.status(404).json({msg: 'Artisan Not Found'});
        }

        if (artisan._id.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not Authorized'})
        }
        await artisan.remove();
        res.json({ msg: 'Artisan removed'});
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Artisan not Found'});
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;