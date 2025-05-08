const express = require('express');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

let initial_path = path.join(__dirname, "../app/src");

const app = express();
app.use(express.static(initial_path));

const port = process.env.port || 3000;

app.get('/', (req, res) => {
  res.sendFile(path.join(initial_path, "../app/src/index.html"));
});

// Gemini route
app.use('/api/gemini', require("./gemini"));

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});