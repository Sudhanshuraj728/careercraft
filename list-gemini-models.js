// List available Gemini models
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    try {
        const models = await genAI.listModels();
        console.log('Available Gemini Models:\n');
        for await (const model of models) {
            console.log(`- ${model.name}`);
            console.log(`  Display Name: ${model.displayName}`);
            console.log(`  Supported Methods: ${model.supportedGenerationMethods?.join(', ')}\n`);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

listModels();
