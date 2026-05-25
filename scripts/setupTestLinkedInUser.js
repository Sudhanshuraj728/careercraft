require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/careercraft';

(async () => {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const User = require('../models/User');

    const email = 'test.linkedin+local@example.com';
    const password = 'Test1234!';

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: 'Local Test User',
        email,
        password,
      });
      console.log('Created test user:', email);
    } else {
      console.log('Test user already exists:', email);
    }

    // Link a fake LinkedIn token
    user.linkedinId = 'test-linkedin-id';
    user.linkedinAccessToken = 'test-local-token-12345';
    user.linkedinTokenExpiry = new Date(Date.now() + 30 * 24 * 3600 * 1000); // 30 days
    user.linkedinProfile = { username: 'localtest', headline: 'Test User' };

    await user.save();
    console.log('Updated user with LinkedIn token');

    await mongoose.disconnect();
    console.log('Done');
  } catch (err) {
    console.error('Error setting up test user:', err);
    process.exit(1);
  }
})();
