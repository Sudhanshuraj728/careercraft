// Test script to verify OpenAI API configuration
require('dotenv').config();
const OpenAI = require('openai');

async function testOpenAIConnection() {
    console.log('🧪 Testing OpenAI API Configuration...\n');
    
    // Check if API key is set
    if (!process.env.OPENAI_API_KEY) {
        console.error('❌ ERROR: OPENAI_API_KEY is not set in .env file');
        console.log('\n📝 Steps to fix:');
        console.log('1. Copy .env.example to .env');
        console.log('2. Get API key from https://platform.openai.com/api-keys');
        console.log('3. Add: OPENAI_API_KEY=sk-your-key-here to .env');
        process.exit(1);
    }
    
    if (process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
        console.error('❌ ERROR: Please replace placeholder API key with your actual key');
        console.log('\n📝 Get your API key from: https://platform.openai.com/api-keys');
        process.exit(1);
    }
    
    console.log('✓ API key found in environment');
    console.log(`✓ Key starts with: ${process.env.OPENAI_API_KEY.substring(0, 10)}...\n`);
    
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        
        console.log('🤖 Testing API connection with a simple request...\n');
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant."
                },
                {
                    role: "user",
                    content: "Say 'Hello! OpenAI API is working correctly.' in a friendly way."
                }
            ],
            max_tokens: 50
        });
        
        const response = completion.choices[0].message.content;
        
        console.log('✅ SUCCESS! OpenAI API is working correctly!\n');
        console.log('📝 Response from GPT-4o-mini:');
        console.log(`"${response}"\n`);
        console.log('💡 You can now use the resume analysis feature!');
        console.log('🚀 Start the server with: npm start\n');
        
    } catch (error) {
        console.error('❌ ERROR: Failed to connect to OpenAI API\n');
        
        if (error.status === 401) {
            console.error('Authentication Error - Invalid API key');
            console.log('\n📝 Steps to fix:');
            console.log('1. Check if your API key is correct');
            console.log('2. Get a new key from https://platform.openai.com/api-keys');
            console.log('3. Update OPENAI_API_KEY in .env file');
        } else if (error.status === 429) {
            console.error('Rate Limit Error - Too many requests or no credits');
            console.log('\n📝 Steps to fix:');
            console.log('1. Check your OpenAI account balance');
            console.log('2. Add credits at https://platform.openai.com/account/billing');
            console.log('3. Wait a moment and try again');
        } else {
            console.error('Error details:', error.message);
        }
        
        process.exit(1);
    }
}

// Run the test
testOpenAIConnection().catch(console.error);
