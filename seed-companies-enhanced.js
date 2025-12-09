const mongoose = require('mongoose');
const Company = require('./models/Company');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/careercraft';

// Sample jobs generator
const generateJobs = (companyName, industry) => {
  const techJobs = [
    {
      title: 'Software Engineer',
      department: 'Engineering',
      location: 'Remote/Hybrid',
      type: 'Full-time',
      experience: 'Mid-Senior',
      salary: '$120k - $180k',
      description: `Join ${companyName} as a Software Engineer and work on cutting-edge technology solutions.`,
      requirements: ['3+ years experience', 'Strong programming skills', 'Bachelor\'s degree in CS or related field']
    },
    {
      title: 'Senior Data Analyst',
      department: 'Data & Analytics',
      location: 'On-site',
      type: 'Full-time',
      experience: 'Senior',
      salary: '$100k - $150k',
      description: 'Analyze data and provide insights to drive business decisions.',
      requirements: ['5+ years in data analysis', 'SQL, Python, Tableau', 'Strong analytical skills']
    },
    {
      title: 'Product Manager',
      department: 'Product',
      location: 'Hybrid',
      type: 'Full-time',
      experience: 'Mid-Senior',
      salary: '$130k - $190k',
      description: 'Lead product development and strategy for innovative solutions.',
      requirements: ['4+ years product management', 'Technical background', 'Excellent communication']
    },
    {
      title: 'Frontend Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      experience: 'Entry-Mid',
      salary: '$90k - $140k',
      description: 'Build beautiful and responsive user interfaces.',
      requirements: ['React/Vue/Angular', '2+ years experience', 'UI/UX understanding']
    },
    {
      title: 'Software Engineering Intern',
      department: 'Engineering',
      location: 'On-site',
      type: 'Internship',
      experience: 'Entry',
      salary: '$30/hour',
      description: 'Summer internship program for aspiring software engineers.',
      requirements: ['Currently pursuing CS degree', 'Basic programming knowledge', 'Eager to learn']
    }
  ];

  const financeJobs = [
    {
      title: 'Financial Analyst',
      department: 'Finance',
      location: 'On-site',
      type: 'Full-time',
      experience: 'Entry-Mid',
      salary: '$80k - $120k',
      description: 'Analyze financial data and create reports for management.',
      requirements: ['Bachelor\'s in Finance', 'Excel proficiency', 'Analytical skills']
    },
    {
      title: 'Investment Banking Analyst',
      department: 'Investment Banking',
      location: 'On-site',
      type: 'Full-time',
      experience: 'Entry',
      salary: '$100k - $150k',
      description: 'Work on M&A deals and financial modeling.',
      requirements: ['Top university degree', 'Financial modeling', 'Long hours tolerance']
    },
    {
      title: 'Risk Manager',
      department: 'Risk Management',
      location: 'Hybrid',
      type: 'Full-time',
      experience: 'Senior',
      salary: '$140k - $200k',
      description: 'Assess and mitigate financial risks.',
      requirements: ['CFA/FRM preferred', '7+ years experience', 'Risk modeling expertise']
    }
  ];

  const consultingJobs = [
    {
      title: 'Management Consultant',
      department: 'Consulting',
      location: 'Travel Required',
      type: 'Full-time',
      experience: 'Entry-Mid',
      salary: '$90k - $140k',
      description: 'Provide strategic advice to Fortune 500 clients.',
      requirements: ['Top MBA/Bachelor\'s', 'Problem-solving skills', 'Travel flexibility']
    },
    {
      title: 'Business Analyst',
      department: 'Consulting',
      location: 'Hybrid',
      type: 'Full-time',
      experience: 'Entry',
      salary: '$70k - $100k',
      description: 'Support consulting projects with data analysis and research.',
      requirements: ['Bachelor\'s degree', 'Analytical skills', 'Excel/PowerPoint']
    }
  ];

  if (industry.includes('Technology')) return techJobs.slice(0, 5);
  if (industry.includes('Finance')) return financeJobs;
  if (industry.includes('Consulting')) return consultingJobs;
  return techJobs.slice(0, 3);
};

// Enhanced companies data with features and jobs
const companies = [
  // Tech Giants
  {
    name: 'Google',
    slug: 'google',
    domain: 'google.com',
    industry: 'Technology',
    size: '100,000+',
    location: 'Mountain View, CA',
    founded: '1998',
    description: 'A global technology leader specializing in search, cloud computing, and artificial intelligence.',
    features: [
      'Competitive salary and equity packages',
      'Free meals and snacks at campus',
      'Comprehensive health benefits',
      '20% time for personal projects',
      'Professional development programs',
      'On-site gyms and wellness centers',
      'Collaborative work environment',
      'Cutting-edge technology stack'
    ],
    jobs: generateJobs('Google', 'Technology')
  },
  {
    name: 'Amazon',
    slug: 'amazon',
    domain: 'amazon.com',
    industry: 'E-commerce/Technology',
    size: '1,500,000+',
    location: 'Seattle, WA',
    founded: '1994',
    description: 'World\'s largest e-commerce and cloud computing company.',
    features: [
      'Competitive compensation',
      'Stock options (RSUs)',
      'Comprehensive medical benefits',
      'Career advancement opportunities',
      'Employee discounts',
      'Flexible work arrangements',
      'Learning and development programs',
      'Parental leave benefits'
    ],
    jobs: generateJobs('Amazon', 'Technology')
  },
  {
    name: 'Microsoft',
    slug: 'microsoft',
    domain: 'microsoft.com',
    industry: 'Technology',
    size: '200,000+',
    location: 'Redmond, WA',
    founded: '1975',
    description: 'Leading software, cloud services, and hardware company.',
    features: [
      'Competitive salary and bonuses',
      'Stock awards',
      'Comprehensive healthcare',
      'Generous vacation policy',
      'Professional development',
      'Work-life balance programs',
      'Inclusive culture',
      'Remote work options'
    ],
    jobs: generateJobs('Microsoft', 'Technology')
  },
  {
    name: 'Apple',
    slug: 'apple',
    domain: 'apple.com',
    industry: 'Technology',
    size: '150,000+',
    location: 'Cupertino, CA',
    founded: '1976',
    description: 'Innovative consumer electronics and software company.',
    features: [
      'Competitive pay and equity',
      'Employee product discounts',
      'Health and wellness benefits',
      'Education reimbursement',
      'On-site fitness centers',
      'Collaborative workspace',
      'Innovation-driven culture',
      'Professional growth opportunities'
    ],
    jobs: generateJobs('Apple', 'Technology')
  },
  {
    name: 'Meta',
    slug: 'meta',
    domain: 'meta.com',
    industry: 'Technology',
    size: '80,000+',
    location: 'Menlo Park, CA',
    founded: '2004',
    description: 'Leading social media and metaverse technology company.',
    features: [
      'Top-tier compensation',
      'RSU grants',
      'Free meals and snacks',
      'Generous PTO',
      'Health benefits',
      'Gym memberships',
      'Flexible work options',
      'Cutting-edge projects'
    ],
    jobs: generateJobs('Meta', 'Technology')
  },
  {
    name: 'Netflix',
    slug: 'netflix',
    domain: 'netflix.com',
    industry: 'Entertainment/Technology',
    size: '12,000+',
    location: 'Los Gatos, CA',
    founded: '1997',
    description: 'World\'s leading streaming entertainment service.',
    features: [
      'Industry-leading salaries',
      'Unlimited vacation policy',
      'Freedom and responsibility culture',
      'Stock options',
      'Health benefits',
      'Parental leave',
      'Content creation opportunities',
      'Innovation-focused environment'
    ],
    jobs: generateJobs('Netflix', 'Technology')
  },
  {
    name: 'Tesla',
    slug: 'tesla',
    domain: 'tesla.com',
    industry: 'Automotive/Technology',
    size: '100,000+',
    location: 'Austin, TX',
    founded: '2003',
    description: 'Electric vehicle and clean energy innovation leader.',
    features: [
      'Competitive compensation',
      'Employee vehicle purchase program',
      'Stock options',
      'Health insurance',
      'Paid time off',
      'Life insurance',
      'Mission-driven work',
      'Innovation opportunities'
    ],
    jobs: generateJobs('Tesla', 'Technology')
  },
  {
    name: 'JPMorgan Chase',
    slug: 'jpmorgan',
    domain: 'jpmorganchase.com',
    industry: 'Finance',
    size: '250,000+',
    location: 'New York, NY',
    founded: '1799',
    description: 'Leading global financial services firm.',
    features: [
      'Competitive salary and bonuses',
      'Career development programs',
      'Health and wellness benefits',
      'Retirement plans (401k)',
      'Paid time off',
      'Tuition reimbursement',
      'Diverse and inclusive culture',
      'Global opportunities'
    ],
    jobs: generateJobs('JPMorgan Chase', 'Finance')
  },
  {
    name: 'Goldman Sachs',
    slug: 'goldman-sachs',
    domain: 'goldmansachs.com',
    industry: 'Finance',
    size: '45,000+',
    location: 'New York, NY',
    founded: '1869',
    description: 'Premier investment banking and securities firm.',
    features: [
      'Top-tier compensation',
      'Performance bonuses',
      'Comprehensive benefits',
      'Professional development',
      'Mentorship programs',
      'Networking opportunities',
      'Prestige and reputation',
      'Global career paths'
    ],
    jobs: generateJobs('Goldman Sachs', 'Finance')
  },
  {
    name: 'McKinsey & Company',
    slug: 'mckinsey',
    domain: 'mckinsey.com',
    industry: 'Consulting',
    size: '35,000+',
    location: 'New York, NY',
    founded: '1926',
    description: 'World\'s leading management consulting firm.',
    features: [
      'Excellent compensation',
      'Performance-based bonuses',
      'Global travel opportunities',
      'Professional development',
      'MBA sponsorship',
      'Mentorship culture',
      'Prestigious clientele',
      'Career advancement'
    ],
    jobs: generateJobs('McKinsey & Company', 'Consulting')
  }
];

async function seedCompanies() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    console.log('Clearing existing companies...');
    await Company.deleteMany({});

    console.log('Inserting enhanced companies with features and jobs...');
    await Company.insertMany(companies);

    console.log(`✅ Successfully seeded ${companies.length} companies with features and jobs!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding companies:', error);
    process.exit(1);
  }
}

seedCompanies();
