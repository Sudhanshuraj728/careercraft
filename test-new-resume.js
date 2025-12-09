// Test the newly uploaded resume
require('dotenv').config();
const { extractResumeText, analyzeResumeForCompany } = require('./services/resumeAnalyzer');

async function testNewResume() {
    try {
        console.log('🧪 Testing New Resume Upload\n');
        
        const pdfPath = 'e:\\careercraft\\uploads\\1763491032477-Overall_Resume___NEW__28_.pdf';
        
        console.log('Step 1: Extracting text...');
        const text = await extractResumeText(pdfPath, 'application/pdf');
        
        console.log('✅ Extraction successful!');
        console.log(`Length: ${text.length} characters\n`);
        console.log('First 800 characters:');
        console.log(text.substring(0, 800));
        console.log('\n---\n');
        
        console.log('Step 2: Running AI analysis...');
        const companyData = {
            name: 'Microsoft',
            industry: 'Technology',
            features: ['Cloud Computing', 'AI', 'Enterprise Software'],
            jobs: [{ title: 'Software Engineer' }]
        };
        
        const analysis = await analyzeResumeForCompany(text, companyData);
        
        console.log('\n✅ Analysis Complete!\n');
        console.log('📊 Results:');
        console.log(`Score: ${analysis.overallScore}/100`);
        console.log(`Strengths: ${analysis.strengths.length}`);
        console.log(`Improvements: ${analysis.improvements.length}`);
        console.log('\n🎉 SUCCESS! Resume analysis is working perfectly!');
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

testNewResume();
