require('dotenv').config();
const express = require('express');
const { OpenAI } = require('openai');
const router = express.Router();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

router.post('/', async (req, res) => {
    try {
        // Validate input
        if (!req.body.messages) {
            return res.status(400).json({ error: "Messages array required" });
        }

        // Add rate limiting check here if needed

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: req.body.messages,
            temperature: req.body.temperature || 0.7,
            max_tokens: 500
        });

        res.json({ 
            response: completion.choices[0].message.content 
        });

    } catch (error) {
        console.error("OpenAI Error:", error);
        res.status(500).json({ 
            error: "Error processing your career question",
            details: error.message 
        });
    }
});

module.exports = router;