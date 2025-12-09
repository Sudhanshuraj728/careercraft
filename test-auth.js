// Test registration
const http = require('http');

const registerData = JSON.stringify({
  name: 'Test User',
  email: 'test@example.com',
  password: 'Password123'
});

const options = {
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': registerData.length
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', JSON.stringify(res.headers, null, 2));
    console.log('Response:', data);
    
    // Test login
    if (res.statusCode === 200) {
      console.log('\n--- Testing Login ---');
      testLogin(res.headers['set-cookie']);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(registerData);
req.end();

function testLogin(cookies) {
  const loginData = JSON.stringify({
    email: 'test@example.com',
    password: 'Password123'
  });
  
  const loginOptions = {
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length,
      'Cookie': cookies ? cookies.join('; ') : ''
    }
  };
  
  const loginReq = http.request(loginOptions, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Login Status:', res.statusCode);
      console.log('Login Response:', data);
      
      // Test /api/me
      if (res.statusCode === 200) {
        console.log('\n--- Testing /api/me ---');
        testMe(res.headers['set-cookie'] || cookies);
      }
    });
  });
  
  loginReq.on('error', (e) => {
    console.error(`Problem with login: ${e.message}`);
  });
  
  loginReq.write(loginData);
  loginReq.end();
}

function testMe(cookies) {
  const meOptions = {
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/me',
    method: 'GET',
    headers: {
      'Cookie': cookies ? cookies.join('; ') : ''
    }
  };
  
  const meReq = http.request(meOptions, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('/api/me Status:', res.statusCode);
      console.log('/api/me Response:', data);
      console.log('\n✅ All auth tests completed!');
    });
  });
  
  meReq.on('error', (e) => {
    console.error(`Problem with /api/me: ${e.message}`);
  });
  
  meReq.end();
}
