const express = require("express");
const { OpenAI } = require("openai");
require('dotenv').config();
const router = express.Router();

const cors = require('cors');
router.use(cors());
router.use(express.json())

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.MILO_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://milo-beryl.vercel.app/",
    "X-Title": "Milo",
  },
});

router.post("/", async (req, res) => {
  const { message, messages, systemPrompt } = req.body;
  
  // Validate input - either message OR messages array should be provided
  if (!message && !messages) {
    return res.status(400).json({ 
      error: "Please provide either { message } or { messages } array in JSON body" 
    });
  }

  try {
    let conversationMessages = [];

    // Add system prompt if provided
    if (systemPrompt) {
      conversationMessages.push({
        role: "system",
        content: systemPrompt
      });
    }

    // Handle conversation history
    if (messages && Array.isArray(messages)) {
      // Use provided conversation history
      conversationMessages = conversationMessages.concat(messages);
    } else {
      // Single message - create new conversation
      conversationMessages.push({
        role: "user",
        content: message
      });
    }

    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat-v3.1:free",
      messages: conversationMessages,
      temperature: 0.7, // Add some creativity for better conversation flow
      max_tokens: 1000, // Reasonable limit
    });

    const aiReply = completion.choices[0].message.content;
    
    // Return both the reply and updated conversation history
    const updatedMessages = [
      ...conversationMessages,
      {
        role: "assistant",
        content: aiReply
      }
    ];

    res.json({
      reply: aiReply,
      messages: updatedMessages, // Send back full conversation for next request
      tokenUsage: completion.usage // Optional: track token usage
    });

  } catch (err) {
    console.error("OpenAI error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;