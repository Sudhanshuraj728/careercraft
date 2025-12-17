const logger = require('../utils/logger');

// Required environment variables
const requiredEnvVars = [
  'GEMINI_API_KEY',
  'MONGO_URI',
  'SESSION_SECRET'
];

// Optional environment variables with defaults
const optionalEnvVars = {
  PORT: 3000,
  NODE_ENV: 'development',
  LOG_LEVEL: 'info',
  CLIENT_URL: 'http://localhost:3000'
};

// Validate environment variables
function validateEnv() {
  const missing = [];
  
  // Check required variables
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });
  
  if (missing.length > 0) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    logger.error('Please check your .env file and ensure all required variables are set.');
    process.exit(1);
  }
  
  // Set defaults for optional variables
  Object.entries(optionalEnvVars).forEach(([key, defaultValue]) => {
    if (!process.env[key]) {
      process.env[key] = defaultValue.toString();
      logger.warn(`${key} not set, using default: ${defaultValue}`);
    }
  });
  
  // Validate specific formats
  if (process.env.MONGO_URI && !process.env.MONGO_URI.startsWith('mongodb')) {
    logger.error('Invalid MONGO_URI format. Must start with "mongodb://" or "mongodb+srv://"');
    process.exit(1);
  }
  
  if (process.env.PORT && isNaN(parseInt(process.env.PORT))) {
    logger.error('Invalid PORT. Must be a number.');
    process.exit(1);
  }
  
  // Check OAuth credentials (optional but warn if missing)
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    logger.warn('Google OAuth credentials not configured. Google sign-in will not work.');
  }
  
  if (!process.env.LINKEDIN_CLIENT_ID || !process.env.LINKEDIN_CLIENT_SECRET) {
    logger.warn('LinkedIn OAuth credentials not configured. LinkedIn sign-in will not work.');
  }
  
  logger.info('✓ Environment variables validated successfully');
}

module.exports = { validateEnv };
