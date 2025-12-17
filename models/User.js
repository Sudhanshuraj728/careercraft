const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String }, // Optional for OAuth users
  googleId: { type: String, unique: true, sparse: true },
  linkedinId: { type: String, unique: true, sparse: true },
  linkedinProfile: {
    username: String,
    profileUrl: String,
    headline: String,
    summary: String,
    pictureUrl: String,
    linkedAt: Date
  },
  linkedinAccessToken: { type: String, select: false }, // Stored encrypted, not returned by default
  linkedinTokenExpiry: { type: Date, select: false },
  avatar: { type: String },
  guestId: { type: String, unique: true, sparse: true }, // For tracking guest users
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
