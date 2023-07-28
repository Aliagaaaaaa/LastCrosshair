const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');


const demoUtils = require('./utils/demoUtils');
dotenv.config();

const app = express();

app.use(cors({ origin: "*"}));
app.use(express.static(path.join(__dirname, 'build')));

mongoose.connect(process.env.MONGO_CONNECT_URL);

app.use("/api/teams", require("./routes/teams"));
app.use("/api/players", require("./routes/players"));

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

//demoUtils.checkAllHubs();
//setInterval(demoUtils.checkAllHubs, 1000 * 60 * 5);



app.listen(process.env.PORT, () => console.log('Server up and running and listening on port ' + process.env.PORT + '...'));



