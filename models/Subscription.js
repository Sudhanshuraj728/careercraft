const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free'
  },
  companiesViewed: {
    type: Number,
    default: 0
  },
  freeViewsLimit: {
    type: Number,
    default: 10
  },
  premiumStartDate: {
    type: Date
  },
  premiumEndDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  paymentHistory: [{
    amount: Number,
    currency: { type: String, default: 'INR' },
    transactionId: String,
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['success', 'failed', 'pending'] }
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Check if user has remaining free views
subscriptionSchema.methods.hasRemainingViews = function() {
  if (this.plan === 'premium' && this.isActive && new Date() < this.premiumEndDate) {
    return true; // Premium users have unlimited views
  }
  return this.companiesViewed < this.freeViewsLimit;
};

// Get remaining views
subscriptionSchema.methods.getRemainingViews = function() {
  if (this.plan === 'premium' && this.isActive && new Date() < this.premiumEndDate) {
    return 'Unlimited';
  }
  return Math.max(0, this.freeViewsLimit - this.companiesViewed);
};

// Increment view count
subscriptionSchema.methods.incrementViews = async function() {
  if (this.plan === 'free') {
    this.companiesViewed += 1;
    await this.save();
  }
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
