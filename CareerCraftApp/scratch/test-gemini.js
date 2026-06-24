const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
const key = process.env.GEMINI_API_KEY;

async function testCombination(version, modelName) {
  try {
    const url = `https://generativelanguage.googleapis.com/${version}/models/${modelName}:generateContent?key=${key}`;
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: 'Say hello!' }] }]
    });
    console.log(`✅ Success [${version} / ${modelName}]:`, JSON.stringify(response.data).substring(0, 100));
    return true;
  } catch (error) {
    console.log(`❌ Failed [${version} / ${modelName}]:`, error.response ? `${error.response.status} - ${error.response.data?.error?.message?.substring(0, 120)}` : error.message);
    return false;
  }
}

async function run() {
  const versions = ['v1', 'v1beta'];
  const models = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-2.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro-latest',
    'gemini-2.0-flash-exp'
  ];

  for (const v of versions) {
    for (const m of models) {
      await testCombination(v, m);
    }
  }
}

run();
