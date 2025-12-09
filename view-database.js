// Quick script to view database contents
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/careercraft';

async function viewDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected to MongoDB\n');
    
    // Get all users
    const users = await User.find({}).select('-password').lean();
    
    console.log(`📊 Total Users: ${users.length}\n`);
    console.log('=' .repeat(80));
    
    if (users.length === 0) {
      console.log('No users found in database.');
    } else {
      users.forEach((user, index) => {
        console.log(`\n👤 User #${index + 1}:`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Avatar: ${user.avatar || 'None'}`);
        console.log(`   Google ID: ${user.googleId || 'Not linked'}`);
        console.log(`   LinkedIn ID: ${user.linkedinId || 'Not linked'}`);
        if (user.linkedinProfile) {
          console.log(`   LinkedIn Username: ${user.linkedinProfile.username || 'N/A'}`);
          console.log(`   LinkedIn URL: ${user.linkedinProfile.profileUrl || 'N/A'}`);
        }
        console.log(`   Created: ${user.createdAt}`);
        console.log('-'.repeat(80));
      });
    }
    
    console.log('\n✓ Database query complete');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

viewDatabase();
