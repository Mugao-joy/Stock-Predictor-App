// server.js (CommonJS version)
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');
const path = require('path');

dotenv.config();

const app = express();
const port = 3000;

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')))


// Validate ticker via Polygon
app.get('/get-stock-data', async (req, res) => {
	const { ticker } = req.query;
	if (!ticker) return res.status(400).json({ error: 'No ticker provided' });

	try {
		const url = `https://api.polygon.io/v3/reference/tickers/${ticker}?apiKey=${process.env.POLYGON_API_KEY}`;
		const response = await axios.get(url);
		res.json(response.data);
	} catch (err) {
		res.status(400).json({ error: 'Ticker not found or invalid' });
	}
});

// Generate report using OpenAI
app.post('/generate-report', async (req, res) => {
	const { tickers } = req.body;

	if (!tickers || tickers.length < 2)
		return res.status(400).json({ error: 'At least 2 tickers required' });

	try {
		const tickerInfo = await Promise.all(
			tickers.map(async (ticker) => {
				try {
					const { data } = await axios.get(
						`https://api.polygon.io/v3/reference/tickers/${ticker}?apiKey=${process.env.POLYGON_API_KEY}`
					);
					return `${data.results.name} (${ticker})`;
				} catch {
					return ticker;
				}
			})
		);

		const prompt = `You are Dodgy Dave, a dodgy but hilarious stock guru. You're 15% accurate but 100% confident. Predict these: ${tickerInfo.join(', ')}`;

		const completion = await openai.chat.completions.create({
			model: 'gpt-4.1',
			messages: [{ role: 'user', content: prompt }],
		});

		const report = completion.choices[0].message.content;
		res.json({ report });
	} catch (err) {
		console.error(err);
        if (err.code === 'insufficient_quota' || err instanceof RateLimitError) {
      return res.status(429).json({
        error:
          'OpenAI quota exhausted. Please check your billing usage or wait until quota resets.',
      });
    }
		res.status(500).json({ error: 'Failed to generate report' });
	}
});

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
