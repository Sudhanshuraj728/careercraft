require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('./config/passport');
const User = require('./models/User');
const Company = require('./models/Company');
const Subscription = require('./models/Subscription');
const resumeAnalyzer = require('./services/resumeAnalyzer');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/careercraft';

// Increase server timeout for AI analysis (60 seconds)
app.use((req, res, next) => {
  req.setTimeout(60000);
  res.setTimeout(60000);
  next();
});

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Multer setup for file uploads (stores in uploads/)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const safeName = Date.now() + '-' + file.originalname.replace(/[^a-z0-9.\-\_]/gi, '_');
    cb(null, safeName);
  }
});
const upload = multer({ storage });

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-secret-in-production',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGO_URI }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from project root (index.html, style.css, index.js)
app.use(express.static(path.join(__dirname)));

// --- Auth Helper Middleware ---
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
}

// --- Auth Routes ---
// POST /api/auth/register - Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    
    // Validation
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'All fields are required',
        fields: { name: !name, email: !email, password: !password }
      });
    }
    
    const isValidEmail = (e) => typeof e === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);
    const isValidPassword = (p) => typeof p === 'string' && p.length >= 8;
    
    if (!isValidEmail(email)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid email format' 
      });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({ 
        success: false,
        error: 'Password must be at least 8 characters' 
      });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ 
        success: false,
        error: 'Email already registered' 
      });
    }
    
    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password
    });
    
    // Log user in automatically
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ 
          success: false,
          error: 'Registration successful but login failed' 
        });
      }
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar
        }
      });
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Registration failed. Please try again.' 
    });
  }
});

// POST /api/auth/login - Login user
app.post('/api/auth/login', (req, res, next) => {
  const { email, password } = req.body || {};
  
  if (!email || !password) {
    return res.status(400).json({ 
      success: false,
      error: 'Email and password are required' 
    });
  }
  
  const isValidEmail = (e) => typeof e === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);
  if (!isValidEmail(email)) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid email format' 
    });
  }
  
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ 
        success: false,
        error: 'Login failed. Please try again.' 
      });
    }
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: info?.message || 'Invalid credentials' 
      });
    }
    
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ 
          success: false,
          error: 'Login failed. Please try again.' 
        });
      }
      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar
        }
      });
    });
  })(req, res, next);
});

// POST /api/auth/logout - Logout user
app.post('/api/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ 
        success: false,
        error: 'Logout failed' 
      });
    }
    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  });
});

// GET /api/auth/user - Get current authenticated user
app.get('/api/auth/user', isAuthenticated, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar
    }
  });
});

// Google OAuth routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect to home or dashboard
    res.redirect('/?login=success');
  }
);

// LinkedIn OAuth routes
app.get('/auth/linkedin', (req, res) => {
  // Check if LinkedIn credentials are configured
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  
  if (!clientId || !clientSecret || clientId === 'your-linkedin-client-id-here' || clientSecret === 'your-linkedin-client-secret-here') {
    console.error('LinkedIn OAuth not configured. Please add credentials to .env file.');
    return res.redirect('/?error=linkedin_not_configured');
  }
  
  // Allow LinkedIn OAuth even if not logged in (will create/link account)
  const redirectUri = encodeURIComponent(process.env.LINKEDIN_CALLBACK_URL);
  // Use r_liteprofile and r_emailaddress for standard LinkedIn Sign In
  const scope = encodeURIComponent('r_liteprofile r_emailaddress');
  
  // Store if user was already logged in
  req.session.linkedinFlow = {
    isExistingUser: req.isAuthenticated(),
    userId: req.user?._id
  };
  
  const linkedinAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${req.sessionID}`;
  
  res.redirect(linkedinAuthUrl);
});

app.get('/auth/linkedin/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;
    
    if (error) {
      console.error('LinkedIn OAuth error:', error);
      return res.redirect('/?error=linkedin_denied');
    }
    
    if (!code) {
      return res.redirect('/?error=linkedin_failed');
    }
    
    // Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        redirect_uri: process.env.LINKEDIN_CALLBACK_URL
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      console.error('Failed to get LinkedIn access token:', tokenData);
      return res.redirect('/?error=linkedin_failed');
    }
    
    // Get user profile from LinkedIn (v2 API)
    const [profileResponse, emailResponse] = await Promise.all([
      fetch('https://api.linkedin.com/v2/me', {
        headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
      }),
      fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
        headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
      })
    ]);
    
    const profileData = await profileResponse.json();
    const emailData = await emailResponse.json();
    
    console.log('LinkedIn profile data:', profileData);
    console.log('LinkedIn email data:', emailData);
    
    // Extract email from the response
    const email = emailData?.elements?.[0]?.['handle~']?.emailAddress;
    
    if (!email) {
      return res.redirect('/?error=linkedin_no_email');
    }
    
    // Extract name from profile
    const firstName = profileData.localizedFirstName || '';
    const lastName = profileData.localizedLastName || '';
    const fullName = `${firstName} ${lastName}`.trim() || email.split('@')[0];
    const linkedinId = profileData.id;
    
    const linkedinFlow = req.session.linkedinFlow || {};
    
    // Check if user was already logged in
    if (linkedinFlow.isExistingUser && linkedinFlow.userId) {
      // Link LinkedIn to existing account
      await User.findByIdAndUpdate(linkedinFlow.userId, {
        linkedinId: linkedinId,
        linkedinProfile: {
          username: firstName || fullName,
          profileUrl: `https://www.linkedin.com/in/${firstName.toLowerCase() || 'profile'}`,
          headline: fullName,
          summary: '',
          pictureUrl: '',
          linkedAt: new Date()
        }
      });
      
      delete req.session.linkedinFlow;
      return res.redirect('/?linkedin=linked');
    }
    
    // Check if user exists with this email or LinkedIn ID
    let user = await User.findOne({
      $or: [
        { email: email },
        { linkedinId: linkedinId }
      ]
    });
    
    if (user) {
      // Update existing user with LinkedIn info
      user.linkedinId = linkedinId;
      user.linkedinProfile = {
        username: firstName || fullName,
        profileUrl: `https://www.linkedin.com/in/${firstName.toLowerCase() || 'profile'}`,
        headline: fullName,
        summary: '',
        pictureUrl: '',
        linkedAt: new Date()
      };
      await user.save();
    } else {
      // Create new user with LinkedIn
      user = await User.create({
        name: fullName,
        email: email,
        linkedinId: linkedinId,
        avatar: '',
        linkedinProfile: {
          username: firstName || fullName,
          profileUrl: `https://www.linkedin.com/in/${firstName.toLowerCase() || 'profile'}`,
          headline: fullName,
          summary: '',
          pictureUrl: '',
          linkedAt: new Date()
        }
      });
    }
    
    // Log the user in
    req.login(user, (err) => {
      if (err) {
        console.error('Login error:', err);
        return res.redirect('/?error=login_failed');
      }
      
      delete req.session.linkedinFlow;
      res.redirect('/?linkedin=success');
    });
    
  } catch (error) {
    console.error('LinkedIn callback error:', error);
    res.redirect('/?error=linkedin_error');
  }
});

// Unlink LinkedIn
app.post('/api/auth/unlink-linkedin', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    
    await User.findByIdAndUpdate(req.user._id, {
      $unset: { linkedinId: '', linkedinProfile: '' }
    });
    
    res.json({ success: true, message: 'LinkedIn unlinked successfully' });
  } catch (error) {
    console.error('Unlink LinkedIn error:', error);
    res.status(500).json({ success: false, error: 'Failed to unlink LinkedIn' });
  }
});


// GET /api/health - Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// --- Admin Endpoints ---
// GET /api/admin/users - Get all users for admin dashboard
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

// GET /api/admin/companies - Get all companies for admin dashboard
app.get('/api/admin/companies', async (req, res) => {
  try {
    const companies = await Company.find({})
      .select('name slug industry location size logo')
      .sort({ name: 1 })
      .lean();
    
    res.json({
      success: true,
      companies: companies
    });
  } catch (error) {
    console.error('Admin companies error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch companies' });
  }
});

// --- Companies Endpoints ---

// GET /api/companies - Get all companies with pagination
app.get('/api/companies', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const industry = req.query.industry;
    
    // Build filter
    const filter = {};
    if (industry) {
      filter.industry = { $regex: industry, $options: 'i' };
    }
    
    const [companies, total] = await Promise.all([
      Company.find(filter)
        .select('name slug industry location size logo')
        .skip(skip)
        .limit(limit)
        .lean(),
      Company.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: companies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Companies fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch companies' 
    });
  }
});

// GET /api/companies/search - Search companies with autocomplete
app.get('/api/companies/search', async (req, res) => {
  try {
    const query = req.query.q?.trim() || '';
    const limit = parseInt(req.query.limit) || 10;
    
    if (!query || query.length < 1) {
      return res.json({ 
        success: true,
        data: [],
        query: query
      });
    }
    
    // Search companies by name (case insensitive, partial match)
    const companies = await Company.find({
      name: { $regex: query, $options: 'i' }
    })
    .limit(limit)
    .select('name slug industry location logo')
    .lean();
    
    res.json({ 
      success: true,
      data: companies,
      query: query,
      count: companies.length
    });
  } catch (error) {
    console.error('Company search error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Search failed. Please try again.' 
    });
  }
});

// GET /api/companies/:slug - Get company details by slug (with subscription check)
app.get('/api/companies/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    if (!slug) {
      return res.status(400).json({ 
        success: false,
        error: 'Company slug is required' 
      });
    }
    
    // Get or create subscription for user/guest
    let subscription;
    let userId = null;
    
    if (req.isAuthenticated()) {
      userId = req.user._id;
    } else {
      // For guest users, use session-based tracking
      if (!req.session.guestId) {
        req.session.guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      // Find or create guest user
      let guestUser = await User.findOne({ guestId: req.session.guestId });
      if (!guestUser) {
        guestUser = await User.create({
          name: 'Guest User',
          email: `${req.session.guestId}@guest.careercraft.com`,
          guestId: req.session.guestId
        });
      }
      userId = guestUser._id;
    }
    
    // Get or create subscription
    subscription = await Subscription.findOne({ userId });
    if (!subscription) {
      subscription = await Subscription.create({ userId });
    }
    
    // Check if user has remaining views
    if (!subscription.hasRemainingViews()) {
      return res.status(403).json({
        success: false,
        error: 'View limit reached',
        requiresSubscription: true,
        message: 'You have used all your free views. Upgrade to Premium for unlimited access!',
        subscription: {
          plan: subscription.plan,
          viewsUsed: subscription.companiesViewed,
          viewsLimit: subscription.freeViewsLimit,
          remaining: 0
        }
      });
    }
    
    const company = await Company.findOne({ slug }).lean();
    
    if (!company) {
      return res.status(404).json({ 
        success: false,
        error: 'Company not found' 
      });
    }
    
    // Increment view count
    await subscription.incrementViews();
    
    res.json({ 
      success: true,
      data: company,
      subscription: {
        plan: subscription.plan,
        viewsUsed: subscription.companiesViewed,
        viewsLimit: subscription.freeViewsLimit,
        remaining: subscription.getRemainingViews()
      }
    });
  } catch (error) {
    console.error('Company fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch company details' 
    });
  }
});

// GET /api/companies/:slug/jobs - Get jobs for a specific company
app.get('/api/companies/:slug/jobs', async (req, res) => {
  try {
    const { slug } = req.params;
    const company = await Company.findOne({ slug }).select('name jobs').lean();
    
    if (!company) {
      return res.status(404).json({ 
        success: false,
        error: 'Company not found' 
      });
    }
    
    res.json({ 
      success: true,
      data: {
        company: company.name,
        jobs: company.jobs || [],
        count: company.jobs?.length || 0
      }
    });
  } catch (error) {
    console.error('Jobs fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch jobs' 
    });
  }
});

// --- Templates Endpoints ---

// GET /api/templates - Get all resume templates
app.get('/api/templates', (req, res) => {
  const role = req.query.role;
  
  const templates = [
    { id: 'data-pro', title: 'Data Pro Template', role: 'Data Analyst', tags: ['Excel','SQL','Python'] },
    { id: 'analytics-expert', title: 'Analytics Expert', role: 'Data Analyst', tags: ['Tableau','R','Statistics'] },
    { id: 'dev-portfolio', title: 'Dev Portfolio', role: 'Software Developer', tags: ['JavaScript','React','Node.js'] },
    { id: 'marketing-maven', title: 'Marketing Maven', role: 'Marketing', tags: ['SEO','Analytics','Content'] },
    { id: 'design-studio', title: 'Design Studio', role: 'Designer', tags: ['Figma','Adobe XD','UI/UX'] },
    { id: 'bi-specialist', title: 'BI Specialist', role: 'Data Analyst', tags: ['Power BI','DAX','ETL'] }
  ];
  
  // Filter by role if provided
  const filteredTemplates = role 
    ? templates.filter(t => t.role.toLowerCase().includes(role.toLowerCase()))
    : templates;
  
  res.json({ 
    success: true,
    data: filteredTemplates,
    count: filteredTemplates.length
  });
});

// GET /api/templates/:id - Get specific template details
app.get('/api/templates/:id', (req, res) => {
  const templates = {
    'data-pro': { id: 'data-pro', title: 'Data Pro Template', role: 'Data Analyst', tags: ['Excel','SQL','Python'] },
    'analytics-expert': { id: 'analytics-expert', title: 'Analytics Expert', role: 'Data Analyst', tags: ['Tableau','R','Statistics'] },
    'dev-portfolio': { id: 'dev-portfolio', title: 'Dev Portfolio', role: 'Software Developer', tags: ['JavaScript','React','Node.js'] },
    'marketing-maven': { id: 'marketing-maven', title: 'Marketing Maven', role: 'Marketing', tags: ['SEO','Analytics','Content'] },
    'design-studio': { id: 'design-studio', title: 'Design Studio', role: 'Designer', tags: ['Figma','Adobe XD','UI/UX'] },
    'bi-specialist': { id: 'bi-specialist', title: 'BI Specialist', role: 'Data Analyst', tags: ['Power BI','DAX','ETL'] }
  };
  
  const template = templates[req.params.id];
  
  if (!template) {
    return res.status(404).json({ 
      success: false,
      error: 'Template not found' 
    });
  }
  
  res.json({ 
    success: true,
    data: template
  });
});

// GET /api/templates/:id/download - Download template
app.get('/api/templates/:id/download', (req, res) => {
  const { id } = req.params;
  
  const templates = ['data-pro', 'analytics-expert', 'dev-portfolio', 'marketing-maven', 'design-studio', 'bi-specialist'];
  
  if (!templates.includes(id)) {
    return res.status(404).json({ 
      success: false,
      error: 'Template not found' 
    });
  }
  
  const content = `CareerCraft Template: ${id}\n\nThis is a sample downloadable template.\nIn production, this would be a real DOCX or PDF file.`;
  res.setHeader('Content-Disposition', `attachment; filename="${id}-template.txt"`);
  res.setHeader('Content-Type', 'text/plain');
  res.send(content);
});

// --- Subscription Endpoints ---

// GET /api/subscription/status - Get user's subscription status
app.get('/api/subscription/status', async (req, res) => {
  try {
    let userId = null;
    
    if (req.isAuthenticated()) {
      userId = req.user._id;
    } else {
      // Guest user tracking
      if (!req.session.guestId) {
        return res.json({
          success: true,
          data: {
            plan: 'free',
            viewsUsed: 0,
            viewsLimit: 10,
            remaining: 10,
            isGuest: true
          }
        });
      }
      
      const guestUser = await User.findOne({ guestId: req.session.guestId });
      if (!guestUser) {
        return res.json({
          success: true,
          data: {
            plan: 'free',
            viewsUsed: 0,
            viewsLimit: 10,
            remaining: 10,
            isGuest: true
          }
        });
      }
      userId = guestUser._id;
    }
    
    let subscription = await Subscription.findOne({ userId });
    if (!subscription) {
      subscription = await Subscription.create({ userId });
    }
    
    res.json({
      success: true,
      data: {
        plan: subscription.plan,
        viewsUsed: subscription.companiesViewed,
        viewsLimit: subscription.freeViewsLimit,
        remaining: subscription.getRemainingViews(),
        isActive: subscription.isActive,
        isPremium: subscription.plan === 'premium',
        premiumEndDate: subscription.premiumEndDate,
        isGuest: !req.isAuthenticated()
      }
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscription status'
    });
  }
});

// POST /api/subscription/upgrade - Upgrade to premium
app.post('/api/subscription/upgrade', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        error: 'Please sign in to upgrade to premium'
      });
    }
    
    const { paymentId, transactionId } = req.body;
    
    let subscription = await Subscription.findOne({ userId: req.user._id });
    if (!subscription) {
      subscription = await Subscription.create({ userId: req.user._id });
    }
    
    // Update to premium (30 days)
    subscription.plan = 'premium';
    subscription.premiumStartDate = new Date();
    subscription.premiumEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    subscription.isActive = true;
    
    // Add payment record
    subscription.paymentHistory.push({
      amount: 149,
      currency: 'INR',
      transactionId: transactionId || `TXN_${Date.now()}`,
      status: 'success'
    });
    
    await subscription.save();
    
    res.json({
      success: true,
      message: 'Successfully upgraded to Premium!',
      data: {
        plan: subscription.plan,
        premiumEndDate: subscription.premiumEndDate,
        remaining: 'Unlimited'
      }
    });
  } catch (error) {
    console.error('Upgrade error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upgrade subscription'
    });
  }
});

// GET /api/subscription/pricing - Get pricing information
app.get('/api/subscription/pricing', (req, res) => {
  res.json({
    success: true,
    data: {
      free: {
        name: 'Free Plan',
        price: 0,
        currency: 'INR',
        features: [
          '10 company views',
          'Basic company information',
          'Job listings access',
          'Resume templates',
          'Limited features'
        ]
      },
      premium: {
        name: 'Premium Plan',
        price: 149,
        currency: 'INR',
        period: 'month',
        features: [
          'Unlimited company views',
          'Full company details',
          'Unlimited job applications',
          'All resume templates',
          'Priority support',
          'No advertisements',
          'Advanced filters',
          'Save favorite companies'
        ]
      }
    }
  });
});

// --- Upload Endpoints ---

// POST /api/resumes/upload - Upload resume file
app.post('/api/resumes/upload', upload.single('resume'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        success: false,
        error: 'Invalid file type. Only PDF and DOC files are allowed.' 
      });
    }
    
    res.json({ 
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: req.file.path
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false,
      error: 'File upload failed' 
    });
  }
});

// POST /api/resumes/analyze - Analyze resume for specific company
app.post('/api/resumes/analyze', async (req, res) => {
  try {
    const { filename, companySlug } = req.body;
    
    if (!filename) {
      return res.status(400).json({
        success: false,
        error: 'Resume filename is required'
      });
    }
    
    if (!companySlug) {
      return res.status(400).json({
        success: false,
        error: 'Company information is required'
      });
    }
    
    // Get file path
    const filePath = path.join(__dirname, 'uploads', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Resume file not found'
      });
    }
    
    // Get company data
    const company = await Company.findOne({ slug: companySlug });
    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }
    
    console.log('Starting resume analysis...');
    console.log('File:', filename);
    console.log('Company:', companySlug);
    
    // Extract resume text
    let resumeText;
    try {
      resumeText = await resumeAnalyzer.extractResumeText(
        filePath,
        filename.endsWith('.pdf') ? 'application/pdf' : 'text/plain'
      );
      console.log('Text extracted successfully, length:', resumeText.length);
    } catch (extractError) {
      console.error('Text extraction failed:', extractError.message);
      return res.status(400).json({
        success: false,
        error: 'Failed to extract text from resume. Please ensure: 1) File is a valid PDF, 2) PDF contains actual text (not just images), 3) File is not corrupted. Error: ' + extractError.message
      });
    }
    
    // Analyze with AI
    console.log('Analyzing with Gemini AI...');
    const analysis = await resumeAnalyzer.analyzeResumeForCompany(resumeText, {
      name: company.name,
      industry: company.industry,
      features: company.features,
      jobs: company.jobs
    });
    
    // Get ATS suggestions
    console.log('Getting ATS suggestions...');
    const atsAnalysis = await resumeAnalyzer.generateATSSuggestions(resumeText);
    
    console.log('Analysis completed successfully!');
    
    res.json({
      success: true,
      message: 'Resume analyzed successfully',
      data: {
        company: {
          name: company.name,
          industry: company.industry
        },
        analysis,
        atsAnalysis
      }
    });
    
  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze resume. Please try again.'
    });
  }
});

// GET /api - API documentation
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'CareerCraft API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        getUser: 'GET /api/auth/user'
      },
      companies: {
        getAll: 'GET /api/companies?page=1&limit=20&industry=Technology',
        search: 'GET /api/companies/search?q=google&limit=10',
        getBySlug: 'GET /api/companies/:slug',
        getJobs: 'GET /api/companies/:slug/jobs'
      },
      templates: {
        getAll: 'GET /api/templates?role=Developer',
        getById: 'GET /api/templates/:id',
        download: 'GET /api/templates/:id/download'
      },
      resumes: {
        upload: 'POST /api/resumes/upload'
      }
    }
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Listen on all interfaces to ensure local requests succeed
app.listen(PORT, '0.0.0.0', () => {
  console.log(`CareerCraft server running at http://localhost:${PORT}`);

  // Self-check: health endpoint
  setTimeout(() => {
    try {
      const http = require('http');
      const options = {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/health',
        method: 'GET',
        timeout: 3000
      };
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          const health = JSON.parse(data);
          if (health.success) {
            console.log('✓ Server health check passed');
            console.log(`  - Status: ${health.status}`);
            console.log(`  - Database: ${health.database}`);
          }
        });
      });
      req.on('error', (err) => console.error('✗ Health check failed:', err.message));
      req.on('timeout', () => { req.destroy(new Error('timeout')); });
      req.end();
    } catch (err) {
      console.error('✗ Health check exception:', err && err.message ? err.message : err);
    }
  }, 500);
});
