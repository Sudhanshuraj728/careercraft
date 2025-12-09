const mongoose = require('mongoose');
const Company = require('./models/Company');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/careercraft';

// Popular companies data
const companies = [
  // Tech Giants
  { name: 'Google', slug: 'google', domain: 'google.com', industry: 'Technology', size: '100,000+', location: 'Mountain View, CA', description: 'Search engine and cloud computing giant' },
  { name: 'Amazon', slug: 'amazon', domain: 'amazon.com', industry: 'E-commerce/Technology', size: '1,500,000+', location: 'Seattle, WA', description: 'E-commerce and cloud computing leader' },
  { name: 'Microsoft', slug: 'microsoft', domain: 'microsoft.com', industry: 'Technology', size: '200,000+', location: 'Redmond, WA', description: 'Software and cloud services company' },
  { name: 'Apple', slug: 'apple', domain: 'apple.com', industry: 'Technology', size: '150,000+', location: 'Cupertino, CA', description: 'Consumer electronics and software' },
  { name: 'Meta', slug: 'meta', domain: 'meta.com', industry: 'Technology', size: '80,000+', location: 'Menlo Park, CA', description: 'Social media and technology' },
  { name: 'Netflix', slug: 'netflix', domain: 'netflix.com', industry: 'Entertainment/Technology', size: '12,000+', location: 'Los Gatos, CA', description: 'Streaming entertainment service' },
  { name: 'Tesla', slug: 'tesla', domain: 'tesla.com', industry: 'Automotive/Technology', size: '100,000+', location: 'Austin, TX', description: 'Electric vehicles and clean energy' },
  { name: 'Adobe', slug: 'adobe', domain: 'adobe.com', industry: 'Technology', size: '25,000+', location: 'San Jose, CA', description: 'Creative software solutions' },
  { name: 'Salesforce', slug: 'salesforce', domain: 'salesforce.com', industry: 'Technology', size: '70,000+', location: 'San Francisco, CA', description: 'CRM and cloud computing' },
  { name: 'Oracle', slug: 'oracle', domain: 'oracle.com', industry: 'Technology', size: '130,000+', location: 'Austin, TX', description: 'Database and cloud solutions' },
  
  // Tech Companies
  { name: 'IBM', slug: 'ibm', domain: 'ibm.com', industry: 'Technology', size: '280,000+', location: 'Armonk, NY', description: 'Enterprise technology and consulting' },
  { name: 'Intel', slug: 'intel', domain: 'intel.com', industry: 'Technology', size: '120,000+', location: 'Santa Clara, CA', description: 'Semiconductor chip manufacturer' },
  { name: 'NVIDIA', slug: 'nvidia', domain: 'nvidia.com', industry: 'Technology', size: '25,000+', location: 'Santa Clara, CA', description: 'Graphics processing and AI' },
  { name: 'Cisco', slug: 'cisco', domain: 'cisco.com', industry: 'Technology', size: '80,000+', location: 'San Jose, CA', description: 'Networking and cybersecurity' },
  { name: 'SAP', slug: 'sap', domain: 'sap.com', industry: 'Technology', size: '100,000+', location: 'Walldorf, Germany', description: 'Enterprise software solutions' },
  { name: 'Uber', slug: 'uber', domain: 'uber.com', industry: 'Technology', size: '30,000+', location: 'San Francisco, CA', description: 'Ride-sharing and delivery platform' },
  { name: 'Airbnb', slug: 'airbnb', domain: 'airbnb.com', industry: 'Technology', size: '6,000+', location: 'San Francisco, CA', description: 'Online marketplace for lodging' },
  { name: 'Spotify', slug: 'spotify', domain: 'spotify.com', industry: 'Technology/Entertainment', size: '9,000+', location: 'Stockholm, Sweden', description: 'Music streaming service' },
  { name: 'Twitter/X', slug: 'twitter', domain: 'twitter.com', industry: 'Technology', size: '2,000+', location: 'San Francisco, CA', description: 'Social media platform' },
  { name: 'LinkedIn', slug: 'linkedin', domain: 'linkedin.com', industry: 'Technology', size: '20,000+', location: 'Sunnyvale, CA', description: 'Professional networking platform' },
  
  // Financial Services
  { name: 'JPMorgan Chase', slug: 'jpmorgan', domain: 'jpmorganchase.com', industry: 'Finance', size: '250,000+', location: 'New York, NY', description: 'Investment banking and financial services' },
  { name: 'Goldman Sachs', slug: 'goldman-sachs', domain: 'goldmansachs.com', industry: 'Finance', size: '45,000+', location: 'New York, NY', description: 'Investment banking and securities' },
  { name: 'Morgan Stanley', slug: 'morgan-stanley', domain: 'morganstanley.com', industry: 'Finance', size: '75,000+', location: 'New York, NY', description: 'Investment banking and wealth management' },
  { name: 'Bank of America', slug: 'bank-of-america', domain: 'bankofamerica.com', industry: 'Finance', size: '200,000+', location: 'Charlotte, NC', description: 'Banking and financial services' },
  { name: 'Wells Fargo', slug: 'wells-fargo', domain: 'wellsfargo.com', industry: 'Finance', size: '230,000+', location: 'San Francisco, CA', description: 'Banking and financial services' },
  { name: 'Visa', slug: 'visa', domain: 'visa.com', industry: 'Finance', size: '25,000+', location: 'San Francisco, CA', description: 'Payment technology company' },
  { name: 'Mastercard', slug: 'mastercard', domain: 'mastercard.com', industry: 'Finance', size: '24,000+', location: 'Purchase, NY', description: 'Payment technology company' },
  { name: 'PayPal', slug: 'paypal', domain: 'paypal.com', industry: 'Finance/Technology', size: '30,000+', location: 'San Jose, CA', description: 'Digital payment platform' },
  
  // Consulting
  { name: 'McKinsey & Company', slug: 'mckinsey', domain: 'mckinsey.com', industry: 'Consulting', size: '35,000+', location: 'New York, NY', description: 'Management consulting' },
  { name: 'Boston Consulting Group', slug: 'bcg', domain: 'bcg.com', industry: 'Consulting', size: '25,000+', location: 'Boston, MA', description: 'Management consulting' },
  { name: 'Bain & Company', slug: 'bain', domain: 'bain.com', industry: 'Consulting', size: '15,000+', location: 'Boston, MA', description: 'Management consulting' },
  { name: 'Deloitte', slug: 'deloitte', domain: 'deloitte.com', industry: 'Consulting', size: '400,000+', location: 'London, UK', description: 'Professional services and consulting' },
  { name: 'PwC', slug: 'pwc', domain: 'pwc.com', industry: 'Consulting', size: '330,000+', location: 'London, UK', description: 'Professional services and auditing' },
  { name: 'EY', slug: 'ey', domain: 'ey.com', industry: 'Consulting', size: '365,000+', location: 'London, UK', description: 'Professional services and consulting' },
  { name: 'Accenture', slug: 'accenture', domain: 'accenture.com', industry: 'Consulting', size: '700,000+', location: 'Dublin, Ireland', description: 'Technology and consulting services' },
  { name: 'KPMG', slug: 'kpmg', domain: 'kpmg.com', industry: 'Consulting', size: '230,000+', location: 'Amsterdam, Netherlands', description: 'Professional services and auditing' },
  
  // Retail & Consumer
  { name: 'Walmart', slug: 'walmart', domain: 'walmart.com', industry: 'Retail', size: '2,300,000+', location: 'Bentonville, AR', description: 'Multinational retail corporation' },
  { name: 'Target', slug: 'target', domain: 'target.com', industry: 'Retail', size: '400,000+', location: 'Minneapolis, MN', description: 'General merchandise retailer' },
  { name: 'Costco', slug: 'costco', domain: 'costco.com', industry: 'Retail', size: '300,000+', location: 'Issaquah, WA', description: 'Warehouse club retailer' },
  { name: 'Nike', slug: 'nike', domain: 'nike.com', industry: 'Retail/Apparel', size: '75,000+', location: 'Beaverton, OR', description: 'Athletic footwear and apparel' },
  { name: 'Starbucks', slug: 'starbucks', domain: 'starbucks.com', industry: 'Food & Beverage', size: '400,000+', location: 'Seattle, WA', description: 'Coffeehouse chain' },
  { name: 'McDonald\'s', slug: 'mcdonalds', domain: 'mcdonalds.com', industry: 'Food & Beverage', size: '200,000+', location: 'Chicago, IL', description: 'Fast food restaurant chain' },
  { name: 'Coca-Cola', slug: 'coca-cola', domain: 'coca-cola.com', industry: 'Food & Beverage', size: '80,000+', location: 'Atlanta, GA', description: 'Beverage manufacturer' },
  { name: 'PepsiCo', slug: 'pepsico', domain: 'pepsico.com', industry: 'Food & Beverage', size: '300,000+', location: 'Purchase, NY', description: 'Food and beverage corporation' },
  
  // Healthcare & Pharma
  { name: 'Johnson & Johnson', slug: 'jnj', domain: 'jnj.com', industry: 'Healthcare', size: '150,000+', location: 'New Brunswick, NJ', description: 'Pharmaceutical and consumer health' },
  { name: 'Pfizer', slug: 'pfizer', domain: 'pfizer.com', industry: 'Healthcare', size: '80,000+', location: 'New York, NY', description: 'Pharmaceutical corporation' },
  { name: 'UnitedHealth Group', slug: 'unitedhealthgroup', domain: 'unitedhealthgroup.com', industry: 'Healthcare', size: '400,000+', location: 'Minnetonka, MN', description: 'Healthcare and insurance services' },
  { name: 'CVS Health', slug: 'cvs', domain: 'cvshealth.com', industry: 'Healthcare', size: '300,000+', location: 'Woonsocket, RI', description: 'Pharmacy and healthcare' },
  { name: 'Moderna', slug: 'moderna', domain: 'modernatx.com', industry: 'Healthcare', size: '3,000+', location: 'Cambridge, MA', description: 'Biotechnology company' },
  
  // Startups & Unicorns
  { name: 'Stripe', slug: 'stripe', domain: 'stripe.com', industry: 'Technology/Finance', size: '8,000+', location: 'San Francisco, CA', description: 'Online payment processing' },
  { name: 'Databricks', slug: 'databricks', domain: 'databricks.com', industry: 'Technology', size: '5,000+', location: 'San Francisco, CA', description: 'Data analytics platform' },
  { name: 'Snowflake', slug: 'snowflake', domain: 'snowflake.com', industry: 'Technology', size: '6,000+', location: 'Bozeman, MT', description: 'Cloud data platform' },
  { name: 'Palantir', slug: 'palantir', domain: 'palantir.com', industry: 'Technology', size: '3,000+', location: 'Denver, CO', description: 'Data analytics and software' },
  { name: 'Zoom', slug: 'zoom', domain: 'zoom.us', industry: 'Technology', size: '7,000+', location: 'San Jose, CA', description: 'Video communications platform' },
  { name: 'Slack', slug: 'slack', domain: 'slack.com', industry: 'Technology', size: '2,000+', location: 'San Francisco, CA', description: 'Business communication platform' },
  { name: 'DocuSign', slug: 'docusign', domain: 'docusign.com', industry: 'Technology', size: '7,000+', location: 'San Francisco, CA', description: 'Electronic signature technology' },
  { name: 'Shopify', slug: 'shopify', domain: 'shopify.com', industry: 'E-commerce', size: '10,000+', location: 'Ottawa, Canada', description: 'E-commerce platform' },
  { name: 'Square', slug: 'square', domain: 'squareup.com', industry: 'Technology/Finance', size: '8,000+', location: 'San Francisco, CA', description: 'Payment processing and financial services' },
  { name: 'DoorDash', slug: 'doordash', domain: 'doordash.com', industry: 'Technology', size: '8,000+', location: 'San Francisco, CA', description: 'Food delivery platform' }
];

async function seedCompanies() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing companies
    console.log('Clearing existing companies...');
    await Company.deleteMany({});

    // Insert companies
    console.log('Inserting companies...');
    await Company.insertMany(companies);

    console.log(`✅ Successfully seeded ${companies.length} companies!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding companies:', error);
    process.exit(1);
  }
}

seedCompanies();
