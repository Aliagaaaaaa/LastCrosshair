const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
    }],
    twitter: {
        type: String,
        required: false,
    },
    region: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('Team', teamSchema);
