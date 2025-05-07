import { GoogleGenAI } from "@google/genai";

const express = require('express');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

let initial_path = path.join(__dirname, "../app/src");

const app = express();
app.use(express.static(initial_path));

const port = 3000;

app.get('/', (req, res) => {
  res.sendFile(path.join(initial_path, "../app/src/index.html"));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// API request
const ai = new GoogleGenAI({ apiKey: "YOUR_API_KEY" });

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: "Explain how AI works in a few words",
  });
  console.log(response.text);
}

await main();