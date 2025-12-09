// Simple HTTP test
const http = require('http');

function testServer() {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/health',
        method: 'GET'
    };

    const req = http.request(options, (res) => {
        console.log('✅ Server is responding!');
        console.log('Status:', res.statusCode);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('Response:', data);
        });
    });

    req.on('error', (error) => {
        console.error('❌ Server connection error:', error.message);
    });

    req.end();
}

console.log('Testing server connection...');
setTimeout(() => testServer(), 1000);
