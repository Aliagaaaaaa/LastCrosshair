const axios = require("axios");
const Demo = require("../models/demo");
const fs = require("fs");
const path = require("path");
const zlib = require('zlib');

const saveFolderPath = path.join(__dirname, '../demos');

    