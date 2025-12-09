# 🚀 CareerCraft API - Optimized Endpoints

## ✅ API Improvements Made

### **1. RESTful URL Structure**
Changed from inconsistent paths to proper REST conventions:

#### **Before → After**
```
❌ /api/register        → ✅ /api/auth/register
❌ /api/login           → ✅ /api/auth/login
❌ /api/logout          → ✅ /api/auth/logout
❌ /api/me              → ✅ /api/auth/user
❌ /api/ping            → ✅ /api/health
❌ /api/upload          → ✅ /api/resumes/upload
```

### **2. Consistent Response Format**
All endpoints now return standardized JSON responses:

```javascript
// Success Response
{
  "success": true,
  "message": "Optional message",
  "data": { ... },
  "pagination": { ... } // For list endpoints
}

// Error Response
{
  "success": false,
  "error": "Error message",
  "fields": { ... } // For validation errors
}
```

### **3. Proper HTTP Status Codes**
- `200` - Success
- `201` - Created (register)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (auth required)
- `404` - Not Found
- `409` - Conflict (duplicate email)
- `500` - Server Error

---

## 📚 Complete API Documentation

### **Health & Info**

#### `GET /api/health`
Health check endpoint
```json
Response:
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-11-17T14:57:18.069Z",
  "uptime": 123.45,
  "database": "connected"
}
```

#### `GET /api`
API documentation
```json
Response: { Complete endpoint list }
```

---

### **Authentication**

#### `POST /api/auth/register`
Register a new user

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": null
  }
}
```

**Validation:**
- Name: Required, trimmed
- Email: Required, valid format, unique
- Password: Required, min 8 characters

---

#### `POST /api/auth/login`
Login user

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": null
  }
}
```

**Errors:**
- `400` - Missing fields
- `401` - Invalid credentials

---

#### `POST /api/auth/logout`
Logout current user

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### `GET /api/auth/user`
Get current authenticated user

**Headers:** Requires authentication

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": null
  }
}
```

**Errors:**
- `401` - Not authenticated

---

### **Companies**

#### `GET /api/companies`
Get all companies with pagination and filtering

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `industry` (string, optional)

**Example:**
```
GET /api/companies?page=1&limit=10&industry=Technology
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "name": "Google",
      "slug": "google",
      "industry": "Technology",
      "location": "Mountain View, CA",
      "size": "100,000+",
      "logo": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

---

#### `GET /api/companies/search`
Search companies with autocomplete

**Query Parameters:**
- `q` (string, required) - Search query
- `limit` (number, default: 10)

**Example:**
```
GET /api/companies/search?q=google&limit=5
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "name": "Google",
      "slug": "google",
      "industry": "Technology",
      "location": "Mountain View, CA"
    }
  ],
  "query": "google",
  "count": 1
}
```

---

#### `GET /api/companies/:slug`
Get company details by slug

**Example:**
```
GET /api/companies/google
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "name": "Google",
    "slug": "google",
    "domain": "google.com",
    "industry": "Technology",
    "size": "100,000+",
    "location": "Mountain View, CA",
    "founded": "1998",
    "description": "...",
    "features": [
      "Competitive salary and equity packages",
      "Free meals and snacks"
    ],
    "jobs": [
      {
        "title": "Software Engineer",
        "department": "Engineering",
        "location": "Remote/Hybrid",
        "type": "Full-time",
        "experience": "Mid-Senior",
        "salary": "$120k - $180k",
        "description": "...",
        "requirements": [...]
      }
    ]
  }
}
```

**Errors:**
- `400` - Missing slug
- `404` - Company not found

---

#### `GET /api/companies/:slug/jobs`
Get jobs for a specific company

**Example:**
```
GET /api/companies/google/jobs
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "company": "Google",
    "jobs": [...],
    "count": 5
  }
}
```

---

### **Templates**

#### `GET /api/templates`
Get all resume templates

**Query Parameters:**
- `role` (string, optional) - Filter by job role

**Example:**
```
GET /api/templates?role=Developer
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "dev-portfolio",
      "title": "Dev Portfolio",
      "role": "Software Developer",
      "tags": ["JavaScript", "React", "Node.js"]
    }
  ],
  "count": 1
}
```

---

#### `GET /api/templates/:id`
Get specific template details

**Example:**
```
GET /api/templates/dev-portfolio
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "dev-portfolio",
    "title": "Dev Portfolio",
    "role": "Software Developer",
    "tags": ["JavaScript", "React", "Node.js"]
  }
}
```

**Errors:**
- `404` - Template not found

---

#### `GET /api/templates/:id/download`
Download template file

**Example:**
```
GET /api/templates/dev-portfolio/download
```

**Response (200):**
- Content-Type: text/plain (will be PDF/DOCX in production)
- Content-Disposition: attachment

**Errors:**
- `404` - Template not found

---

### **Resumes**

#### `POST /api/resumes/upload`
Upload resume file

**Content-Type:** multipart/form-data

**Form Fields:**
- `resume` (file) - PDF or DOC file

**Response (200):**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "filename": "1234567890-resume.pdf",
    "originalName": "resume.pdf",
    "size": 123456,
    "mimetype": "application/pdf"
  }
}
```

**Validation:**
- File required
- Only PDF, DOC, DOCX allowed
- File auto-deleted if invalid type

**Errors:**
- `400` - No file or invalid file type
- `500` - Upload failed

---

## 🔒 Security Improvements

1. **Input Validation**
   - All inputs trimmed and sanitized
   - Email format validation
   - Password strength requirements

2. **Error Messages**
   - No sensitive information leaked
   - Consistent error format
   - Field-level validation errors

3. **File Upload Security**
   - MIME type validation
   - File size limits (via multer)
   - Safe filename generation
   - Auto-delete invalid files

---

## 📊 Best Practices Implemented

✅ RESTful URL structure
✅ Consistent response format
✅ Proper HTTP status codes
✅ Pagination for list endpoints
✅ Query parameter filtering
✅ Comprehensive error handling
✅ API documentation endpoint
✅ Health check endpoint
✅ Request validation
✅ Database connection check
✅ Lean queries for performance
✅ Global error handler

---

## 🧪 Testing the API

### Using Browser
```
http://localhost:3000/api
http://localhost:3000/api/health
http://localhost:3000/api/companies/search?q=google
```

### Using Curl (PowerShell)
```powershell
# Health Check
Invoke-WebRequest http://localhost:3000/api/health | ConvertFrom-Json

# Search Companies
Invoke-WebRequest "http://localhost:3000/api/companies/search?q=google" | ConvertFrom-Json

# Register User
$body = @{
    name = "John Doe"
    email = "john@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/auth/register `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

---

## 📝 Migration Notes

All frontend code has been updated to use new endpoints:
- `index.js` updated with new API paths
- Response handling updated to use `success` flag
- Error messages display `error` field from response

The website is fully functional with the new API! 🎉
