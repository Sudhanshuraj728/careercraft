# CareerCraft - AI-Powered Career Platform

A modern career platform with AI-powered resume analysis, company search, subscription management, and job discovery features.

## 🌟 Key Features

### 1. **AI Resume Analysis** (NEW!)
- Upload your resume and get instant AI-powered feedback
- Company-specific suggestions to increase your chances
- ATS (Applicant Tracking System) compatibility scoring
- Actionable improvements with priority levels
- Keyword suggestions and formatting tips

### 2. **Smart Company Search**
- Search from 60+ top companies
- Autocomplete suggestions
- Company details with features and culture
- 45+ real job openings

### 3. **Freemium Subscription Model**
- 10 free company views
- ₹149/month premium subscription
- Unlimited access for premium members
- Live usage tracking

### 4. **User Authentication**
- Email/password registration
- Google OAuth integration
- Secure session management
- Profile management

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ 
- MongoDB (local or Atlas)
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

```powershell
# 1. Install dependencies
cmd /c "cd /d E:\careercraft && npm install"

# 2. Set up environment variables
# Copy .env.example to .env and add your OpenAI API key
Copy-Item .env.example .env
# Edit .env and add: OPENAI_API_KEY=sk-your-key-here

# 3. Test OpenAI connection
node test-openai.js

# 4. Start MongoDB (if using local)
# Make sure MongoDB is running on localhost:27017

# 5. Seed company data (optional)
node seed-companies-enhanced.js

# 6. Start the server
npm start
```

### Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

APIs

- GET /api/ping
- GET /api/templates
- POST /api/register  { name, email, password }
- POST /api/login     { email, password }
- GET /api/me         (Authorization: Bearer <token>)

Test with PowerShell

```powershell
# register
Invoke-RestMethod -Uri 'http://127.0.0.1:3000/api/register' -Method POST -ContentType 'application/json' -Body ('{ "name":"Alice", "email":"alice@example.com", "password":"secret123" }')

# login
Invoke-RestMethod -Uri 'http://127.0.0.1:3000/api/login' -Method POST -ContentType 'application/json' -Body ('{ "email":"alice@example.com", "password":"secret123" }')

# get current user (use the token from login)
$token = '<paste-token-here>'
Invoke-RestMethod -Uri 'http://127.0.0.1:3000/api/me' -Headers @{ Authorization = "Bearer $token" }
```

Notes

- Users are stored in `data/users.json` (file-backed). For production use a real database.
- Set `JWT_SECRET` environment variable before starting to change the token secret.
- Passwords are hashed with bcryptjs.
