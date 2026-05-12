const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/ask-ai', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required.' });

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        maxOutputTokens: 800,
                        temperature: 0.7
                    }
                })
            }
        );

        const data = await response.json();
        if (data.error) return res.status(500).json({ error: data.error.message });

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';
        res.json({ result: text });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to reach Gemini API.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Proxy running on http://localhost:${PORT}`));
