const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: String,
  department: String,
  location: String,
  type: String, // Full-time, Part-time, Contract, Internship
  experience: String, // Entry, Mid, Senior
  salary: String,
  description: String,
  requirements: [String],
  postedDate: { type: Date, default: Date.now }
});

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  domain: { type: String },
  logo: { type: String },
  industry: { type: String },
  description: { type: String },
  size: { type: String },
  location: { type: String },
  founded: { type: String },
  features: [String], // Company highlights/benefits
  jobs: [jobSchema], // Available job positions
  createdAt: { type: Date, default: Date.now }
});

// Create text index for search
companySchema.index({ name: 'text', industry: 'text' });
companySchema.index({ name: 1 });

module.exports = mongoose.model('Company', companySchema);
