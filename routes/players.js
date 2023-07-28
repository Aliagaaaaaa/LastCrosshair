const express = require('express');
const router = express.Router();

const Team = require('../models/team');
const Player = require('../models/player');

const playerController = require('../controllers/playerController');

router.get('/', playerController.getPlayers);
router.post('/', playerController.addPlayer);
router.get('/:name', playerController.getPlayer);

router.post('/:name/crosshair', playerController.addCrosshairToPlayer);

module.exports = router;
