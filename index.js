const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');

const demoUtils = require('./utils/demoUtils');
dotenv.config();

const app = express();

app.use(cors({ origin: "*"}));


mongoose.connect(process.env.MONGO_CONNECT_URL);

app.use("/api/teams", require("./routes/teams"));
app.use("/api/players", require("./routes/players"));

demoUtils.checkAllHubs();
setInterval(demoUtils.checkAllHubs, 1000 * 60 * 5);



app.listen(process.env.PORT, () => console.log('Server up and running and listening on port ' + process.env.PORT + '...'));



