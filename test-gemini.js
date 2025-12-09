// Test script to verify Google Gemini API configuration (FREE!)
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiConnection() {
    console.log('🧪 Testing Google Gemini API Configuration (FREE!)...\n');
    
    // Check if API key is set
    if (!process.env.GEMINI_API_KEY) {
        console.error('❌ ERROR: GEMINI_API_KEY is not set in .env file');
        console.log('\n📝 Steps to fix:');
        console.log('1. Go to https://aistudio.google.com/app/apikey');
        console.log('2. Sign in with Google account');
        console.log('3. Click "Create API Key"');
        console.log('4. Add: GEMINI_API_KEY=your-key-here to .env');
        process.exit(1);
    }
    
    if (process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
        console.error('❌ ERROR: Please replace placeholder API key with your actual key');
        console.log('\n📝 Get your FREE API key from: https://aistudio.google.com/app/apikey');
        process.exit(1);
    }
    
    console.log('✓ API key found in environment');
    console.log(`✓ Key starts with: ${process.env.GEMINI_API_KEY.substring(0, 10)}...\n`);
    
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        console.log('🤖 Testing API connection with Gemini 2.5 Flash...\n');
        
        const result = await model.generateContent([
            "Say 'Hello! Google Gemini API is working correctly and it's FREE!' in a friendly way."
        ]);
        
        const response = await result.response;
        const text = response.text();
        
        console.log('✅ SUCCESS! Google Gemini API is working correctly!\n');
        console.log('📝 Response from Gemini Pro:');
        console.log(`"${text}"\n`);
        console.log('💡 Benefits of Google Gemini:');
        console.log('   ✓ 100% FREE with generous limits');
        console.log('   ✓ No credit card required');
        console.log('   ✓ Fast and reliable');
        console.log('   ✓ High quality Google AI');
        console.log('   ✓ 1500 requests/day FREE\n');
        console.log('🚀 You can now use the resume analysis feature!');
        console.log('💰 Cost: $0.00 (FREE!)');
        console.log('🎉 Start the server with: npm start\n');
        
    } catch (error) {
        console.error('❌ ERROR: Failed to connect to Google Gemini API\n');
        
        if (error.message.includes('API_KEY_INVALID')) {
            console.error('Authentication Error - Invalid API key');
            console.log('\n📝 Steps to fix:');
            console.log('1. Check if your API key is correct');
            console.log('2. Get a new FREE key from https://aistudio.google.com/app/apikey');
            console.log('3. Update GEMINI_API_KEY in .env file');
        } else if (error.message.includes('quota')) {
            console.error('Rate Limit Error - Daily quota exceeded');
            console.log('\n📝 Steps to fix:');
            console.log('1. Wait until tomorrow (quota resets daily)');
            console.log('2. Free tier: 1500 requests per day');
        } else {
            console.error('Error details:', error.message);
        }
        
        process.exit(1);
    }
}

// Run the test
testGeminiConnection().catch(console.error);
