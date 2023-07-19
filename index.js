const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const demoUtils = require('./utils/demoUtils');


dotenv.config();

const app = express();


mongoose.connect(process.env.MONGO_CONNECT_URL);

app.use("/api/teams", require("./routes/teams"));

demoUtils.checkAllHubs();
setInterval(demoUtils.checkAllHubs, 1000 * 60 * 5);




app.listen(process.env.PORT, () => console.log('Server up and running and listening on port ' + process.env.PORT + '...'));



