// Simple test with basic fetch to check API
require('dotenv').config();

async function testGeminiBasic() {
    const API_KEY = process.env.GEMINI_API_KEY;
    
    console.log('Testing Gemini API with basic fetch...\n');
    console.log(`API Key: ${API_KEY.substring(0, 10)}...\n`);
    
    // Try the simplest possible request
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ API Key is valid!\n');
            console.log('Available models:');
            data.models.forEach(model => {
                console.log(`- ${model.name}`);
            });
        } else {
            console.log('❌ Error:', data);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

testGeminiBasic();
