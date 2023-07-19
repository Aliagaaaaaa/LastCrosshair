const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    steamid64: {
        type: String,
        required: true,
    },
    twitter: {
        type: String,
        required: false,
    },
    hub: {
        type: String,
        required: true,
    },
    crosshairList: [{
        crosshair: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            required: true,
        }
    }]
});

module.exports = mongoose.model('Player', playerSchema);

