// Test PDF extraction
const fs = require('fs');
const pdf = require('pdf-parse');

async function testPDF() {
    try {
        const filePath = 'e:\\careercraft\\uploads\\1763489564294-Science_and_Engineering_Resume_in_White_Black_Simple_Style.pdf';
        console.log('Testing PDF:', filePath);
        
        const dataBuffer = fs.readFileSync(filePath);
        console.log('File size:', dataBuffer.length, 'bytes');
        
        const data = await pdf(dataBuffer);
        console.log('\n✅ PDF Extraction Successful!');
        console.log('Text length:', data.text.length, 'characters');
        console.log('Number of pages:', data.numpages);
        console.log('\nExtracted text:');
        console.log('---START---');
        console.log(data.text);
        console.log('---END---');
        console.log('\n... (rest of text not shown)');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testPDF();
