require('dotenv').config();
const mongoose = require('mongoose');
const Subscription = require('../models/Subscription');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/careercraft';

async function resetAllSubscriptions() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB successfully.');

    console.log('🔄 Resetting resumeAnalysesUsed to 0 for all subscriptions...');
    const result = await Subscription.updateMany({}, { $set: { resumeAnalysesUsed: 0 } });
    console.log(`✅ Success! Reset ${result.modifiedCount} subscriptions.`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting subscriptions:', error);
    process.exit(1);
  }
}

resetAllSubscriptions();
