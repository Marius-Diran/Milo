const express = require('express');
const path = require('path');
const cors = require("cors");
const axios = require('axios');
const chatRoute = require('./openai.js')
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

let initial_path = path.join(__dirname, "../app/src");
app.use(express.static(initial_path));

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile(path.join(initial_path, "../app/src/index.html"));
});

// OpenAI route
app.use('/api/openai', chatRoute);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});