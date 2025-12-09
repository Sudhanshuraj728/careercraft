// Test script to verify Groq API configuration (FREE!)
require('dotenv').config();
const Groq = require('groq-sdk');

async function testGroqConnection() {
    console.log('🧪 Testing Groq API Configuration (FREE!)...\n');
    
    // Check if API key is set
    if (!process.env.GROQ_API_KEY) {
        console.error('❌ ERROR: GROQ_API_KEY is not set in .env file');
        console.log('\n📝 Steps to fix:');
        console.log('1. Go to https://console.groq.com/keys');
        console.log('2. Sign up for FREE (no credit card required!)');
        console.log('3. Create API key');
        console.log('4. Add: GROQ_API_KEY=gsk_your-key-here to .env');
        process.exit(1);
    }
    
    if (process.env.GROQ_API_KEY === 'your-groq-api-key-here') {
        console.error('❌ ERROR: Please replace placeholder API key with your actual key');
        console.log('\n📝 Get your FREE API key from: https://console.groq.com/keys');
        process.exit(1);
    }
    
    console.log('✓ API key found in environment');
    console.log(`✓ Key starts with: ${process.env.GROQ_API_KEY.substring(0, 10)}...\n`);
    
    try {
        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });
        
        console.log('🤖 Testing API connection with Llama 3.3 70B model...\n');
        
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant."
                },
                {
                    role: "user",
                    content: "Say 'Hello! Groq API is working correctly and it's FREE!' in a friendly way."
                }
            ],
            max_tokens: 50
        });
        
        const response = completion.choices[0].message.content;
        
        console.log('✅ SUCCESS! Groq API is working correctly!\n');
        console.log('📝 Response from Llama 3.3 70B:');
        console.log(`"${response}"\n`);
        console.log('💡 Benefits of Groq:');
        console.log('   ✓ 100% FREE to use');
        console.log('   ✓ No credit card required');
        console.log('   ✓ Very fast inference');
        console.log('   ✓ High quality models\n');
        console.log('🚀 You can now use the resume analysis feature!');
        console.log('💰 Cost: $0.00 (FREE!)');
        console.log('🎉 Start the server with: npm start\n');
        
    } catch (error) {
        console.error('❌ ERROR: Failed to connect to Groq API\n');
        
        if (error.status === 401) {
            console.error('Authentication Error - Invalid API key');
            console.log('\n📝 Steps to fix:');
            console.log('1. Check if your API key is correct');
            console.log('2. Get a new FREE key from https://console.groq.com/keys');
            console.log('3. Update GROQ_API_KEY in .env file');
        } else if (error.status === 429) {
            console.error('Rate Limit Error - Too many requests');
            console.log('\n📝 Steps to fix:');
            console.log('1. Wait a moment and try again');
            console.log('2. Groq has generous free limits');
        } else {
            console.error('Error details:', error.message);
        }
        
        process.exit(1);
    }
}

// Run the test
testGroqConnection().catch(console.error);
