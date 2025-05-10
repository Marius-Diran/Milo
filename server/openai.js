const express = require("express");
const { OpenAI } = require("openai");
require('dotenv').config();
const router = express.Router();

const cors = require('cors');
router.use(cors());
router.use(express.json())

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTE_AI,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:8080", // Optional. Site URL for rankings on openrouter.ai.
    "X-Title": "Milo", // Optional. Site title for rankings on openrouter.ai.
  },
});
router.post("/", async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) {
    return res.status(400).json({ error: "Please provide { message } in JSON body" });
  }
  try {
    const completion = await openai.chat.completions.create({
      model: "microsoft/phi-4-reasoning-plus:free",
      messages: [
        {
          role: "user",
          content: userMessage
        },
      ],
    });
    const aiReply = completion.choices[0].message.content;
    res.json({reply: aiReply});
  } catch (err) {
    console.error("OpenAI error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;