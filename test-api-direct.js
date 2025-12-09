// Comprehensive test of resume upload and analysis
require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

async function testComplete() {
    console.log('🧪 Complete Resume Analysis Test\n');
    
    // Test 1: Server Health
    console.log('Step 1: Testing server health...');
    try {
        await new Promise((resolve, reject) => {
            const req = http.get('http://localhost:3000/api/health', (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        console.log('✅ Server is healthy!\n');
                        resolve();
                    } else {
                        reject(new Error(`Server returned ${res.statusCode}`));
                    }
                });
            });
            req.on('error', reject);
            req.setTimeout(5000, () => reject(new Error('Request timeout')));
        });
    } catch (error) {
        console.error('❌ Server health check failed:', error.message);
        console.log('\n⚠️  Make sure the server is running: node server.js');
        return;
    }
    
    // Test 2: Upload Resume
    console.log('Step 2: Testing resume upload...');
    const resumePath = 'e:\\careercraft\\uploads\\1763491032477-Overall_Resume___NEW__28_.pdf';
    
    if (!fs.existsSync(resumePath)) {
        console.error('❌ Resume file not found:', resumePath);
        return;
    }
    
    try {
        const form = new FormData();
        form.append('resume', fs.createReadStream(resumePath));
        
        const uploadResult = await new Promise((resolve, reject) => {
            const req = http.request({
                hostname: 'localhost',
                port: 3000,
                path: '/api/resumes/upload',
                method: 'POST',
                headers: form.getHeaders()
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        resolve(JSON.parse(data));
                    } else {
                        reject(new Error(`Upload failed: ${res.statusCode} - ${data}`));
                    }
                });
            });
            
            req.on('error', reject);
            form.pipe(req);
        });
        
        console.log('✅ Upload successful!');
        console.log('   Filename:', uploadResult.data.filename);
        console.log('   Size:', uploadResult.data.size, 'bytes\n');
        
        // Test 3: Analyze Resume
        console.log('Step 3: Testing AI analysis...');
        console.log('   (This may take 10-30 seconds)\n');
        
        const analysisData = JSON.stringify({
            filename: uploadResult.data.filename,
            companySlug: 'google'
        });
        
        const analysisResult = await new Promise((resolve, reject) => {
            const req = http.request({
                hostname: 'localhost',
                port: 3000,
                path: '/api/resumes/analyze',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(analysisData)
                }
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        resolve(JSON.parse(data));
                    } else {
                        reject(new Error(`Analysis failed: ${res.statusCode} - ${data}`));
                    }
                });
            });
            
            req.on('error', reject);
            req.setTimeout(60000, () => reject(new Error('Analysis timeout after 60s')));
            req.write(analysisData);
            req.end();
        });
        
        console.log('✅ Analysis complete!');
        console.log('\n📊 Results:');
        console.log('   Company:', analysisResult.data.company.name);
        console.log('   Overall Score:', analysisResult.data.analysis.overallScore + '/100');
        console.log('   Strengths:', analysisResult.data.analysis.strengths.length);
        console.log('   Improvements:', analysisResult.data.analysis.improvements.length);
        console.log('   ATS Score:', analysisResult.data.atsAnalysis?.atsScore + '/100');
        
        console.log('\n🎉 SUCCESS! All tests passed!');
        console.log('\n✅ Your resume analysis feature is fully working!');
        console.log('   Open http://localhost:3000 to use it in the browser.');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('Full error:', error);
    }
}

// Wait a moment for server to be ready
console.log('Waiting for server to be ready...\n');
setTimeout(() => testComplete(), 2000);
