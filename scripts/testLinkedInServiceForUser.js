require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/careercraft';

(async () => {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const User = require('../models/User');
    const LinkedInService = require('../services/linkedinService');

    const email = 'test.linkedin+local@example.com';
    const user = await User.findOne({ email }).select('+linkedinAccessToken +linkedinTokenExpiry');
    if (!user) {
      console.error('Test user not found. Run scripts/setupTestLinkedInUser.js first.');
      process.exit(1);
    }

    console.log('Found user:', user.email);
    const token = user.linkedinAccessToken || null;
    console.log('Using token:', !!token ? token : '<none>');

    const service = new LinkedInService(token);
    const result = await service.searchCompanyEmployees('Google', 5);
    console.log('searchCompanyEmployees result:', JSON.stringify(result, null, 2));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error testing LinkedInService:', err);
    process.exit(1);
  }
})();
