// Quick verification test
require('dotenv').config();
const { extractResumeText } = require('./services/resumeAnalyzer');

async function quickTest() {
    try {
        console.log('🔍 Quick Verification Test\n');
        
        const pdfPath = 'e:\\careercraft\\uploads\\1763489564294-Science_and_Engineering_Resume_in_White_Black_Simple_Style.pdf';
        
        console.log('Testing PDF extraction...');
        const text = await extractResumeText(pdfPath, 'application/pdf');
        
        if (text && text.length > 100) {
            console.log('\n✅ SUCCESS!');
            console.log(`Extracted ${text.length} characters`);
            console.log('\nSample text:');
            console.log(text.substring(0, 200) + '...');
            console.log('\n🎉 Your resume analysis feature is WORKING!');
            console.log('\n📝 Next: Open http://localhost:3000 and try it in the browser!');
        } else {
            console.log('❌ Error: Not enough text extracted');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

quickTest();
