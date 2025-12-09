# 🤖 AI-Powered Resume Analysis Feature

## Overview
CareerCraft now includes an intelligent resume analysis feature powered by OpenAI's GPT-4o-mini. This feature analyzes your resume and provides company-specific suggestions to help you increase your chances of getting hired.

## Features

### 1. **Smart Resume Analysis**
- Upload your resume (PDF format recommended)
- Get an overall resume score (0-100)
- Receive ATS (Applicant Tracking System) compatibility score
- Identify strengths and weaknesses

### 2. **Company-Specific Suggestions**
- Target specific companies (Google, Amazon, Microsoft, etc.)
- Get tailored recommendations based on company culture and requirements
- Align your resume with company job openings
- Learn what matters most to each company

### 3. **Actionable Improvements**
- Prioritized improvements (High, Medium, Low priority)
- Specific, actionable suggestions
- Keyword recommendations
- Formatting tips
- Missing skills identification

### 4. **ATS Optimization**
- Check ATS compatibility
- Fix formatting issues that could block automated screening
- Ensure proper keyword placement
- Optimize for resume parsing systems

## Setup Instructions

### 1. Get OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Go to [API Keys](https://platform.openai.com/api-keys)
4. Create a new API key
5. Copy the key (you won't be able to see it again!)

### 2. Configure Environment
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your OpenAI API key:
   ```bash
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

### 3. Install Dependencies
```bash
npm install
```

Dependencies include:
- `openai` - OpenAI SDK for Node.js
- `pdf-parse` - PDF text extraction
- `dotenv` - Environment variable management

### 4. Start the Server
```bash
npm start
```

## How to Use

### Step 1: Upload Resume
1. Click "Upload Resume" button on the homepage
2. Drag & drop your PDF resume or click to browse
3. (Optional) Enter target company name for company-specific analysis

### Step 2: AI Analysis
1. Click "🤖 Analyze Resume with AI"
2. Wait 20-30 seconds for AI to analyze your resume
3. View comprehensive results

### Step 3: Review Results
The analysis includes:
- **Overall Score**: Your resume quality score (0-100)
- **ATS Score**: How well your resume passes automated screening (0-100)
- **Strengths**: What you're doing well
- **Improvements**: What needs work (with priority levels)
- **Company-Specific Tips**: Tailored advice for your target company
- **Keywords**: Important keywords to add
- **Formatting Tips**: How to improve presentation

### Step 4: Implement Changes
1. Review all suggestions
2. Start with high-priority improvements
3. Add recommended keywords
4. Update formatting
5. Re-upload to see improved scores!

## API Endpoints

### Upload Resume
```
POST /api/resumes/upload
Content-Type: multipart/form-data

Body: {
  resume: File (PDF)
}

Response: {
  success: true,
  data: {
    filename: "1234567890-resume.pdf",
    originalName: "my-resume.pdf",
    size: 123456,
    mimetype: "application/pdf"
  }
}
```

### Analyze Resume
```
POST /api/resumes/analyze
Content-Type: application/json

Body: {
  filename: "1234567890-resume.pdf",
  companySlug: "google"
}

Response: {
  success: true,
  data: {
    company: {
      name: "Google",
      industry: "Technology"
    },
    analysis: {
      overallScore: 85,
      strengths: [...],
      improvements: [...],
      companySpecific: [...],
      keywordSuggestions: [...],
      formattingTips: [...],
      summaryRecommendation: "..."
    },
    atsAnalysis: {
      atsScore: 78,
      issues: [...],
      suggestions: [...],
      goodPractices: [...]
    }
  }
}
```

## Cost Estimation

Using GPT-4o-mini (recommended for cost-effectiveness):
- **Input**: ~2000 tokens (resume + prompt) = $0.0003
- **Output**: ~1500 tokens (analysis) = $0.0009
- **Total per analysis**: ~$0.0012 (0.12 cents)

For 1000 resume analyses: ~$1.20

## Tips for Best Results

### Resume Preparation
1. **Use PDF format** - Best text extraction quality
2. **Clear formatting** - Avoid complex layouts
3. **Standard fonts** - Arial, Calibri, Times New Roman
4. **No images** - Text content only
5. **File size** - Keep under 5MB

### Company Selection
1. **Be specific** - "Google" not "Tech company"
2. **Match industry** - Select companies in your field
3. **Check job openings** - Target companies with relevant positions
4. **Research first** - Know the company culture

### Acting on Feedback
1. **Prioritize** - Start with high-priority items
2. **Keywords matter** - Add suggested keywords naturally
3. **Quantify achievements** - Use numbers and metrics
4. **Customize** - Tailor for each application
5. **Re-analyze** - Check improvements with another analysis

## Troubleshooting

### "Failed to analyze resume"
- **Check API key**: Ensure OPENAI_API_KEY is set correctly in .env
- **Check balance**: Verify you have credits in your OpenAI account
- **Check file**: Make sure resume is a valid PDF
- **Check logs**: Look at server console for detailed errors

### "Invalid file type"
- Only PDF files are supported for best results
- Convert DOC/DOCX to PDF first

### "File too large"
- Maximum file size is 5MB
- Reduce image quality or remove images
- Compress PDF file

### Low Scores
- **Normal range**: 60-85 is typical for most resumes
- **Improvement**: Follow high-priority suggestions first
- **Realistic**: Perfection isn't expected, improvement is

## Privacy & Security

- **File Storage**: Resumes are stored in `/uploads` directory
- **Temporary**: Files can be deleted after analysis
- **API Security**: OpenAI doesn't store resume content
- **Local Processing**: All analysis happens on your server
- **No Sharing**: Resume content is never shared with third parties

## Future Enhancements

- [ ] Support for DOC/DOCX files
- [ ] Resume builder integration
- [ ] Job posting matching
- [ ] Interview preparation tips
- [ ] Cover letter generation
- [ ] LinkedIn profile optimization
- [ ] Salary negotiation advice
- [ ] Industry-specific templates

## Support

For issues or questions:
1. Check this documentation
2. Review server logs
3. Verify OpenAI API key setup
4. Check OpenAI account balance
5. Ensure all dependencies are installed

## License
MIT License - Feel free to use and modify for your needs!
