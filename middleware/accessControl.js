const Subscription = require('../models/Subscription');
const logger = require('../utils/logger');

/**
 * Retrieve or create a subscription for a user
 * Ensures every authenticated user has a subscription record
 */
async function getOrCreateSubscription(userId) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  let subscription = await Subscription.findOne({ userId });

  if (!subscription) {
    subscription = await Subscription.create({ userId });
    logger.info(`Subscription created for user: ${userId}`);
  }

  return subscription;
}

/**
 * Check if a subscription is actively premium
 * Validates: plan type, active status, and expiration date
 */
function isPremiumActive(subscription) {
  if (!subscription) {
    return false;
  }

  // Must be premium plan
  if (subscription.plan !== 'premium') {
    return false;
  }

  // Must be marked as active
  if (!subscription.isActive) {
    return false;
  }

  // Check expiration if date exists
  if (subscription.premiumEndDate) {
    const now = new Date();
    if (now >= subscription.premiumEndDate) {
      logger.info(`Premium subscription expired for user: ${subscription.userId}`);
      return false;
    }
  }

  return true;
}

/**
 * Build consistent subscription payload for all responses
 * IMPORTANT: Free users receive LIMITED information
 */
function buildSubscriptionPayload(subscription, isGuest = false) {
  const premiumActive = isPremiumActive(subscription);

  // Guest user or no subscription
  if (!subscription) {
    return {
      plan: 'free',
      analysesUsed: 0,
      analysesLimit: 10,
      remaining: 10,
      isActive: true,
      isPremium: false,
      isGuest: isGuest,
      message: 'You are using the Free plan. Upgrade to Premium for unlimited access.'
    };
  }

  // Build response based on tier
  const payload = {
    plan: premiumActive ? 'premium' : 'free',
    isActive: subscription.isActive,
    isPremium: premiumActive,
    isGuest: isGuest
  };

  // Premium gets full info + expiry
  if (premiumActive) {
    payload.remaining = 'Unlimited';
    payload.analysesUsed = subscription.resumeAnalysesUsed;
    payload.analysesLimit = subscription.freeAnalysesLimit;
    payload.premiumEndDate = subscription.premiumEndDate;
    payload.message = `Premium active until ${subscription.premiumEndDate.toLocaleDateString()}`;
  } else {
    // Free tier gets quota info only
    payload.analysesUsed = subscription.resumeAnalysesUsed;
    payload.analysesLimit = subscription.freeAnalysesLimit;
    payload.remaining = subscription.getRemainingAnalyses();
    payload.message = `${payload.remaining} free resume analyses remaining`;
  }

  return payload;
}

/**
 * Middleware: Require user to be authenticated
 */
function requireAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      requiresAuthentication: true,
      code: 'AUTH_REQUIRED'
    });
  }
  next();
}

/**
 * Middleware: Require premium subscription
 * Returns 403 if user is authenticated but not premium
 * Returns 401 if not authenticated
 */
function requirePremium(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      error: 'Please sign in to access premium features',
      requiresAuthentication: true,
      code: 'AUTH_REQUIRED'
    });
  }

  return getOrCreateSubscription(req.user._id)
    .then((subscription) => {
      const subscriptionState = buildSubscriptionPayload(subscription);

      // Server-side premium check - authoritative
      if (!isPremiumActive(subscription)) {
        logger.warn(`Free user attempted premium access: ${req.user._id}`);
        return res.status(403).json({
          success: false,
          error: 'Premium subscription required to access this feature',
          requiresSubscription: true,
          code: 'PREMIUM_REQUIRED',
          message: 'Upgrade to Premium to unlock this feature',
          subscription: subscriptionState
        });
      }

      // Premium user - attach subscription to request
      req.subscription = subscription;
      next();
    })
    .catch((error) => {
      logger.error('Premium access check failed:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to verify premium access',
        code: 'VERIFICATION_FAILED'
      });
    });
}

/**
 * Middleware: Require admin role
 * CRITICAL: Protects sensitive admin endpoints
 */
function requireAdmin(req, res, next) {
  if (!req.isAuthenticated()) {
    logger.warn('Unauthenticated admin access attempt');
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  // TODO: Add admin role check when User model has role field
  // For now, use a simple hardcoded check
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
  
  if (!adminEmails.includes(req.user.email)) {
    logger.warn(`Unauthorized admin access attempt by: ${req.user.email}`);
    return res.status(403).json({
      success: false,
      error: 'Admin access required',
      code: 'ADMIN_REQUIRED'
    });
  }

  next();
}

module.exports = {
  buildSubscriptionPayload,
  getOrCreateSubscription,
  isPremiumActive,
  requireAuth,
  requirePremium,
  requireAdmin
};