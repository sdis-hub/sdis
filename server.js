const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();

// 1. Robust CORS configuration
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());
app.use(express.json());

// 2. Health Check Route (Open this in your browser to test if Render is awake)
app.get('/', (req, res) => {
    res.send('✅ SDIS Proxy Server is Live and Running!');
});

app.post('/api/ask-ai', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required.' });

    try {
        // Changed to the stable 1.5-flash model
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`;

        console.log('📡 Calling Gemini API...');
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': process.env.GEMINI_API_KEY
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    maxOutputTokens: 800,
                    temperature: 0.7
                }
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error('❌ Gemini API Error:', data.error);
            return res.status(500).json({ error: data.error.message });
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            return res.status(500).json({ error: 'Gemini returned an empty response.' });
        }

        console.log('✅ Success! Response sent to frontend.');
        res.json({ result: text });

    } catch (err) {
        console.error('❌ Server Fetch Error:', err.message);
        res.status(500).json({ error: 'Failed to reach Gemini: ' + err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Proxy running on port ${PORT}`));
