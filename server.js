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
        const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`
            },
            body: JSON.stringify({
                model: 'moonshotai/kimi-k2.6',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 1024,
                temperature: 1.00,
                top_p: 1.00,
                stream: false
            })
        });

        const data = await response.json();
        if (data.error) return res.status(500).json({ error: data.error.message });

        const text = data.choices?.[0]?.message?.content || 'No response.';
        res.json({ result: text });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to reach NVIDIA API.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Proxy server running on http://localhost:${PORT}`));
