const Player = require('../models/player');


exports.getPlayers = async (req, res) => {
    const max = req.query.max;

    try {
        if(max == null || max == undefined || max == '') {
            //order players by name
            const players = await Player.find().sort({name: 1});
            res.json(players);
        } else {
            const players = await Player.find().limit(parseInt(max));
            res.json(players);
        }
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addPlayer = async (req, res) => {
    const player = new Player({
        name: req.body.name,
        steamid64: req.body.steamid64,
        twitter: req.body.twitter,
    });

    try {
        const newPlayer = await player.save();
        res.status(201).json(newPlayer);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getPlayer = async (req, res) => {
    const steamid64 = req.params.steamid64;

    try {
        const player = await Player.findOne({ steamid64: steamid64 });
        
        const data = {
            name: player.name,
            steamid64: player.steamid64,
            hub: player.hub,
            twitter: player.twitter,
            lastCrosshair: player.crosshairList[player.crosshairList.length - 1].crosshair,
            lastCrosshairDate: player.crosshairList[player.crosshairList.length - 1].date,
        };

        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addCrosshairToPlayer = async (req, res) => {
    const steamid64 = req.params.steamid64;
    const crosshair = req.body.crosshair;
    const date = req.body.date;

    try {
        var player = await Player.findOne({ steamid64: steamid64 });

        if (player == null) {
            res.status(404).json({ message: 'Cannot find player' });
            return;
        }

        for (var i = 0; i < player.crosshairList.length; i++) {
            if (player.crosshairList[i].crosshair == crosshair) {
                res.status(400).json({ message: 'Crosshair already exists' });
                return;
            }
        }

        player.crosshairList.push({ crosshair: crosshair, date: date });
        player.save();

        res.status(201).json(player);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
