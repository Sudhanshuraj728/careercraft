const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

// Initialize Google Gemini client (FREE!)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your-gemini-api-key-here');

/**
 * Extract text from PDF resume using Gemini Vision API (handles image-based PDFs)
 */
async function extractTextFromPDF(filePath) {
    try {
        console.log('Extracting text from PDF:', filePath);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            throw new Error('PDF file not found at path: ' + filePath);
        }
        
        const dataBuffer = fs.readFileSync(filePath);
        console.log('PDF file size:', dataBuffer.length, 'bytes');
        
        // First try traditional PDF parsing
        try {
            const data = await pdf(dataBuffer);
            console.log('Extracted text length:', data.text.length, 'characters');
            
            // If we got meaningful text, return it
            if (data.text && data.text.trim().length > 50) {
                console.log('✅ Successfully extracted text using pdf-parse');
                return data.text;
            }
        } catch (pdfError) {
            console.log('Traditional PDF parsing failed:', pdfError.message);
        }
        
        // If traditional parsing failed or returned minimal text, use Gemini Vision
        console.log('📸 PDF appears to be image-based, using Gemini Vision API...');
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const pdfData = {
            inlineData: {
                data: dataBuffer.toString('base64'),
                mimeType: 'application/pdf'
            }
        };
        
        const result = await model.generateContent([
            "Extract ALL text content from this resume PDF. Return ONLY the raw text content, preserving the structure and formatting as much as possible. Do not add any commentary or analysis, just the extracted text.",
            pdfData
        ]);
        
        const response = await result.response;
        const extractedText = response.text();
        
        if (!extractedText || extractedText.trim().length < 50) {
            throw new Error('Could not extract sufficient text from the PDF. Please ensure the file is not corrupted.');
        }
        
        console.log('✅ Successfully extracted text using Gemini Vision API');
        console.log('Extracted text length:', extractedText.length, 'characters');
        return extractedText;
        
    } catch (error) {
        console.error('PDF extraction error:', error.message);
        throw new Error('Failed to extract text from PDF: ' + error.message);
    }
}

/**
 * Extract text from resume file
 */
async function extractResumeText(filePath, mimetype) {
    try {
        console.log('Extracting resume text...');
        console.log('File path:', filePath);
        console.log('Mime type:', mimetype);
        
        // Check if file exists first
        if (!fs.existsSync(filePath)) {
            throw new Error('Resume file not found. Please upload the file again.');
        }
        
        if (mimetype === 'application/pdf' || filePath.toLowerCase().endsWith('.pdf')) {
            return await extractTextFromPDF(filePath);
        } else if (mimetype === 'text/plain' || filePath.toLowerCase().endsWith('.txt')) {
            return fs.readFileSync(filePath, 'utf-8');
        } else {
            throw new Error('Please upload your resume as a PDF file for best results.');
        }
    } catch (error) {
        console.error('Resume extraction error:', error.message);
        throw error;
    }
}

/**
 * Analyze resume with AI and provide company-specific suggestions
 */
async function analyzeResumeForCompany(resumeText, companyData) {
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 4096, // Increased from 2000 to 4096
            }
        });
        
        const prompt = `Analyze this resume for ${companyData.name} (${companyData.industry || 'Technology'} industry) and respond ONLY with valid JSON:

RESUME:
${resumeText.substring(0, 3000)}

JSON FORMAT (respond with ONLY this JSON, no other text):
{
    "overallScore": 75,
    "strengths": ["strength1", "strength2", "strength3"],
    "improvements": [
        {"category": "Skills", "issue": "missing X", "suggestion": "add Y", "priority": "high"}
    ],
    "companySpecific": [
        {"point": "suggestion for ${companyData.name}", "reason": "why"}
    ],
    "keywordSuggestions": ["keyword1", "keyword2"],
    "formattingTips": ["tip1", "tip2"],
    "summaryRecommendation": "Brief summary of what to improve."
}

Keep responses concise. Focus on ${companyData.name}'s industry.`;

        let result;
        try {
            result = await model.generateContent(
                "CRITICAL INSTRUCTIONS: You MUST respond with ONLY valid JSON. No markdown code blocks, no explanations, no extra text. Just pure JSON starting with { and ending with }.\n\n" + prompt
            );
        } catch (apiError) {
            console.error('Gemini API error:', apiError.message);
            console.error('Error details:', JSON.stringify(apiError, null, 2));
            
            if (apiError.message.includes('API_KEY_INVALID')) {
                throw new Error('Invalid Gemini API key. Please check your .env file.');
            } else if (apiError.message.includes('RATE_LIMIT')) {
                throw new Error('API rate limit exceeded. Please wait a moment and try again.');
            } else if (apiError.message.includes('quota')) {
                throw new Error('API quota exceeded. Please check your Gemini API usage.');
            }
            
            throw new Error('AI service error: ' + apiError.message);
        }

        const response = await result.response;
        
        // Check if response has content
        if (!response) {
            console.error('Gemini API returned no response object');
            throw new Error('AI service did not respond. Please check your API key.');
        }
        
        // Check for blocking or errors
        const candidates = response.candidates;
        if (!candidates || candidates.length === 0) {
            console.error('No candidates in response:', JSON.stringify(response, null, 2));
            throw new Error('AI service returned no results. The content may have been blocked.');
        }
        
        const candidate = candidates[0];
        if (candidate.finishReason !== 'STOP') {
            console.error('Unexpected finish reason:', candidate.finishReason);
            if (candidate.finishReason === 'SAFETY') {
                throw new Error('Content was blocked by safety filters. Please try a different resume or company.');
            } else if (candidate.finishReason === 'MAX_TOKENS') {
                console.error('Response truncated due to max tokens. Trying to parse partial response...');
                // Continue anyway, might have partial JSON
            }
        }
        
        let text = response.text();
        console.log('Raw AI response length:', text.length);
        
        // Remove markdown code blocks if present
        text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        
        // Extract JSON from response (in case there's extra text)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('No JSON found in response:', text.substring(0, 500));
            throw new Error('AI did not return valid JSON format');
        }
        
        const jsonText = jsonMatch[0];
        console.log('Extracted JSON length:', jsonText.length);
        
        const analysis = JSON.parse(jsonText);
        return analysis;

    } catch (error) {
        console.error('AI Analysis error:', error);
        if (error instanceof SyntaxError) {
            throw new Error('AI response format error. Please try again.');
        }
        throw new Error('Failed to analyze resume. Please try again.');
    }
}

/**
 * Generate ATS-friendly suggestions
 */
async function generateATSSuggestions(resumeText) {
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            generationConfig: {
                temperature: 0.5,
                maxOutputTokens: 2048, // Increased from 1000
            }
        });
        
        const prompt = `Analyze for ATS compatibility. Respond ONLY with JSON:

RESUME: ${resumeText.substring(0, 2000)}

JSON:
{
    "atsScore": 80,
    "issues": ["issue1", "issue2"],
    "suggestions": ["fix1", "fix2"],
    "goodPractices": ["good1", "good2"]
}`;

        const result = await model.generateContent(prompt);

        const response = await result.response;
        const text = response.text();
        
        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? jsonMatch[0] : text;
        return JSON.parse(jsonText);

    } catch (error) {
        console.error('ATS Analysis error:', error);
        return null;
    }
}

module.exports = {
    extractResumeText,
    analyzeResumeForCompany,
    generateATSSuggestions
};
