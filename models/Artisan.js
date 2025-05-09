const mongoose = require('mongoose')

const ArtisanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },

    skills: {
        type: String,
        required: true
    },

    location: {
        type: String,
        required: true
    },

    bio: {
        type: String
    },

    website: {
        type: String
    },

    auth0Id: {
        type: String,
        required: true,
        unique: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Artisan', ArtisanSchema);