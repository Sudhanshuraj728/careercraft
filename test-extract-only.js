// Quick test for the new resume with timeout
require('dotenv').config();
const { extractResumeText } = require('./services/resumeAnalyzer');

async function quickCheck() {
    try {
        console.log('Testing resume extraction only...\n');
        
        const pdfPath = 'e:\\careercraft\\uploads\\1763491032477-Overall_Resume___NEW__28_.pdf';
        const text = await extractResumeText(pdfPath, 'application/pdf');
        
        console.log('✅ SUCCESS! Resume text extracted:');
        console.log(`Length: ${text.length} characters\n`);
        console.log('Sample:');
        console.log(text.substring(0, 500));
        console.log('\n---');
        console.log('\n✅ PDF extraction is working!');
        console.log('Now test in browser: http://localhost:3000');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

quickCheck();
