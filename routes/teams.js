const express = require('express');
const router = express.Router();

const Team = require('../models/team');
const Player = require('../models/player');

const teamsController = require('../controllers/teamsController');

//router.get('/', teamsController.getTeams);
//router.post('/', teamsController.addTeam);
router.get('/:name', teamsController.getTeam);

//router.post('/:name/player', teamsController.addPlayerToTeam);
//router.delete('/:name/player', teamsController.removePlayerFromTeam);

module.exports = router;
