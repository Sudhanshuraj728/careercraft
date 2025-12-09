// Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId + 'Modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId + 'Modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function switchModal(closeId, openId) {
    closeModal(closeId);
    setTimeout(() => openModal(openId), 300);
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// LinkedIn Link Function
async function linkLinkedIn() {
    // Check if already linked
    if (currentUser && currentUser.linkedinProfile && currentUser.linkedinProfile.linkedAt) {
        const unlink = confirm('Your LinkedIn is already linked!\n\nDo you want to unlink it?');
        if (unlink) {
            await unlinkLinkedIn();
        }
        return;
    }
    
    // Redirect to LinkedIn OAuth (works for both login and linking)
    window.location.href = '/auth/linkedin';
}

async function unlinkLinkedIn() {
    try {
        const response = await fetch('/api/auth/unlink-linkedin', {
            method: 'POST',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ LinkedIn unlinked successfully!');
            await checkAuthStatus(); // Refresh user data
        } else {
            alert('Failed to unlink LinkedIn. Please try again.');
        }
    } catch (error) {
        console.error('Unlink error:', error);
        alert('Error unlinking LinkedIn. Please try again.');
    }
}

// Auth State Management
let currentUser = null;
let subscriptionStatus = null;

// Check subscription status
async function checkSubscriptionStatus() {
    try {
        const response = await fetch('/api/subscription/status', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
                subscriptionStatus = data.data;
                updateSubscriptionBanner();
            }
        }
    } catch (error) {
        console.error('Subscription status check failed:', error);
    }
}

// Update subscription banner
function updateSubscriptionBanner() {
    const banner = document.getElementById('subscriptionBanner');
    const remainingViews = document.getElementById('remainingViews');
    
    if (!subscriptionStatus || subscriptionStatus.plan === 'premium') {
        banner.style.display = 'none';
        return;
    }
    
    const remaining = subscriptionStatus.remaining;
    
    if (typeof remaining === 'number') {
        remainingViews.textContent = remaining;
        
        if (remaining <= 3 && remaining > 0) {
            banner.style.display = 'flex';
            banner.classList.add('warning');
        } else if (remaining === 0) {
            banner.style.display = 'flex';
            banner.classList.add('danger');
            document.querySelector('.banner-text').innerHTML = '<strong>No free views remaining!</strong> Upgrade to continue';
        } else if (remaining <= 5) {
            banner.style.display = 'flex';
        }
    }
}

// Check if user is logged in on page load
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/user', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.user) {
                currentUser = data.user;
                updateUIForLoggedInUser(data.user);
            } else {
                updateUIForLoggedOutUser();
            }
        } else {
            updateUIForLoggedOutUser();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        updateUIForLoggedOutUser();
    }
}

function updateUIForLoggedInUser(user) {
    // Hide auth buttons, show user menu
    document.getElementById('authButtons').style.display = 'none';
    document.getElementById('userMenu').style.display = 'flex';
    document.getElementById('userName').textContent = user.name;
    
    // Update avatar if exists
    if (user.avatar) {
        const avatarImg = document.getElementById('userAvatar');
        avatarImg.src = user.avatar;
    }
    
    // Update LinkedIn button
    updateLinkedInButton(user);
}

function updateLinkedInButton(user) {
    const linkedinBtn = document.getElementById('linkedinBtn');
    const linkedinBtnText = document.getElementById('linkedinBtnText');
    
    if (!linkedinBtn) return;
    
    if (user && user.linkedinProfile && user.linkedinProfile.linkedAt) {
        // LinkedIn is linked - show as linked with checkmark
        linkedinBtn.style.background = 'linear-gradient(135deg, #059669 0%, #10b981 100%)';
        linkedinBtnText.innerHTML = '✓ LinkedIn Linked';
        linkedinBtn.title = 'LinkedIn connected - Click to unlink';
    } else if (user) {
        // User logged in but LinkedIn not linked
        linkedinBtn.style.background = 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)';
        linkedinBtnText.textContent = 'Link LinkedIn';
        linkedinBtn.title = 'Connect your LinkedIn profile';
    } else {
        // User not logged in - can sign in with LinkedIn
        linkedinBtn.style.background = 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)';
        linkedinBtnText.textContent = 'Sign in with LinkedIn';
        linkedinBtn.title = 'Sign in or sign up with your LinkedIn account';
    }
}

function updateUIForLoggedOutUser() {
    // Show auth buttons, hide user menu
    document.getElementById('authButtons').style.display = 'flex';
    document.getElementById('userMenu').style.display = 'none';
    currentUser = null;
    
    // Reset LinkedIn button
    updateLinkedInButton(null);
}

// Handle Sign Up
async function handleSignUp(event) {
    event.preventDefault();
    
    const form = event.target;
    const errorDiv = document.getElementById('signupError');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Clear previous errors
    errorDiv.style.display = 'none';
    
    // Get form data
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;
    
    // Validate input
    if (!name || !email || !password || !confirmPassword) {
        errorDiv.textContent = 'Please fill in all fields.';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Validate passwords match
    if (password !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match.';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Validate password length
    if (password.length < 8) {
        errorDiv.textContent = 'Password must be at least 8 characters long.';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Disable button during request
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success && data.user) {
            // Success - close modal and update UI
            currentUser = data.user;
            closeModal('signup');
            updateUIForLoggedInUser(data.user);
            
            // Show success message
            alert(`Welcome, ${data.user.name}! Your account has been created.`);
            
            // Reset form
            form.reset();
        } else {
            // Show error message
            errorDiv.textContent = data.error || 'Registration failed. Please try again.';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Signup error:', error);
        errorDiv.textContent = 'Network error. Please check your connection.';
        errorDiv.style.display = 'block';
    } finally {
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
    }
}

// Handle Sign In
async function handleSignIn(event) {
    event.preventDefault();
    
    const form = event.target;
    const errorDiv = document.getElementById('signinError');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Clear previous errors
    errorDiv.style.display = 'none';
    
    // Get form data
    const email = form.email.value.trim();
    const password = form.password.value;
    
    // Validate input
    if (!email || !password) {
        errorDiv.textContent = 'Please enter both email and password.';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Disable button during request
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing In...';
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success && data.user) {
            // Success - close modal and update UI
            currentUser = data.user;
            closeModal('signin');
            updateUIForLoggedInUser(data.user);
            
            // Show success message
            alert(`Welcome back, ${data.user.name}!`);
            
            // Reset form
            form.reset();
        } else {
            // Show error message
            errorDiv.textContent = data.error || 'Invalid email or password. Please try again.';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Signin error:', error);
        errorDiv.textContent = 'Network error. Please check your connection.';
        errorDiv.style.display = 'block';
    } finally {
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
    }
}

// Handle Logout
async function handleLogout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            updateUIForLoggedOutUser();
            alert('You have been logged out successfully.');
        } else {
            alert('Logout failed. Please try again.');
        }
    } catch (error) {
        console.error('Logout error:', error);
        alert('Logout failed. Please try again.');
    }
}

// Check auth status on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    checkSubscriptionStatus();
    
    // Check URL parameters for OAuth redirects
    const urlParams = new URLSearchParams(window.location.search);
    
    // Google OAuth success
    if (urlParams.get('login') === 'success') {
        window.history.replaceState({}, document.title, window.location.pathname);
        checkAuthStatus().then(() => {
            if (currentUser) {
                alert(`Welcome, ${currentUser.name}! You've successfully signed in with Google.`);
            }
        });
    }
    
    // LinkedIn OAuth success
    if (urlParams.get('linkedin') === 'success') {
        window.history.replaceState({}, document.title, window.location.pathname);
        checkAuthStatus().then(() => {
            if (currentUser) {
                alert(`✅ Welcome, ${currentUser.name}!\n\nYou've successfully signed in with LinkedIn. Your profile is now linked!`);
            }
        });
    }
    
    // LinkedIn linked to existing account
    if (urlParams.get('linkedin') === 'linked') {
        window.history.replaceState({}, document.title, window.location.pathname);
        checkAuthStatus().then(() => {
            alert('✅ LinkedIn linked successfully!\n\nYour LinkedIn profile has been connected to your account.');
        });
    }
    
    // LinkedIn OAuth errors
    const error = urlParams.get('error');
    if (error) {
        window.history.replaceState({}, document.title, window.location.pathname);
        let errorMessage = '';
        
        switch(error) {
            case 'linkedin_denied':
                errorMessage = 'LinkedIn sign-in was cancelled. Please try again.';
                break;
            case 'linkedin_no_email':
                errorMessage = 'Unable to get email from LinkedIn. Please ensure email permissions are granted.';
                break;
            case 'linkedin_failed':
            case 'linkedin_error':
                errorMessage = 'Failed to connect with LinkedIn. Please try again.';
                break;
            case 'login_failed':
                errorMessage = 'Failed to log you in. Please try again.';
                break;
            case 'linkedin_not_configured':
                errorMessage = '⚠️ LinkedIn Integration Not Set Up\n\n' +
                             'Please follow these steps:\n\n' +
                             '1. Go to https://www.linkedin.com/developers/apps\n' +
                             '2. Create an app and get Client ID & Secret\n' +
                             '3. Add redirect URL: http://localhost:3000/auth/linkedin/callback\n' +
                             '4. Update the .env file with your credentials\n' +
                             '5. Restart the server\n\n' +
                             'See LINKEDIN-SETUP.md for detailed instructions.';
                break;
        }
        
        if (errorMessage) {
            alert(errorMessage);
        }
    }
});

// File Upload Handlers
const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const uploadBoxModal = document.getElementById('uploadBoxModal');
const modalFileInput = document.getElementById('modalFileInput');

// Main upload box
if (uploadBox && fileInput) {
    uploadBox.addEventListener('click', () => fileInput.click());
    
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = 'var(--primary-color)';
        uploadBox.style.background = 'rgba(0, 217, 255, 0.1)';
    });
    
    uploadBox.addEventListener('dragleave', () => {
        uploadBox.style.borderColor = 'rgba(0, 217, 255, 0.3)';
        uploadBox.style.background = 'var(--dark-surface)';
    });
    
    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        handleFiles(files);
        uploadBox.style.borderColor = 'rgba(0, 217, 255, 0.3)';
        uploadBox.style.background = 'var(--dark-surface)';
    });
    
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
}

// Modal upload box
if (uploadBoxModal && modalFileInput) {
    uploadBoxModal.addEventListener('click', () => modalFileInput.click());
    
    uploadBoxModal.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBoxModal.style.borderColor = 'var(--primary-color)';
    });
    
    uploadBoxModal.addEventListener('dragleave', () => {
        uploadBoxModal.style.borderColor = 'rgba(0, 217, 255, 0.3)';
    });
    
    uploadBoxModal.addEventListener('drop', (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        handleFiles(files);
        uploadBoxModal.style.borderColor = 'rgba(0, 217, 255, 0.3)';
    });
    
    modalFileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
}

function handleFiles(files) {
    if (files.length > 0) {
        const fileNames = Array.from(files).map(f => f.name).join(', ');
        alert(`✅ Files selected:\n${fileNames}\n\nFiles will be uploaded to your profile!`);
    }
}

// Search Functionality with Autocomplete
const searchBtn = document.querySelector('.search-btn');
const searchInput = document.querySelector('.search-input');
let searchTimeout;
let searchSuggestions = null;

// Create suggestions dropdown
function createSuggestionsDropdown() {
    if (searchSuggestions) return searchSuggestions;
    
    searchSuggestions = document.createElement('div');
    searchSuggestions.className = 'search-suggestions';
    searchSuggestions.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: rgba(20, 20, 30, 0.98);
        border: 1px solid rgba(0, 217, 255, 0.3);
        border-radius: 8px;
        margin-top: 5px;
        max-height: 400px;
        overflow-y: auto;
        z-index: 1000;
        display: none;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    `;
    
    const searchBox = document.querySelector('.search-box');
    if (searchBox) {
        searchBox.style.position = 'relative';
        searchBox.appendChild(searchSuggestions);
    }
    
    return searchSuggestions;
}

// Fetch company suggestions
async function fetchCompanySuggestions(query) {
    if (!query || query.length < 1) {
        hideSuggestions();
        return;
    }
    
    try {
        const response = await fetch(`/api/companies/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
            showSuggestions(data.data, query);
        } else {
            showNoResults(query);
        }
    } catch (error) {
        console.error('Search error:', error);
        hideSuggestions();
    }
}

// Show suggestions
function showSuggestions(companies, query) {
    const dropdown = createSuggestionsDropdown();
    
    dropdown.innerHTML = companies.map(company => `
        <div class="suggestion-item" data-slug="${company.slug}" style="
            padding: 12px 16px;
            cursor: pointer;
            border-bottom: 1px solid rgba(0, 217, 255, 0.1);
            transition: all 0.3s;
        ">
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    color: white;
                ">
                    ${company.name.substring(0, 2).toUpperCase()}
                </div>
                <div style="flex: 1;">
                    <div style="color: white; font-weight: 500; margin-bottom: 2px;">${company.name}</div>
                    <div style="color: var(--text-secondary); font-size: 12px;">
                        ${company.industry || 'Company'} ${company.location ? '• ' + company.location : ''}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    dropdown.style.display = 'block';
    
    // Add click handlers
    dropdown.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(0, 217, 255, 0.1)';
            this.style.borderLeft = '3px solid var(--primary-color)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.background = 'transparent';
            this.style.borderLeft = 'none';
        });
        
        item.addEventListener('click', function() {
            const companyName = this.querySelector('div > div:nth-child(2) > div:first-child').textContent;
            const slug = this.dataset.slug;
            selectCompany(companyName, slug);
        });
    });
}

// Show no results
function showNoResults(query) {
    const dropdown = createSuggestionsDropdown();
    dropdown.innerHTML = `
        <div style="padding: 20px; text-align: center; color: var(--text-secondary);">
            <div style="font-size: 40px; margin-bottom: 10px;">🔍</div>
            <div>No companies found for "${query}"</div>
            <div style="font-size: 12px; margin-top: 5px;">Try searching for companies like Google, Amazon, or Microsoft</div>
        </div>
    `;
    dropdown.style.display = 'block';
}

// Hide suggestions
function hideSuggestions() {
    if (searchSuggestions) {
        searchSuggestions.style.display = 'none';
    }
}

// Select company
async function selectCompany(name, slug) {
    searchInput.value = name;
    hideSuggestions();
    
    // Fetch and show company details
    await showCompanyDetails(slug);
}

// Fetch and display company details
async function showCompanyDetails(slug) {
    try {
        const response = await fetch(`/api/companies/${slug}`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (response.status === 403 && data.requiresSubscription) {
            // Show subscription modal
            showSubscriptionLimitModal(data);
            return;
        }
        
        if (data.success && data.data) {
            // Update subscription status if provided
            if (data.subscription) {
                subscriptionStatus = data.subscription;
                updateSubscriptionBanner();
            }
            
            displayCompanyModal(data.data);
        } else {
            alert(data.error || 'Company details not found.');
        }
    } catch (error) {
        console.error('Error fetching company details:', error);
        alert('Failed to load company details. Please try again.');
    }
}

// Show subscription limit modal
function showSubscriptionLimitModal(data) {
    closeModal('company');
    hideSuggestions();
    
    // Update the modal with usage info if needed
    const modal = document.getElementById('subscriptionModal');
    openModal('subscription');
}

// Handle premium upgrade
function handleUpgrade() {
    // Check if user is logged in
    if (!currentUser) {
        closeModal('subscription');
        alert('Please sign in to upgrade to Premium.');
        setTimeout(() => openModal('signin'), 300);
        return;
    }
    
    // In production, integrate with payment gateway (Razorpay, Stripe, etc.)
    if (confirm('Upgrade to Premium for ₹149/month?\n\n✓ Unlimited company views\n✓ Full access to all features\n✓ Priority support\n\nNote: This is a demo. In production, you will be redirected to payment gateway.')) {
        upgradeToPremium();
    }
}

// Upgrade to premium
async function upgradeToPremium() {
    try {
        const response = await fetch('/api/subscription/upgrade', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                transactionId: `DEMO_TXN_${Date.now()}`
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeModal('subscription');
            
            // Update subscription status
            subscriptionStatus = {
                plan: 'premium',
                remaining: 'Unlimited',
                isPremium: true
            };
            updateSubscriptionBanner();
            
            // Show success message
            setTimeout(() => {
                alert('🎉 Welcome to Premium!\n\nYou now have unlimited access to all companies and features.\n\nThank you for supporting CareerCraft!');
            }, 300);
        } else {
            alert(data.error || 'Upgrade failed. Please try again.');
        }
    } catch (error) {
        console.error('Upgrade error:', error);
        alert('Upgrade failed. Please try again later.');
    }
}

// Display company details in modal
function displayCompanyModal(company) {
    const companyDetails = document.getElementById('companyDetails');
    
    companyDetails.innerHTML = `
        <div class="company-header">
            <div class="company-icon-large">
                ${company.name.substring(0, 2).toUpperCase()}
            </div>
            <div class="company-header-info">
                <h2>${company.name}</h2>
                <p class="company-meta">
                    ${company.industry} • ${company.size} employees • ${company.location}
                </p>
                ${company.founded ? `<p class="company-founded">Founded: ${company.founded}</p>` : ''}
            </div>
        </div>
        
        <div class="company-description">
            <p>${company.description}</p>
        </div>
        
        ${company.features && company.features.length > 0 ? `
            <div class="company-section">
                <h3>✨ Company Features & Benefits</h3>
                <div class="features-grid">
                    ${company.features.map(feature => `
                        <div class="feature-item">
                            <span class="feature-icon">✓</span>
                            <span>${feature}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
        
        ${company.jobs && company.jobs.length > 0 ? `
            <div class="company-section">
                <h3>💼 Open Positions (${company.jobs.length})</h3>
                <div class="jobs-list">
                    ${company.jobs.map((job, index) => `
                        <div class="job-card" data-job-index="${index}">
                            <div class="job-header">
                                <div>
                                    <h4>${job.title}</h4>
                                    <p class="job-meta">
                                        ${job.department} • ${job.location} • ${job.type}
                                    </p>
                                </div>
                                <div class="job-salary">${job.salary}</div>
                            </div>
                            <div class="job-tags">
                                <span class="job-tag">${job.experience}</span>
                                <span class="job-tag">${job.type}</span>
                            </div>
                            <p class="job-description">${job.description}</p>
                            <div class="job-requirements">
                                <strong>Requirements:</strong>
                                <ul>
                                    ${job.requirements.map(req => `<li>${req}</li>`).join('')}
                                </ul>
                            </div>
                            <button class="btn btn-primary" onclick="applyForJob('${company.name}', '${job.title}', ${index})">
                                Apply for this Position
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : `
            <div class="company-section">
                <h3>💼 Open Positions</h3>
                <p class="no-jobs">No positions currently available. Check back soon!</p>
            </div>
        `}
        
        <div class="company-actions">
            <button class="btn btn-secondary" onclick="closeModal('company')">
                Close
            </button>
            <button class="btn btn-primary" onclick="openModal('upload')">
                Upload Resume for ${company.name}
            </button>
        </div>
    `;
    
    openModal('company');
}

// Apply for a job
function applyForJob(companyName, jobTitle, jobIndex) {
    closeModal('company');
    
    // Store application context
    sessionStorage.setItem('applicationContext', JSON.stringify({
        company: companyName,
        position: jobTitle,
        jobIndex: jobIndex
    }));
    
    // Open upload modal
    setTimeout(() => {
        openModal('upload');
        
        // Update upload modal title
        const uploadModal = document.getElementById('uploadModal');
        const modalTitle = uploadModal.querySelector('h2');
        if (modalTitle) {
            modalTitle.textContent = `Apply for ${jobTitle} at ${companyName}`;
        }
    }, 300);
}

if (searchBtn && searchInput) {
    // Search button click
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            fetchCompanySuggestions(query);
        }
    });
    
    // Input event for live search
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        // Debounce search
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            fetchCompanySuggestions(query);
        }, 300);
    });
    
    // Enter key
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                fetchCompanySuggestions(query);
            }
        }
    });
    
    // Focus event
    searchInput.addEventListener('focus', () => {
        const query = searchInput.value.trim();
        if (query) {
            fetchCompanySuggestions(query);
        }
    });
    
    // Click outside to close
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box')) {
            hideSuggestions();
        }
    });
}

// Mobile Menu Toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');
const navActions = document.querySelector('.nav-actions');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        navActions.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Close mobile menu if open
            if (navLinks) navLinks.classList.remove('active');
            if (navActions) navActions.classList.remove('active');
            if (mobileMenuToggle) mobileMenuToggle.classList.remove('active');
        }
    });
});

// Scroll reveal animation
const revealElements = document.querySelectorAll('.feature-card, .about-text, .contact-form');

const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    
    revealElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const revealPoint = 150;
        
        if (elementTop < windowHeight - revealPoint) {
            element.classList.add('scroll-reveal', 'active');
        }
    });
};

window.addEventListener('scroll', revealOnScroll);
revealOnScroll(); // Initial check

// Form submission handlers
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('✅ Thank you for your message! We will get back to you soon.');
        contactForm.reset();
    });
}

// Note: Auth form handlers (signin/signup) are defined as handleSignIn() and handleSignUp()
// and attached via onsubmit attributes in the HTML. Do not add duplicate listeners here.

// Upload form handler
document.querySelectorAll('.upload-form').forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('✅ Resume uploaded successfully!\n\nYour profile has been updated with your resume and job preferences.');
        closeModal('upload');
        form.reset();
    });
});

// Add floating animation to hero on mouse move
const hero = document.querySelector('.hero');
const circles = document.querySelectorAll('.circle');

hero.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    circles.forEach((circle, index) => {
        const speed = (index + 1) * 20;
        const x = mouseX * speed;
        const y = mouseY * speed;
        
        circle.style.transform = `translate(${x}px, ${y}px)`;
    });
});

// Navbar scroll effect
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.background = 'rgba(10, 10, 15, 0.98)';
        navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.5)';
    } else {
        navbar.style.background = 'rgba(10, 10, 15, 0.95)';
        navbar.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
});

// Button ripple effect
const buttons = document.querySelectorAll('.btn');

buttons.forEach(button => {
    button.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add parallax effect to sections
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.hero-content');
    
    parallaxElements.forEach(element => {
        const speed = 0.5;
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Typing effect for tagline (optional enhancement)
const tagline = document.querySelector('.tagline');
if (tagline) {
    const text = tagline.textContent;
    tagline.textContent = '';
    let i = 0;
    
    const typeWriter = () => {
        if (i < text.length) {
            tagline.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 50);
        }
    };
    
    // Start typing after page loads
    setTimeout(typeWriter, 1000);
}

// Cursor trail effect (optional, can be removed if too much)
const createTrail = (e) => {
    const trail = document.createElement('div');
    trail.className = 'cursor-trail';
    trail.style.left = e.clientX + 'px';
    trail.style.top = e.clientY + 'px';
    
    document.body.appendChild(trail);
    
    setTimeout(() => {
        trail.remove();
    }, 500);
};

// Uncomment to enable cursor trail
// document.addEventListener('mousemove', createTrail);

console.log('🚀 CareerCraft initialized successfully!');

// Show Templates Section when clicked
function showTemplates(event) {
    event.preventDefault();
    const templatesSection = document.querySelector('.templates-section');
    
    // Toggle templates section visibility
    if (templatesSection.classList.contains('active')) {
        templatesSection.classList.remove('active');
    } else {
        templatesSection.classList.add('active');
        // Smooth scroll to templates
        setTimeout(() => {
            templatesSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    }
}

// Resume Templates Filtering
function filterTemplates(role) {
    const allCards = document.querySelectorAll('.template-card');
    const allButtons = document.querySelectorAll('.role-btn');
    
    // Update active button
    allButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Filter cards with animation
    allCards.forEach(card => {
        if (role === 'all' || card.getAttribute('data-role') === role) {
            card.style.display = 'block';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 10);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}

// Download Template Function
function downloadTemplate(templateName) {
    // Template details mapping
    const templates = {
        'data-pro': {
            name: 'Data Pro Template',
            role: 'Data Analyst',
            features: ['Technical skills section', 'Project metrics showcase', 'Tool proficiency charts']
        },
        'analytics-expert': {
            name: 'Analytics Expert Template',
            role: 'Data Analyst',
            features: ['Dashboard portfolio', 'Visualization highlights', 'Statistical analysis focus']
        },
        'dev-portfolio': {
            name: 'Dev Portfolio Template',
            role: 'Software Developer',
            features: ['GitHub integration', 'Project showcase', 'Tech stack display']
        },
        'marketing-maven': {
            name: 'Marketing Maven Template',
            role: 'Marketing Specialist',
            features: ['Campaign results', 'ROI metrics', 'Creative strategy showcase']
        },
        'design-studio': {
            name: 'Design Studio Template',
            role: 'Designer',
            features: ['Portfolio gallery', 'Design tool proficiency', 'Creative projects']
        },
        'bi-specialist': {
            name: 'BI Specialist Template',
            role: 'Business Intelligence',
            features: ['KPI dashboards', 'ETL process showcase', 'Business insights']
        }
    };
    
    const template = templates[templateName];
    
    if (template) {
        const message = `✅ ${template.name} Selected!\n\n` +
                       `Perfect for: ${template.role}\n\n` +
                       `Features:\n${template.features.map(f => `• ${f}`).join('\n')}\n\n` +
                       `Your template is being prepared for download...\n\n` +
                       `📄 Format: DOCX & PDF\n` +
                       `🎨 Fully customizable\n` +
                       `✨ ATS-friendly design`;
        
        alert(message);
        
        // Simulate download process
        setTimeout(() => {
            console.log(`Downloaded: ${template.name}`);
            // In a real app, this would trigger actual file download
            // window.location.href = `/download/${templateName}`;
        }, 500);
    }
}

// Initialize template cards animation on load
document.addEventListener('DOMContentLoaded', () => {
    const templateCards = document.querySelectorAll('.template-card');
    templateCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Initialize resume upload functionality
    initializeResumeUpload();
});

// Resume upload and analysis functionality
let uploadedResume = null;
let selectedCompanyForAnalysis = null;

function initializeResumeUpload() {
    const fileInput = document.getElementById('modalFileInput');
    const uploadBox = document.getElementById('uploadBoxModal');
    const form = document.getElementById('resumeUploadForm');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const fileNameDisplay = document.getElementById('selectedFileName');
    const companyInput = document.getElementById('targetCompanyInput');
    
    if (!fileInput || !uploadBox || !form) return;
    
    // Drag and drop
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = 'var(--primary-color)';
        uploadBox.style.background = 'rgba(0, 217, 255, 0.05)';
    });
    
    uploadBox.addEventListener('dragleave', () => {
        uploadBox.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        uploadBox.style.background = 'transparent';
    });
    
    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        uploadBox.style.background = 'transparent';
        
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file, fileInput, analyzeBtn, fileNameDisplay);
        }
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelect(file, fileInput, analyzeBtn, fileNameDisplay);
        }
    });
    
    // Company search
    if (companyInput) {
        let searchTimeout;
        companyInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                document.getElementById('companySearchResults').style.display = 'none';
                return;
            }
            
            searchTimeout = setTimeout(() => {
                searchCompaniesForAnalysis(query);
            }, 300);
        });
    }
    
    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await analyzeResume();
    });
}

function handleFileSelect(file, fileInput, analyzeBtn, fileNameDisplay) {
    // Validate file type
    if (!file.name.endsWith('.pdf')) {
        alert('Please upload a PDF file for best results.');
        return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
    }
    
    uploadedResume = file;
    fileNameDisplay.textContent = `✓ ${file.name}`;
    fileNameDisplay.style.color = 'var(--primary-color)';
    analyzeBtn.disabled = false;
}

async function searchCompaniesForAnalysis(query) {
    try {
        const response = await fetch(`/api/companies/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        const resultsDiv = document.getElementById('companySearchResults');
        
        if (data.success && data.data && data.data.length > 0) {
            resultsDiv.innerHTML = data.data.map(company => `
                <div class="company-search-item" data-slug="${company.slug}" data-name="${company.name}">
                    ${company.name}
                </div>
            `).join('');
            
            resultsDiv.style.display = 'block';
            
            // Add click handlers
            resultsDiv.querySelectorAll('.company-search-item').forEach(item => {
                item.addEventListener('click', () => {
                    const companyName = item.dataset.name;
                    const companySlug = item.dataset.slug;
                    document.getElementById('targetCompanyInput').value = companyName;
                    selectedCompanyForAnalysis = companySlug;
                    resultsDiv.style.display = 'none';
                });
            });
        } else {
            resultsDiv.style.display = 'none';
        }
    } catch (error) {
        console.error('Company search error:', error);
    }
}

async function analyzeResume() {
    if (!uploadedResume) {
        alert('Please select a resume file first.');
        return;
    }
    
    try {
        // Show loading modal
        openModal('analysis');
        const analysisResults = document.getElementById('analysisResults');
        analysisResults.innerHTML = `
            <div class="analysis-loading">
                <div class="loader"></div>
                <p>🤖 AI is analyzing your resume...</p>
                <p class="loading-subtext">This may take up to 30 seconds</p>
                <p id="progressStatus" style="margin-top: 10px; color: #888; font-size: 14px;">Starting...</p>
            </div>
        `;
        
        const updateProgress = (message) => {
            const statusEl = document.getElementById('progressStatus');
            if (statusEl) statusEl.textContent = message;
        };
        
        // Upload resume
        updateProgress('Uploading resume...');
        const formData = new FormData();
        formData.append('resume', uploadedResume);
        
        console.log('Uploading resume:', uploadedResume.name);
        const uploadResponse = await fetch('/api/resumes/upload', {
            method: 'POST',
            credentials: 'include',
            body: formData
        }).catch(err => {
            console.error('Upload fetch error:', err);
            throw new Error('Network error during upload. Please check if the server is running.');
        });
        
        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error('Upload response error:', uploadResponse.status, errorText);
            throw new Error(`Upload failed with status ${uploadResponse.status}`);
        }
        
        const uploadData = await uploadResponse.json();
        console.log('Upload response:', uploadData);
        
        if (!uploadData.success) {
            throw new Error(uploadData.error || 'Failed to upload resume');
        }
        
        updateProgress('Upload complete! Starting AI analysis...');
        
        // Analyze with AI
        console.log('Starting AI analysis for:', uploadData.data.filename);
        const analysisResponse = await fetch('/api/resumes/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                filename: uploadData.data.filename,
                companySlug: selectedCompanyForAnalysis || 'google'
            })
        }).catch(err => {
            console.error('Analysis fetch error:', err);
            throw new Error('Network error during analysis. Please check if the server is running.');
        });
        
        if (!analysisResponse.ok) {
            const errorText = await analysisResponse.text();
            console.error('Analysis response error:', analysisResponse.status, errorText);
            throw new Error(`Analysis failed with status ${analysisResponse.status}`);
        }
        
        const analysisData = await analysisResponse.json();
        console.log('Analysis complete!');
        
        if (!analysisData.success) {
            throw new Error(analysisData.error || 'Failed to analyze resume');
        }
        
        // Display results
        displayAnalysisResults(analysisData.data);
        
        // Close upload modal
        closeModal('upload');
        
        // Reset form
        uploadedResume = null;
        selectedCompanyForAnalysis = null;
        document.getElementById('resumeUploadForm').reset();
        document.getElementById('selectedFileName').textContent = '';
        document.getElementById('analyzeBtn').disabled = true;
        
    } catch (error) {
        console.error('Analysis error:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        closeModal('analysis');
        
        let errorMessage = 'Failed to analyze resume. ';
        if (error.message.includes('Network error') || error.message.includes('Failed to fetch')) {
            errorMessage += 'Cannot connect to server. Please make sure the server is running (node server.js).';
        } else if (error.message.includes('timeout')) {
            errorMessage += 'Request timed out. The AI analysis is taking longer than expected. Please try again.';
        } else {
            errorMessage += error.message;
        }
        
        alert(errorMessage);
    }
}

function displayAnalysisResults(data) {
    const { company, analysis, atsAnalysis } = data;
    
    const html = `
        <div class="analysis-header">
            <h2>📊 Resume Analysis Results</h2>
            ${company ? `<div class="company-badge">Tailored for ${company.name}</div>` : ''}
        </div>
        
        <div class="score-display">
            <div>
                <div class="score-circle">
                    <svg width="150" height="150">
                        <circle cx="75" cy="75" r="65" stroke="rgba(255,255,255,0.1)" stroke-width="10" fill="none"/>
                        <circle cx="75" cy="75" r="65" stroke="url(#gradient)" stroke-width="10" fill="none"
                            stroke-dasharray="${2 * Math.PI * 65}" 
                            stroke-dashoffset="${2 * Math.PI * 65 * (1 - analysis.overallScore / 100)}"
                            transform="rotate(-90 75 75)"/>
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#00d9ff;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#7000ff;stop-opacity:1" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div class="score-value">${analysis.overallScore}</div>
                </div>
                <div class="score-label">Overall Score</div>
            </div>
            
            ${atsAnalysis ? `
            <div>
                <div class="score-circle">
                    <svg width="150" height="150">
                        <circle cx="75" cy="75" r="65" stroke="rgba(255,255,255,0.1)" stroke-width="10" fill="none"/>
                        <circle cx="75" cy="75" r="65" stroke="#4caf50" stroke-width="10" fill="none"
                            stroke-dasharray="${2 * Math.PI * 65}" 
                            stroke-dashoffset="${2 * Math.PI * 65 * (1 - atsAnalysis.atsScore / 100)}"
                            transform="rotate(-90 75 75)"/>
                    </svg>
                    <div class="score-value">${atsAnalysis.atsScore}</div>
                </div>
                <div class="score-label">ATS Score</div>
            </div>
            ` : ''}
        </div>
        
        ${analysis.strengths && analysis.strengths.length > 0 ? `
        <div class="analysis-section">
            <h3><span class="section-icon">💪</span> Your Strengths</h3>
            <div class="strengths-list">
                ${analysis.strengths.map(strength => `
                    <div class="strength-item">✓ ${strength}</div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        ${analysis.improvements && analysis.improvements.length > 0 ? `
        <div class="analysis-section">
            <h3><span class="section-icon">🎯</span> Improvements Needed</h3>
            ${analysis.improvements.map(item => `
                <div class="improvement-item ${item.priority}-priority">
                    <div class="improvement-header">
                        <div class="improvement-category">${item.category}</div>
                        <div class="priority-badge ${item.priority}">${item.priority} Priority</div>
                    </div>
                    <div class="improvement-issue"><strong>Issue:</strong> ${item.issue}</div>
                    <div class="improvement-suggestion">💡 ${item.suggestion}</div>
                </div>
            `).join('')}
        </div>
        ` : ''}
        
        ${analysis.companySpecific && analysis.companySpecific.length > 0 ? `
        <div class="analysis-section">
            <h3><span class="section-icon">🎯</span> ${company ? company.name + ' Specific' : 'Company-Specific'} Suggestions</h3>
            ${analysis.companySpecific.map(item => `
                <div class="company-specific-item">
                    <div class="company-specific-point">→ ${item.point}</div>
                    <div class="company-specific-reason">${item.reason}</div>
                </div>
            `).join('')}
        </div>
        ` : ''}
        
        ${analysis.keywordSuggestions && analysis.keywordSuggestions.length > 0 ? `
        <div class="analysis-section">
            <h3><span class="section-icon">🔑</span> Keywords to Add</h3>
            <div class="keywords-container">
                ${analysis.keywordSuggestions.map(keyword => `
                    <div class="keyword-tag">${keyword}</div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        ${analysis.formattingTips && analysis.formattingTips.length > 0 ? `
        <div class="analysis-section">
            <h3><span class="section-icon">✨</span> Formatting Tips</h3>
            <ul style="list-style: none; padding: 0;">
                ${analysis.formattingTips.map(tip => `
                    <li style="padding: 8px 0; color: var(--text-secondary);">📝 ${tip}</li>
                `).join('')}
            </ul>
        </div>
        ` : ''}
        
        ${analysis.summaryRecommendation ? `
        <div class="analysis-section">
            <h3><span class="section-icon">📝</span> Summary</h3>
            <div class="summary-box">
                ${analysis.summaryRecommendation}
            </div>
        </div>
        ` : ''}
        
        <div style="text-align: center; margin-top: 2rem;">
            <button class="btn btn-primary" onclick="closeModal('analysis'); openModal('upload')">
                📄 Analyze Another Resume
            </button>
        </div>
    `;
    
    document.getElementById('analysisResults').innerHTML = html;
}

