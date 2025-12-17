const User = require('../models/User');
const Company = require('../models/Company');
const logger = require('../utils/logger');

async function createIndexes() {
  try {
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true }).catch(() => {});
    await User.collection.createIndex({ googleId: 1 }, { unique: true, sparse: true }).catch(() => {});
    await User.collection.createIndex({ linkedinId: 1 }, { unique: true, sparse: true }).catch(() => {});
    await User.collection.createIndex({ createdAt: -1 }).catch(() => {});
    logger.info('✓ User indexes created');
    
    // Company indexes
    await Company.collection.createIndex({ slug: 1 }, { unique: true }).catch(() => {});
    await Company.collection.createIndex({ name: 1 }).catch(() => {});
    await Company.collection.createIndex({ industry: 1 }).catch(() => {});
    // Text search - skip if already exists
    try {
      await Company.collection.createIndex({ name: 'text', description: 'text' });
    } catch (err) {
      if (err.code !== 85 && err.code !== 86) { // Ignore index exists errors
        throw err;
      }
    }
    logger.info('✓ Company indexes created');
    
    logger.info('✓ All database indexes created successfully');
  } catch (error) {
    logger.error('Failed to create indexes:', error.message);
  }
}

module.exports = { createIndexes };
