// Simplest possible test
const http = require('http');

console.log('Testing localhost:3000...\n');

http.get('http://localhost:3000/api/health', (res) => {
    console.log('✅ Server is responding!');
    console.log('Status Code:', res.statusCode);
    
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Response:', data);
        console.log('\n✅ Server is working! Now try the browser at http://localhost:3000');
    });
}).on('error', (err) => {
    console.error('❌ Cannot connect to server');
    console.error('Error:', err.message);
    console.log('\n⚠️  Start the server with: node server.js');
});
