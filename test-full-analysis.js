// Test complete resume analysis flow
require('dotenv').config();
const { extractResumeText, analyzeResumeForCompany } = require('./services/resumeAnalyzer');

async function testAnalysis() {
    try {
        console.log('🚀 Testing Complete Resume Analysis Flow\n');
        
        // Your uploaded PDF
        const pdfPath = 'e:\\careercraft\\uploads\\1763489564294-Science_and_Engineering_Resume_in_White_Black_Simple_Style.pdf';
        
        console.log('Step 1: Extracting text from PDF...');
        const resumeText = await extractResumeText(pdfPath, 'application/pdf');
        console.log('✅ Text extracted successfully!');
        console.log(`Length: ${resumeText.length} characters`);
        console.log('\nFirst 500 characters:');
        console.log(resumeText.substring(0, 500));
        console.log('\n---\n');
        
        console.log('Step 2: Analyzing resume with AI...');
        const companyData = {
            name: 'Google',
            industry: 'Technology',
            features: ['Innovation', 'Scale', 'Cloud Computing', 'AI/ML'],
            jobs: [
                { title: 'Software Engineer' },
                { title: 'Machine Learning Engineer' }
            ]
        };
        
        const analysis = await analyzeResumeForCompany(resumeText, companyData);
        
        console.log('✅ Analysis complete!\n');
        console.log('📊 ANALYSIS RESULTS:');
        console.log('===================');
        console.log(`Overall Score: ${analysis.overallScore}/100`);
        console.log(`\nStrengths: ${analysis.strengths.length} found`);
        console.log(`Improvements: ${analysis.improvements.length} suggestions`);
        console.log(`Company-Specific Tips: ${analysis.companySpecific.length} items`);
        console.log(`\nSummary: ${analysis.summaryRecommendation}`);
        
        console.log('\n✅ SUCCESS! Your resume analysis feature is working perfectly!');
        console.log('\n🎉 Next steps:');
        console.log('1. Open http://localhost:3000 in your browser');
        console.log('2. Click "Upload Resume"');
        console.log('3. Select your resume PDF');
        console.log('4. Search for a company and click "Analyze Resume"');
        console.log('5. See your personalized AI-powered suggestions!');
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('Full error:', error);
    }
}

testAnalysis();
