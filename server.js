const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();

// Fix CORS properly
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

app.post('/api/ask-ai', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required.' });

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;

        console.log('📡 Calling Gemini API...');
        console.log('🔑 Key starts with:', process.env.GEMINI_API_KEY?.slice(0, 8));

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
        console.log('📦 Gemini raw response:', JSON.stringify(data, null, 2));

        if (data.error) {
            console.error('❌ Gemini error:', data.error);
            return res.status(500).json({ error: data.error.message });
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            console.error('❌ No text in response:', JSON.stringify(data));
            return res.status(500).json({ error: 'Gemini returned empty response.' });
        }

        console.log('✅ Success! Response length:', text.length);
        res.json({ result: text });

    } catch (err) {
        console.error('❌ Fetch error:', err.message);
        res.status(500).json({ error: 'Failed to reach Gemini API: ' + err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Proxy running on http://localhost:${PORT}`));
