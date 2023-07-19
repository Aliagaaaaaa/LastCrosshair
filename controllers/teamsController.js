exports.getTeams = async (req, res) => {
    const max = req.query.max;
    try {
        if(max == null || max == undefined || max == '') {
            const teams = await Team.find().populate('players');
            res.json(teams);
        } else {
            const teams = await Team.find().populate('players').limit(parseInt(max));
            res.json(teams);
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addTeam = async (req, res) => {
    const team = new Team({
        name: req.body.name,
        twitter: req.body.twitter,
    });

    try {
        const newTeam = await team.save();
        res.status(201).json(newTeam);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getTeam = async (req, res) => {
    const name = req.params.name;

    try {
        const team = await Team.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } }).populate('players');
        res.json(team);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addPlayerToTeam = async (req, res) => {
    const name = req.params.name;
    const steamid64 = req.body.steamid64;

    try {
        var team = await Team.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } });
        var player = await Player.findOne({ steamid64: steamid64 });

        if (team == null) {
            res.status(404).json({ message: 'Cannot find team' });
            return;
        }

        if (player == null) {
            res.status(404).json({ message: 'Cannot find player' });
            return;
        }

        if (team.players.includes(player._id)) {
            res.status(400).json({ message: 'Player already in team' });
            return;
        }

        team.players.push(player._id);
        await team.save();

        res.json(team);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.removePlayerFromTeam = async (req, res) => {
    const name = req.params.name;
    const steamid64 = req.body.steamid64;

    try {
        var team = await Team.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } });
        var player = await Player.findOne({ steamid64: steamid64 });

        if (team == null) {
            res.status(404).json({ message: 'Cannot find team' });
            return;
        }

        if (player == null) {
            res.status(404).json({ message: 'Cannot find player' });
            return;
        }

        if (!team.players.includes(player._id)) {
            res.status(400).json({ message: 'Player not in team' });
            return;
        }

        team.players = team.players.filter(playerId => playerId != player._id);
        await team.save();

        res.json(team);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

