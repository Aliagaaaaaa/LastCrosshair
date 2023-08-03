const axios = require("axios");
const Demo = require("../models/demo");
const fs = require("fs");
const path = require("path");
const zlib = require('zlib');

const saveFolderPath = path.join(__dirname, '../demos');
const Player = require("../models/player");
const demofile = require("demofile");

async function checkAllHubs(){
    checkHub('81752520-7bad-42a7-a70d-d43fd66011de'); //fpl c sa
    checkHub('ef607668-a51a-4ea6-8b7b-dab07e0ab151'); //fpl sa
    checkHub('74caad23-077b-4ef3-8b1d-c6a2254dfa75'); //fpl eu
    checkHub('fd5780d5-dd2f-4479-906c-57b8e41ae9d7'); //fpl c eu
    checkHub('748cf78c-be73-4eb9-b131-21552f2f8b75'); //fpl na
    checkHub('b6895a52-a70c-41d6-b096-7d05377720c4'); //fpl c na
}

async function checkHub(hub){
    console.log("Checking for new demos on hub: " + hub);

    const response = await axios.get("https://open.faceit.com/data/v4/hubs/" + hub + "/matches?type=past&offset=0&limit=3", {
        headers: {
            accept: "application/json",
            Authorization: `Bearer ${process.env.FACEIT_API_KEY}`,
        },
    });

    const matches = response.data.items;

    for(var i = 0; i < matches.length; i++) {
        const match = await Demo.findOne({ name: matches[i].match_id });
        if(match == null && matches[i].status !== "CANCELLED") {
            var players = matches[i].teams.faction1.roster.concat(matches[i].teams.faction2.roster);
            for(var k = 0; k < players.length; k++) {
                const player = await Player.findOne({steamid64: players[k].game_player_id});
                if(player == null) {
                    const newPlayer = new Player({
                        name: players[k].nickname,
                        steamid64: players[k].game_player_id,
                        hub: matches[i].competition_name,
                    });
        
                    try {
                        const newxd = await newPlayer.save();
                    }
                    catch (err) {
                        console.log(err);
                    }
                } else {
                    if(player.hub != matches[i].competition_name){
                        player.hub = matches[i].competition_name;
                        try {
                            const newxd = await player.save();
                        }
                        catch (err) {
                            console.log(err);
                        }
                    }
                }
            }

            const name = matches[i].match_id;
            const url = matches[i].demo_url[0];
            const date = Date.now();
            const hub = matches[i].competition_name;

            var map = "";
            if(matches[i].voting != null && matches[i].voting.map != null && matches[i].voting.map.pick != null && matches[i].voting.map.pick[0] != null){
                map = matches[i].voting.map.pick[0];
            } else {
                map = "Unknown"
            }

            const demo = new Demo({
                name: name,
                url: url,
                date: date,
                map: map,
                hub: hub,
            });


            try {
                downloadDemo(matches[i].demo_url[0], demo);
            } catch(err) {
                console.log("Error trying to download demo: " + matches[i].demo_url[0]);
                continue;
            }
        
        }
    }
}

async function downloadDemo(demoUrl, demo) {
    try {
        const fileName = path.basename(demoUrl);
        const savePath = path.join(saveFolderPath, fileName);

        const response = await axios.get(demoUrl, { responseType: "stream" });
        const fileStream = fs.createWriteStream(savePath);
        response.data.pipe(fileStream);

        await new Promise((resolve, reject) => {
            fileStream.on("finish", resolve);
            fileStream.on("error", reject);
        });

        console.log("File downloaded successfully.");
        demo.save();

        const readStream = fs.createReadStream(savePath);
        const writeStream = fs.createWriteStream(savePath.replace('.gz', ''));

        const gunzip = zlib.createGunzip();
        readStream.pipe(gunzip).pipe(writeStream);

        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });

        console.log('File decompressed successfully.');
        fs.unlink(savePath, (err) => {
            if (err) {
                console.error(err);
            } else {
                console.log('File compressed deleted successfully.');
                getCrosshairs(savePath.replace('.gz', ''));
            }
        });
    } catch (error) {
        if (error.message.toLowerCase().includes("cloudflare")) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await downloadDemo(demoUrl, demo);
        } else {
            console.error("Error durante la descarga:", error);
        }
    }
}


async function getCrosshairs(path){
    const stream = fs.createReadStream(path);
    const demoFile = new demofile.DemoFile();

    var crosshairs = [];

    console.log("Parsing demo file...");

    await demoFile.gameEvents.on("round_end", e => {
        const players = demoFile.entities.players;
        players.forEach(player => {
            if(player.isFakePlayer){
                return;
            }

            const crosshair = crosshairs.find(crosshair => crosshair.steamid === player.steam64Id);
            if(crosshair == null){
                crosshairs.push({steamid: player.steam64Id, crosshair: player.resourceProp("m_szCrosshairCodes")});
            }
        });

      });

        demoFile.on("end", async e => {
            console.log("Finished parsing demo file.");
            for(var i = 0; i < crosshairs.length; i++){
                const player = await Player.findOne({steamid64: crosshairs[i].steamid});
                if(player == null) {
                    console.log("Player not found: " + crosshairs[i].steamid);
                    continue;
                }

                if(player.crosshairList.length > 0 && player.crosshairList[player.crosshairList.length - 1].crosshair == crosshairs[i].crosshair){
                    continue;
                }

                player.crosshairList.push({crosshair: crosshairs[i].crosshair, date: new Date()});
                try {
                    const newxd = await player.save();
                    console.log("New crosshair saved: " + player.name + " " + player.steamid64 + " " + crosshairs[i].crosshair);
                } catch (err) {
                    console.log(err);
                }
            
            }

            fs.unlink(path, (err) => {
                if (err) {
                    console.error(err)
                } else {
                    console.log('File deleted successfully.');
                }
            });
            
        });
    demoFile.parseStream(stream);
}

module.exports = {
    checkAllHubs,
    getCrosshairs,
    checkHub,
};
