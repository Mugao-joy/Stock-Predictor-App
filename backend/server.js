const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');
const path = require('path');

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// 1. Validate stock ticker
app.get('/get-stock-data', async (req, res) => {
  const { ticker } = req.query;
  if (!ticker) return res.status(400).json({ error: 'No ticker provided' });
  try {
    const response = await axios.get(
      `https://api.polygon.io/v3/reference/tickers/${ticker}?apiKey=${process.env.POLYGON_API_KEY}`
    );
    res.json(response.data);
  } catch {
    res.status(400).json({ error: 'Ticker not found or invalid' });
  }
});

// 2. Generate prediction report
app.post('/generate-report', async (req, res) => {
  const { tickers } = req.body;
  if (!tickers || tickers.length < 2) {
    return res.status(400).json({ error: 'At least 2 tickers required' });
  }

  try {
    const responses = await Promise.all(
      tickers.map(t =>
        axios.get(
          `https://api.polygon.io/v3/reference/tickers/${t}?apiKey=${process.env.POLYGON_API_KEY}`
        )
      )
    );
    const tickersData = responses.map(r => r.data.results);
    console.log('📊 Selected Ticker Data:', tickersData);

    const prompt = tickersData
      .map(d => `- ${d.name} (${d.ticker}), market: ${d.market}, locale: ${d.locale}`)
      .join('\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1',
      messages: [
        { role: 'system', content: 'You are Dodgy Dave—a hilarious, overconfident stock guru (~99.99% accurate).' },
        { role: 'user', content: `Here's info on selected stocks:\n${prompt}\n\nWrite a lighthearted prediction report.` }
      ]
    });

    const report = completion.choices[0].message.content;
    res.json({ report, tickersData });

  } catch (err) {
    console.error('❌ generate-report error:', err);
    const message = err.response?.data?.error || err.message || 'Unknown server error';
    const status = err.response?.status || 500;
    res.status(status).json({ error: message });
  }
});

//Serve front-end SPA for all other requests
app.all('/{*any}', (req, res) => {
  res.status(404).json({ error: `Path not found: ${req.originalUrl}` });
});

//Global JSON error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
