require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Company = require('../models/Company');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/careercraft';

async function checkDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('--- DATABASE STATUS ---');
    const userCount = await User.countDocuments({});
    const subCount = await Subscription.countDocuments({});
    const companyCount = await Company.countDocuments({});

    console.log(`Users: ${userCount}`);
    console.log(`Subscriptions: ${subCount}`);
    console.log(`Companies: ${companyCount}`);

    const users = await User.find({}).limit(5).select('name email');
    console.log('\n--- Recent Users ---');
    console.log(users);

    const subs = await Subscription.find({}).limit(5);
    console.log('\n--- Recent Subscriptions ---');
    console.log(subs);

    const companies = await Company.find({}).limit(5).select('name slug industry');
    console.log('\n--- Recent Companies ---');
    console.log(companies);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking database:', error);
    process.exit(1);
  }
}

checkDatabase();
