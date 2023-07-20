const express = require('express');
const router = express.Router();

const Team = require('../models/team');
const Player = require('../models/player');

const playerController = require('../controllers/playerController');

router.get('/', playerController.getPlayers);
router.post('/', playerController.addPlayer);
router.get('/:steamid64', playerController.getPlayer);

router.post('/:steamid64/crosshair', playerController.addCrosshairToPlayer);

module.exports = router;
