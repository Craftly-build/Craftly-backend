const express = require('express');
const router = express.Router();
const Portfolio = require('../models/Portfolio')
const Artisan = require('../models/Artisan')
const {requireAuth, checkRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/async');
// const {check, validationResult } = require('express-validator');


//Get API for Portfolios. This gets all the portfolios.However, its a public route with options for pagination.

router.get('/portfolios', asyncHandler(async(req,res) => {
    try {
        const {page = 1, limit = 10} = req.query;
        const total = await Portfolio.countDocuments();
        const portfolios = await Portfolio.find()
        .populate('artisan', 'name skills location')
        .skip((page - 1) * limit)
        .limit(Number(limit));

        res.json({total, page: Number(page), limit: Number(limit), portfolios});
    } catch (error) {
        res.status(500).json({message: 'Error while fetching the portfolios', error})
    }
}));


// Get API for portfolio of a single Artisan by ID

router.get('/portfolios/:id', asyncHandler(async (req, res) => {
    try {
        const portfolio = await Portfolio.findById(req.params.id).populate('artisan', 'name skills location');
        if (!portfolio) return res.status(404).json({message: 'Portfolio not found'});
        res.json(portfolio);
         } catch (error) {
            res.status(500).json({message: 'Error while fetching the portfolios', error})
         }
}))


// Post API for portfolios to be created for the Artisans. This is a protected route only for the artisan.

router.post('/portfolios', requireAuth, asyncHandler(async (req,res) => {
    try {
        const auth0Id = req.auth?
    }
}))


