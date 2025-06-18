// list-models.js
const { OpenAI } = require('openai');
require('dotenv').config();

async function main() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const resp = await openai.models.list();
  console.log('Models:', resp.data.map(m => m.id).slice(0, 20));
}
main();

