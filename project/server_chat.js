require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();

// Critical security middleware for CORS
app.use(cors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://192.168.137.1:3000',
      'http://127.0.0.1:5500' // ✅ add this
    ],
    credentials: true
  }));
  

// Middleware for JSON parsing
app.use(express.json());

// Static file serving for frontend
app.use(express.static(path.join(__dirname)));

// Initialize OpenAI with API Key from environment variable
const openai = new OpenAI({
  apiKey: ""});

// API Endpoint for chat interactions
app.post('/api/chat', async (req, res) => {
  try {
    console.log('Career question received:', req.body.messages[0].content);

    // OpenAI chat completion call
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: req.body.messages,
      temperature: 0.7,
      max_tokens: 500
    });

    // Sending the response back to the client
    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error('Career API Error:', error);

    // Sending error response in case of failure
    res.status(500).json({ 
      error: "Our career guidance service is currently unavailable",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Serve the frontend (chat.html)
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, 'chat.html'));
});

// Set up the server to listen on port 3000
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Career Chatbot running at:`);
  console.log(`- http://localhost:${PORT}`);
  console.log(`- http://${require('ip').address()}:${PORT}`);
});
