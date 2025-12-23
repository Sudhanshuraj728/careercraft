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
  resumeAnalysesUsed: {
    type: Number,
    default: 0
  },
  freeAnalysesLimit: {
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

// Check if user has remaining free resume analyses
subscriptionSchema.methods.hasRemainingAnalyses = function() {
  if (this.plan === 'premium' && this.isActive && new Date() < this.premiumEndDate) {
    return true; // Premium users have unlimited analyses
  }
  return this.resumeAnalysesUsed < this.freeAnalysesLimit;
};

// Get remaining analyses
subscriptionSchema.methods.getRemainingAnalyses = function() {
  if (this.plan === 'premium' && this.isActive && new Date() < this.premiumEndDate) {
    return 'Unlimited';
  }
  return Math.max(0, this.freeAnalysesLimit - this.resumeAnalysesUsed);
};

// Increment resume analysis count
subscriptionSchema.methods.incrementAnalyses = async function() {
  if (this.plan === 'free') {
    this.resumeAnalysesUsed += 1;
    await this.save();
  }
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
