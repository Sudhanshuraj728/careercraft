// Professional Notification System
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `toast-notification toast-${type}`;
    
    const icons = {
        success: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg>',
        error: '✕',
        info: 'ℹ',
        warning: '⚠'
    };
    
    notification.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-message">${message}</div>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

function showConfirmDialog(title, message, onConfirm, onCancel) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 450px;">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">
                    <img src="https://api.iconify.design/mdi:close.svg?color=%23a0a0a0" width="24" height="24" alt="Close">
                </button>
            </div>
            <div class="modal-body" style="padding: 20px;">
                <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 24px;">${message}</p>
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button class="btn" id="cancelBtn" style="background: #6c757d;">Cancel</button>
                    <button class="btn btn-primary" id="confirmBtn">Confirm</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('#confirmBtn').onclick = () => {
        modal.remove();
        if (onConfirm) onConfirm();
    };
    
    modal.querySelector('#cancelBtn').onclick = () => {
        modal.remove();
        if (onCancel) onCancel();
    };
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
            if (onCancel) onCancel();
        }
    };
}

// Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId + 'Modal');
    if (modal) {
        if (modalId === 'subscription') {
            const subtitle = modal.querySelector('.subscription-subtitle');
            if (subtitle) {
                subtitle.textContent = subscriptionPromptMessage || defaultSubscriptionSubtitle;
            }
        }
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId + 'Modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';

        if (modalId === 'subscription') {
            subscriptionPromptMessage = null;
        }
    }
}

function switchModal(closeId, openId) {
    closeModal(closeId);
    setTimeout(() => openModal(openId), 300);
}

function openResumeUploadModal(options = {}) {
    const { closeModalId = null, title = null } = options;

    if (!currentUser) {
        if (closeModalId) {
            closeModal(closeModalId);
        }
        showNotification('Please sign in to upload and analyze resumes.', 'info');
        setTimeout(() => openModal('signin'), 300);
        return;
    }

    if (closeModalId) {
        closeModal(closeModalId);
    }

    setTimeout(() => {
        openModal('upload');

        if (title) {
            const uploadModal = document.getElementById('uploadModal');
            const modalTitle = uploadModal ? uploadModal.querySelector('h2') : null;
            if (modalTitle) {
                modalTitle.textContent = title;
            }
        }
    }, 300);
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
        showConfirmDialog(
            'LinkedIn Connected',
            'Your LinkedIn account is already linked. Would you like to unlink it?',
            () => unlinkLinkedIn(),
            null
        );
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
            showNotification('LinkedIn unlinked successfully!', 'success');
            await checkAuthStatus(); // Refresh user data
        } else {
            showNotification('Failed to unlink LinkedIn. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Unlink error:', error);
        showNotification('Error unlinking LinkedIn. Please try again.', 'error');
    }
}

// Auth State Management
let currentUser = null;
let subscriptionStatus = null;
const defaultSubscriptionSubtitle = "You've reached your free view limit!";
let subscriptionPromptMessage = null;

function hasPremiumAccess() {
    return Boolean(
        (subscriptionStatus && subscriptionStatus.isPremium) ||
        (currentUser && (currentUser.isPremium || currentUser.subscriptionPlan === 'premium'))
    );
}

function setSubscriptionPrompt(message) {
    subscriptionPromptMessage = message || defaultSubscriptionSubtitle;

    const subtitle = document.querySelector('#subscriptionModal .subscription-subtitle');
    if (subtitle) {
        subtitle.textContent = subscriptionPromptMessage;
    }
}

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
    
    // Don't show banner if user is not logged in
    if (!currentUser) {
        banner.style.display = 'none';
        return;
    }
    
    if (!subscriptionStatus || subscriptionStatus.plan === 'premium') {
        banner.style.display = 'none';
        return;
    }
    
    const remaining = subscriptionStatus.remaining;
    
    if (typeof remaining === 'number') {
        remainingViews.textContent = remaining;
        
        // Remove old classes
        banner.classList.remove('warning', 'danger');
        
        if (remaining === 0) {
            banner.style.display = 'flex';
            banner.classList.add('danger');
            document.querySelector('.banner-text').innerHTML = '<strong>No free resume analyses remaining!</strong> Upgrade to continue';
        } else if (remaining <= 3) {
            banner.style.display = 'flex';
            banner.classList.add('warning');
            document.querySelector('.banner-text').innerHTML = `<strong id="remainingViews">${remaining}</strong> free resume analyses remaining`;
        } else {
            banner.style.display = 'flex';
            document.querySelector('.banner-text').innerHTML = `<strong id="remainingViews">${remaining}</strong> free resume analyses remaining`;
        }
    }
}

// Show notification with animation after resume analysis
function showAnalysisCountNotification(remaining) {
    const banner = document.getElementById('subscriptionBanner');
    
    // Add shake animation
    banner.style.animation = 'none';
    setTimeout(() => {
        banner.style.animation = 'slideDown 0.5s ease-out, shake 0.5s ease-in-out 0.5s';
    }, 10);
    
    // Show notification
    const message = remaining === 0 
        ? 'You\'ve used all your free analyses! Upgrade to continue.' 
        : `Analysis complete! ${remaining} free ${remaining === 1 ? 'analysis' : 'analyses'} remaining.`;
    
    showNotification(message, remaining === 0 ? 'error' : 'success');
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

    // Refresh premium status after auth changes
    checkSubscriptionStatus();
}

function updateLinkedInButton(user) {
    const linkedinBtn = document.getElementById('linkedinBtn');
    const linkedinBtnText = document.getElementById('linkedinBtnText');
    
    if (!linkedinBtn) return;
    
    if (user && user.linkedinProfile && user.linkedinProfile.linkedAt) {
        // LinkedIn is linked - show as linked with checkmark
        linkedinBtn.style.background = 'linear-gradient(135deg, #059669 0%, #10b981 100%)';
        linkedinBtnText.innerHTML = 'LinkedIn Linked';
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
    subscriptionStatus = null;
    updateSubscriptionBanner();
    
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
            showNotification(`Welcome, ${data.user.name}! Your account has been created.`, 'success');
            
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
            showNotification(`Welcome back, ${data.user.name}!`, 'success');
            
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
            showNotification('You have been logged out successfully.', 'success');
        } else {
            showNotification('Logout failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Logout failed. Please try again.', 'error');
    }
}

// Check auth status on page load
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuthStatus();
    await checkSubscriptionStatus();
    
    // Check URL parameters for OAuth redirects
    const urlParams = new URLSearchParams(window.location.search);
    
    // Google OAuth success
    if (urlParams.get('login') === 'success') {
        window.history.replaceState({}, document.title, window.location.pathname);
        await checkAuthStatus();
        if (currentUser) {
            showNotification(`Welcome, ${currentUser.name}! You've successfully signed in with Google.`, 'success');
        }
    }
    
    // LinkedIn OAuth success
    if (urlParams.get('linkedin') === 'success') {
        window.history.replaceState({}, document.title, window.location.pathname);
        await checkAuthStatus();
        if (currentUser) {
            showNotification(`Welcome, ${currentUser.name}! You've successfully signed in with LinkedIn.`, 'success');
        }
    }
    
    // LinkedIn linked to existing account
    if (urlParams.get('linkedin') === 'linked') {
        window.history.replaceState({}, document.title, window.location.pathname);
        await checkAuthStatus();
        showNotification('LinkedIn linked successfully! Your profile has been connected.', 'success');
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
                errorMessage = 'LinkedIn Integration Not Set Up\n\n' +
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
            showNotification(errorMessage, 'error');
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
        showNotification(`${files.length} file(s) selected`, 'success');
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
            <div style="font-size: 40px; margin-bottom: 10px;"><svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div>
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
        
        if (data.success && data.data) {
            
            displayCompanyModal(data.data);
        } else {
            showNotification(data.error || 'Company details not found.', 'error');
        }
    } catch (error) {
        console.error('Error fetching company details:', error);
        showNotification('Failed to load company details. Please try again.', 'error');
    }
}

// Show subscription limit modal
function showSubscriptionLimitModal(data) {
    closeModal('company');
    hideSuggestions();
    
    setSubscriptionPrompt(data?.message || defaultSubscriptionSubtitle);
    openModal('subscription');
}

function showPremiumUpgradePrompt(message) {
    setSubscriptionPrompt(message || 'Upgrade to Premium to unlock this feature.');
    openModal('subscription');
}

// Handle premium upgrade
function handleUpgrade() {
    // Check if user is logged in
    if (!currentUser) {
        closeModal('subscription');
        showNotification('Please sign in to upgrade to Premium.', 'info');
        setTimeout(() => openModal('signin'), 300);
        return;
    }
    
    // Open payment flow
    showUpgradePaymentFlow();
}

/**
 * Show payment flow for premium upgrade
 * This handles the entire upgrade process:
 * 1. Initiate payment order
 * 2. Collect payment details (in production: Razorpay, Stripe, etc.)
 * 3. Confirm payment and activate premium
 */
async function showUpgradePaymentFlow() {
    try {
        // Step 1: Initiate upgrade to get order details
        const initiateResponse = await fetch('/api/subscription/initiate-upgrade', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        
        const initiateData = await initiateResponse.json();
        
        if (!initiateData.success) {
            // User might already be premium
            if (initiateData.code === 'ALREADY_PREMIUM') {
                showNotification(
                    `You're already a premium member! Premium active until ${new Date(initiateData.data?.premiumEndDate).toLocaleDateString()}`,
                    'info'
                );
                closeModal('subscription');
                return;
            }
            
            showNotification(initiateData.error || 'Failed to initiate upgrade', 'error');
            return;
        }
        
        const orderData = initiateData.data;
        
        // Step 2: Show payment dialog
        showPaymentDialog(orderData);
        
    } catch (error) {
        console.error('Upgrade initiation error:', error);
        showNotification('Failed to initiate upgrade. Please try again.', 'error');
    }
}

/**
 * Show payment dialog for demo or real payment gateway integration
 */
function showPaymentDialog(orderData) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.display = 'flex';
    modal.id = 'paymentModal';
    
    const daysRemaining = Math.ceil(orderData.amount / 14900 * 30); // Calculate days based on amount
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);">
            <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">
                <img src="https://api.iconify.design/mdi:close.svg?color=%23a0a0a0" width="24" height="24" alt="Close">
            </button>
            
            <div class="modal-header">
                <h2 style="color: #00d9ff;">Complete Your Upgrade</h2>
                <p style="color: #888;">Secure payment process</p>
            </div>
            
            <div class="modal-body" style="padding: 30px;">
                <!-- Order Summary -->
                <div style="background: rgba(0, 217, 255, 0.1); border: 1px solid rgba(0, 217, 255, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                        <span style="color: #b4b4c5;">Premium Plan (30 days)</span>
                        <span style="color: #00d9ff; font-weight: 600;">₹${(orderData.amount / 100).toFixed(2)}</span>
                    </div>
                    <div style="border-top: 1px solid rgba(0, 217, 255, 0.2); padding-top: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #00ff88; font-weight: 600;">Total</span>
                            <span style="font-size: 1.3rem; color: #00d9ff; font-weight: bold;">₹${(orderData.amount / 100).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Benefits Reminder -->
                <div style="margin-bottom: 24px;">
                    <h4 style="margin: 0 0 12px 0; color: #e0e0e0;">You'll get:</h4>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        ${orderData.planDetails.features.map(feature => `
                            <li style="padding: 6px 0; color: #b4b4c5;">
                                <span style="color: #00ff88; margin-right: 8px;">✓</span> ${feature}
                            </li>
                        `).join('')}
                    </ul>
                </div>
                
                <!-- Payment Methods -->
                <div style="margin-bottom: 24px;">
                    <h4 style="margin: 0 0 12px 0; color: #e0e0e0;">Payment Method</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <button class="payment-method-btn selected" onclick="selectPaymentMethod(this, 'card')" style="background: rgba(0, 217, 255, 0.2); border: 2px solid #00d9ff; padding: 12px; border-radius: 8px; color: #00d9ff; cursor: pointer; font-weight: 600;">
                            💳 Card
                        </button>
                        <button class="payment-method-btn" onclick="selectPaymentMethod(this, 'upi')" style="background: rgba(100, 100, 120, 0.2); border: 2px solid #666; padding: 12px; border-radius: 8px; color: #b4b4c5; cursor: pointer; font-weight: 600;">
                            📱 UPI
                        </button>
                    </div>
                </div>
                
                <!-- Card Details (Demo) -->
                <div id="cardDetails" style="display: block; margin-bottom: 24px;">
                    <h4 style="margin: 0 0 12px 0; color: #e0e0e0;">Card Details (Demo)</h4>
                    <input type="text" placeholder="4532 1234 5678 9010" style="width: 100%; padding: 10px; background: #1a1a2e; border: 1px solid #333; border-radius: 6px; color: #e0e0e0; margin-bottom: 10px; font-family: monospace;">
                    <input type="text" placeholder="MM/YY" style="width: 48%; padding: 10px; background: #1a1a2e; border: 1px solid #333; border-radius: 6px; color: #e0e0e0; margin-right: 4%; font-family: monospace;">
                    <input type="text" placeholder="CVV" style="width: 48%; padding: 10px; background: #1a1a2e; border: 1px solid #333; border-radius: 6px; color: #e0e0e0; font-family: monospace;">
                    <p style="color: #888; font-size: 12px; margin-top: 8px;">
                        🔒 This is a demo. Use any card details. In production, PCI-compliant payment gateway will be used.
                    </p>
                </div>
                
                <!-- Buttons -->
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                        Cancel
                    </button>
                    <button class="btn btn-primary" onclick="confirmPaymentDemo('${orderData.orderId}')" id="payBtn">
                        <span id="payBtnText">💳 Pay ₹${(orderData.amount / 100).toFixed(2)}</span>
                    </button>
                </div>
                
                <p style="color: #666; font-size: 12px; text-align: center; margin-top: 16px;">
                    Safe & Secure • SSL Encrypted
                </p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on overlay click
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

function selectPaymentMethod(btn, method) {
    document.querySelectorAll('.payment-method-btn').forEach(b => {
        b.style.background = 'rgba(100, 100, 120, 0.2)';
        b.style.borderColor = '#666';
        b.style.color = '#b4b4c5';
    });
    
    btn.style.background = 'rgba(0, 217, 255, 0.2)';
    btn.style.borderColor = '#00d9ff';
    btn.style.color = '#00d9ff';
    btn.classList.add('selected');
}

/**
 * Confirm demo payment and activate premium
 */
async function confirmPaymentDemo(orderId) {
    try {
        const payBtn = document.getElementById('payBtn');
        const payBtnText = document.getElementById('payBtnText');
        const originalText = payBtnText.innerHTML;
        
        // Show loading
        payBtn.disabled = true;
        payBtnText.innerHTML = '<span style="opacity: 0.6;">Processing...</span>';
        
        // Simulate payment processing (1-2 seconds)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Step 3: Confirm upgrade with payment details
        const confirmResponse = await fetch('/api/subscription/confirm-upgrade', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                paymentId: `DEMO_PAY_${Date.now()}`,
                orderId: orderId,
                signature: 'demo-signature'
            })
        });
        
        const confirmData = await confirmResponse.json();
        
        if (confirmData.success) {
            // Close payment modal
            const paymentModal = document.getElementById('paymentModal');
            if (paymentModal) paymentModal.remove();
            
            // Close subscription modal
            closeModal('subscription');
            
            // Update subscription status
            await checkSubscriptionStatus();
            
            // Show success notification
            showNotification('✨ Welcome to Premium! Enjoy unlimited access.', 'success');
            
            // Refresh page data if needed
            setTimeout(() => {
                location.reload();
            }, 2000);
        } else {
            payBtn.disabled = false;
            payBtnText.innerHTML = originalText;
            showNotification(confirmData.error || 'Payment failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Payment confirmation error:', error);
        payBtn.disabled = false;
        payBtnText.innerHTML = originalText;
        showNotification('Payment failed. Please try again.', 'error');
    }
}

// Upgrade to premium (legacy - kept for backward compatibility)
async function upgradeToPremium() {
    showUpgradePaymentFlow();
}

// Display company details in modal
function displayCompanyModal(company) {
    const companyDetails = document.getElementById('companyDetails');
    const isLocked = Boolean(company.premiumLocked);
    const upgradeMessage = company.upgradeMessage || 'Upgrade to Premium to unlock full company details, features, and benefits.';
    
    companyDetails.innerHTML = `
        <div class="company-header">
            <div class="company-icon-large">
                ${company.name.substring(0, 2).toUpperCase()}
            </div>
            <div class="company-header-info">
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <h2 style="margin: 0;">${company.name}</h2>
                    ${isLocked ? '<span class="plan-badge popular" style="background: linear-gradient(135deg, #f59e0b, #f97316);">Premium Locked</span>' : ''}
                </div>
                <p class="company-meta">
                    ${company.industry} • ${company.size} employees • ${company.location}
                </p>
                ${company.founded ? `<p class="company-founded">Founded: ${company.founded}</p>` : ''}
            </div>
        </div>

        ${isLocked ? `
        <div class="company-section" style="border: 1px solid rgba(245, 158, 11, 0.35); background: rgba(245, 158, 11, 0.08);">
            <h3><span class="section-icon">🔒</span> Premium Company Insights Locked</h3>
            <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 16px;">${upgradeMessage}</p>
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="handleUpgrade()">Upgrade to Premium</button>
                <button class="btn btn-secondary" onclick="closeModal('company')">Maybe Later</button>
            </div>
        </div>
        ` : `
        <div class="company-description">
            <p>${company.description || 'No description available.'}</p>
        </div>
        
        ${company.features && company.features.length > 0 ? `
            <div class="company-section">
                <h3>Company Features & Benefits</h3>
                <div class="features-grid">
                    ${company.features.map(feature => `
                        <div class="feature-item">
                            <span class="feature-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#00ff88"/></svg></span>
                            <span>${feature}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
        `}
        
        ${company.jobs && company.jobs.length > 0 ? `
            <div class="company-section">
                <h3><svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2"/><path d="M8 2v4M16 2v4M4 10h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Open Positions (${company.jobs.length})</h3>
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
                                Check Resume Compatibility
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : `
            <div class="company-section">
                <h3><svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="display: inline-block; margin-right: 6px; vertical-align: middle;"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2"/><path d="M8 2v4M16 2v4M4 10h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Open Positions</h3>
                <p class="no-jobs">No positions currently available. Check back soon!</p>
            </div>
        `}
        
        <div class="company-actions">
            <button class="btn btn-secondary" onclick="closeModal('company')">
                Close
            </button>
            <button class="btn btn-primary" onclick="openResumeUploadModal({ closeModalId: 'company', title: 'AI-Powered Resume Analysis' })">
                Upload Resume for ${company.name}
            </button>
            ${isLocked ? '<button class="btn btn-primary" onclick="handleUpgrade()">Unlock Full Details</button>' : ''}
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
    openResumeUploadModal({
        closeModalId: 'company',
        title: `Apply for ${jobTitle} at ${companyName}`
    });
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
        showNotification('Thank you for your message! We will get back to you soon.', 'success');
        contactForm.reset();
    });
}

// Note: Auth form handlers (signin/signup) are defined as handleSignIn() and handleSignUp()
// and attached via onsubmit attributes in the HTML. Do not add duplicate listeners here.

// Upload form handler
document.querySelectorAll('.upload-form').forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        showNotification('Resume uploaded successfully! Your profile has been updated.', 'success');
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

console.log('CareerCraft initialized successfully!');

// Smooth Scroll Animation for All Sections
function initSectionAnimations() {
    const sections = document.querySelectorAll('section');
    
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-visible');
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        sectionObserver.observe(section);
    });
    
    // Make hero section immediately visible
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroSection.classList.add('section-visible');
    }
}

// Smooth scroll to any section
function smoothScrollToSection(sectionId) {
    const section = document.querySelector(sectionId);
    if (section) {
        const navHeight = 80; // navbar height
        const targetPosition = section.offsetTop - navHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Show Templates Section when clicked
function showTemplates(event) {
    event.preventDefault();
    const templatesSection = document.querySelector('.templates-section');
    if (templatesSection) {
        templatesSection.classList.add('active');
    }
    smoothScrollToSection('#templates');
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
    // Template URL mapping to actual HTML files
    const templates = {
        'data-pro': '/templates/data-analyst-template.html',
        'analytics-expert': '/templates/data-analyst-template.html',
        'dev-portfolio': '/templates/software-developer-template.html',
        'marketing-maven': '/templates/marketing-template.html',
        'design-studio': '/templates/designer-template.html',
        'bi-specialist': '/templates/data-analyst-template.html'
    };
    
    const templateUrl = templates[templateName];
    
    if (templateUrl) {
        // Open template in new tab so users can view and save/print it
        window.open(templateUrl, '_blank');
        showNotification('Template opened! You can now save it as PDF or print it.', 'success');
    } else {
        showNotification('Template not found. Please try again.', 'error');
    }
}

// Initialize template cards animation on load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize section scroll animations
    initSectionAnimations();
    
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
    
    // Add smooth scroll to all nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '#home') {
                e.preventDefault();
                smoothScrollToSection(href);
            }
        });
    });
    
    // Initialize resume upload functionality
    initializeResumeUpload();
    
    // Initialize contact form
    initializeContactForm();
});

// Contact form handler
function initializeContactForm() {
    // Wait a bit to ensure DOM is fully loaded
    setTimeout(() => {
        const form = document.getElementById('contactForm');
        
        if (!form) {
            console.error('Contact form not found');
            return;
        }
        
        // Contact form initialized
        
        // Add input listeners to track typing
        const nameInput = form.querySelector('[name="contactName"]');
        const emailInput = form.querySelector('[name="contactEmail"]');
        const messageInput = form.querySelector('[name="contactMessage"]');
        
        if (nameInput) {
            nameInput.addEventListener('input', (e) => {
                // Name input event
            });
        }
        
        if (emailInput) {
            emailInput.addEventListener('input', (e) => {
                // Email input event
            });
        }
        
        if (messageInput) {
            messageInput.addEventListener('input', (e) => {
                // Message input event
            });
        }
        
        // Intercept button click instead of form submit
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Read values immediately on button click
                const nameValue = nameInput ? nameInput.value.trim() : '';
                const emailValue = emailInput ? emailInput.value.trim() : '';
                const messageValue = messageInput ? messageInput.value.trim() : '';
                
                // Validate form values before submission
                
                await handleContactSubmit(e, nameValue, emailValue, messageValue, form);
            });
        }
    }, 500);
}

async function handleContactSubmit(event, name, email, message, form) {
    console.log('Processing submission with values:', { name, email, message });
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const successDiv = document.getElementById('contactSuccess');
    
    // Validate
    if (name.length < 2) {
        showNotification('Please enter your name (at least 2 characters)', 'warning');
        form.querySelector('[name="contactName"]').focus();
        return;
    }
    
    if (!email.includes('@')) {
        showNotification('Please enter a valid email address', 'warning');
        form.querySelector('[name="contactEmail"]').focus();
        return;
    }
    
    if (message.length < 10) {
        showNotification('Please enter a message (at least 10 characters)', 'warning');
        form.querySelector('[name="contactMessage"]').focus();
        return;
    }
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, message })
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Server response:', data);
        
        if (data.success) {
            // Show success notification
            showNotification('Thank you! Your message has been sent successfully.', 'success');
            
            // Clear form
            form.reset();
            
            console.log('Message sent successfully!');
        } else {
            showNotification(data.error || 'Failed to send message', 'error');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        showNotification('Network error. Please check your connection and try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
    }
}

// Resume upload and analysis functionality
let uploadedResume = null;
let selectedCompanyForAnalysis = null;

function initializeResumeUpload() {
    const fileInput = document.getElementById('modalFileInput');
    const uploadBox = document.getElementById('uploadBoxModal');
    const browseBtn = document.getElementById('browseFilesBtn');
    const form = document.getElementById('resumeUploadForm');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const fileNameDisplay = document.getElementById('selectedFileName');
    const companyInput = document.getElementById('targetCompanyInput');
    
    if (!fileInput || !uploadBox || !form) return;
    
    // Browse button click - prevent event bubbling
    if (browseBtn) {
        browseBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering uploadBox click
            fileInput.click();
        });
    }
    
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
    // Check if user is authenticated
    if (!currentUser) {
        showNotification('Please log in to upload and analyze resumes.', 'warning');
        return;
    }
    
    // Validate file type - accept PDF and image formats
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'];
    const fileName = file.name.toLowerCase();
    const isValidFile = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidFile) {
        showNotification('Please upload a PDF or image file (JPG, PNG, etc.)', 'error');
        return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('File size must be less than 5MB', 'error');
        return;
    }
    
    uploadedResume = file;
    fileNameDisplay.textContent = `${file.name}`;
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
    // Check if user is authenticated
    if (!currentUser) {
        showNotification('Please log in to analyze resumes.', 'warning');
        return;
    }
    
    if (!uploadedResume) {
        showNotification('Please select a resume file first.', 'warning');
        return;
    }
    
    try {
        // Show loading modal
        openModal('analysis');
        const analysisResults = document.getElementById('analysisResults');
        analysisResults.innerHTML = renderAnalysisLoading();
        
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
            // Check if it's a subscription limit issue
            if (analysisResponse.status === 403 && analysisData.requiresSubscription) {
                closeModal('analysis');
                showSubscriptionLimitModal(analysisData);
                return;
            }
            throw new Error(analysisData.error || 'Failed to analyze resume');
        }
        
        // Update subscription status if provided
        if (analysisData.subscription) {
            subscriptionStatus = analysisData.subscription;
            updateSubscriptionBanner();
            
            // Show animated notification for remaining analyses
            showAnalysisCountNotification(analysisData.subscription.remaining);
        }
        
        // Display results
        renderAnalysisResults(analysisData.data);
        
        // Fetch LinkedIn profiles for the company only for premium users
        if (analysisData.data.company) {
            if (hasPremiumAccess()) {
                fetchCompanyEmployees(analysisData.data.company.name);
            } else {
                renderLockedLinkedInSection(
                    analysisData.data.company.name,
                    'Upgrade to Premium to view LinkedIn employee insights for this company.'
                );
            }
        }
        
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
        
        const errorMessage = error.message || 'Unable to analyze resume at this time.';
        const analysisResults = document.getElementById('analysisResults');
        if (analysisResults) {
            analysisResults.innerHTML = renderAnalysisError(errorMessage);
        }
        
        showNotification(errorMessage, 'error');
    }
}

function escapeHtml(input) {
    const text = String(input || '');
    return text.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function renderAnalysisLoading() {
    return `
        <div class="analysis-loading">
            <div class="loader"></div>
            <p>AI is analyzing your resume...</p>
            <p class="loading-subtext">This may take up to 30 seconds</p>
            <p id="progressStatus" class="loading-subtext">Starting...</p>
        </div>
    `;
}

function renderAnalysisError(message) {
    return `
        <div class="analysis-error-state">
            <strong>Analysis failed</strong>
            <p>${escapeHtml(message)}</p>
        </div>
    `;
}

function formatList(items, emptyText) {
    const listItems = Array.isArray(items) ? items : [];
    if (!listItems.length) {
        return `<p class="analysis-empty-state">${escapeHtml(emptyText)}</p>`;
    }
    return `
        <ul class="analysis-list">
            ${listItems.map(item => `<li>${escapeHtml(typeof item === 'string' ? item : (item.issue || item.suggestion || JSON.stringify(item)))}</li>`).join('')}
        </ul>
    `;
}

function renderPillList(items) {
    const listItems = Array.isArray(items) ? items : [];
    if (!listItems.length) return '';
    return `
        <div class="analysis-pill-list">
            ${listItems.map(item => `<span class="analysis-pill">${escapeHtml(item)}</span>`).join('')}
        </div>
    `;
}

function renderScoreCard(title, score, subtitle) {
    return `
        <div class="analysis-card score-card">
            <div class="card-heading"><h3>${escapeHtml(title)}</h3></div>
            <div class="score-visual">
                <div class="score-circle-small">
                    <div class="score-value-small">${Math.round(score || 0)}</div>
                </div>
                <div>
                    <div class="score-meta">${escapeHtml(subtitle)}</div>
                    <div class="ats-score-bar"><div class="ats-score-fill" style="width:${Math.round(score || 0)}%"></div></div>
                </div>
            </div>
        </div>
    `;
}

function renderSectionCard(title, content, icon = '') {
    return `
        <div class="analysis-card">
            <div class="card-heading"><h3>${icon}${escapeHtml(title)}</h3></div>
            ${content}
        </div>
    `;
}

function renderSectionDetail(title, rows) {
    if (!rows || !rows.length) {
        return `<p class="analysis-empty-state">No details available.</p>`;
    }

    return rows.map(row => `
        <div class="detail-row">
            <span class="detail-label">${escapeHtml(row.label)}</span>
            <span class="detail-value">${escapeHtml(row.value)}</span>
        </div>
    `).join('');
}

function renderAnalysisResults(data) {
    const { company, analysis, atsAnalysis } = data;
    const result = analysis || {};
    const sections = result.sections || {};
    const atsSection = sections.ats || {
        score: atsAnalysis?.atsScore ?? 0,
        currentIssues: [],
        suggestedImprovements: []
    };
    const overallScore = Math.round(result.overallScore || 0);
    const summaryText = result.summaryRecommendation || 'Here is your resume evaluation. Use the section cards below to review issues and improvements.';

    const headerSection = sections.header || {};
    const skillsSection = sections.skills || {};
    const experienceSection = sections.experience || {};
    const educationSection = sections.education || {};
    const formattingSection = sections.formatting || {};

    const skillGroups = [];
    if (skillsSection.technicalSkills) {
        Object.entries(skillsSection.technicalSkills).forEach(([group, items]) => {
            if (items && items.length) {
                skillGroups.push(`<div><strong>${escapeHtml(group)}</strong>${renderPillList(items)}</div>`);
            }
        });
    }
    if (skillsSection.toolsAndTechnologies) {
        Object.entries(skillsSection.toolsAndTechnologies).forEach(([group, items]) => {
            if (items && items.length) {
                skillGroups.push(`<div><strong>${escapeHtml(group)}</strong>${renderPillList(items)}</div>`);
            }
        });
    }

    const html = `
        <div class="analysis-dashboard">
            <div class="analysis-header">
                <h2>Resume Analysis Results</h2>
                ${company ? `<div class="company-badge">Tailored for ${escapeHtml(company.name)}</div>` : ''}
            </div>

            <div class="analysis-top-grid">
                ${renderScoreCard('ATS Score', atsSection.score, 'Match against applicant tracking systems')}
                ${renderScoreCard('Overall Resume Score', overallScore, 'Match based on skills, structure, and content quality')}
            </div>

            <div class="analysis-summary-card">
                <h3>Recommendation</h3>
                <p>${escapeHtml(summaryText)}</p>
            </div>

            <div class="analysis-comparison-grid">
                ${renderSectionCard('Current Resume Issues', formatList(result.currentIssues, 'No current issues detected.'))}
                ${renderSectionCard('Suggested Improvements', formatList(result.suggestedImprovements, 'No suggested improvements at this time.'))}
            </div>

            <div class="analysis-detail-grid">
                ${renderSectionCard('Header Suggestions', `
                    ${formatList(headerSection.currentIssues, 'Header looks clean.')}
                    ${formatList(headerSection.suggestedImprovements, 'No header suggestions. If your title or summary is missing, add it here.')}
                `, '<span class="section-icon">🧾</span>')}

                ${renderSectionCard('Skills Analysis', `
                    ${skillGroups.length ? skillGroups.join('') : '<p class="analysis-empty-state">No technical skills were detected in the structured analysis.</p>'}
                    ${skillsSection.missingRelevantSkills && skillsSection.missingRelevantSkills.length ? `<div class="section-subtitle">Skills to add</div>${renderPillList(skillsSection.missingRelevantSkills)}` : ''}
                    ${formatList(skillsSection.currentIssues, 'No skill issues detected.')}
                `, '<span class="section-icon">💡</span>')}

                ${renderSectionCard('Experience Analysis', `
                    ${renderSectionDetail('Experience details', [
                        { label: 'Bullet points', value: experienceSection.bulletPointCount ?? 0 },
                        { label: 'Metrics detected', value: experienceSection.metricsDetected ? 'Yes' : 'No' },
                        { label: 'Outdated tech', value: (experienceSection.outdatedTechnologies || []).join(', ') || 'None' }
                    ])}
                    ${formatList(experienceSection.currentIssues, 'No experience issues detected.')}
                    ${formatList(experienceSection.suggestedImprovements, 'No experience suggestions.')}
                `, '<span class="section-icon">🛠️</span>')}

                ${renderSectionCard('Education Suggestions', `
                    ${renderSectionDetail('Education details', [
                        { label: 'Degree', value: educationSection.degree || 'Not detected' },
                        { label: 'Institution', value: educationSection.institution || 'Not detected' },
                        { label: 'CGPA', value: educationSection.cgpa || 'Not listed' }
                    ])}
                    ${educationSection.certificationsSuggested && educationSection.certificationsSuggested.length ? `<div class="section-subtitle">Recommended certifications</div>${renderPillList(educationSection.certificationsSuggested)}` : ''}
                    ${formatList(educationSection.currentIssues, 'No education issues detected.')}
                `, '<span class="section-icon">🎓</span>')}

                ${renderSectionCard('Formatting Feedback', `
                    ${renderSectionDetail('Formatting checks', [
                        { label: 'Structured sections', value: formattingSection.checks?.hasStructure ? 'Yes' : 'No' },
                        { label: 'Bullet usage', value: formattingSection.checks?.hasBulletPoints ? 'Yes' : 'No' },
                        { label: 'Word count', value: formattingSection.checks?.wordCount ?? 0 },
                        { label: 'Line count', value: formattingSection.checks?.lineCount ?? 0 }
                    ])}
                    ${formatList(formattingSection.currentIssues, 'No formatting issues detected.')}
                    ${formatList(formattingSection.suggestedImprovements, 'No formatting suggestions.')}
                `, '<span class="section-icon">🧩</span>')}

                ${renderSectionCard('ATS Compatibility', `
                    <div class="section-subtitle">ATS fit score</div>
                    <div class="ats-score-bar"><div class="ats-score-fill" style="width:${Math.round(atsSection.score || 0)}%"></div></div>
                    <p class="score-meta">${Math.round(atsSection.score || 0)}/100</p>
                    ${formatList(atsSection.currentIssues, 'No ATS issues detected.')}
                    ${formatList(atsSection.suggestedImprovements, 'No ATS recommendations.')}
                `, '<span class="section-icon">✅</span>')}
            </div>
        </div>
    `;

    document.getElementById('analysisResults').innerHTML = html;
}

function renderLockedLinkedInSection(companyName, message) {
    const employeesSection = document.getElementById('linkedinEmployeesSection');

    if (!employeesSection) {
        return;
    }

    employeesSection.innerHTML = `
        <div class="analysis-section linkedin-connect-section" style="border: 1px solid rgba(245, 158, 11, 0.35); background: rgba(245, 158, 11, 0.08);">
            <h3><span class="section-icon">🔒</span> Connect with ${companyName} Employees</h3>
            <div class="linkedin-prompt">
                <div class="linkedin-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none"><rect x="4" y="5" width="16" height="14" rx="2" stroke="#f59e0b" stroke-width="2"/><path d="M8 11v6M8 8.5v.01M12 13v4M16 11v6M12 11a3 3 0 013-3" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/></svg>
                </div>
                <p><strong>${message}</strong></p>
                <p>Premium members can see employee profiles and networking suggestions for ${companyName}.</p>
                <button class="btn btn-primary" onclick="handleUpgrade()">Upgrade to Premium</button>
            </div>
        </div>
    `;
}

// Fetch and display LinkedIn profiles of company employees
async function fetchCompanyEmployees(companyName) {
    const employeesSection = document.getElementById('linkedinEmployeesSection');
    
    // Show loading state
    employeesSection.innerHTML = `
        <div class="analysis-section">
            <h3><span class="section-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="display: inline-block; vertical-align: middle;"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span> Connect with ${companyName} Employees on LinkedIn</h3>
            <div style="text-align: center; padding: 2rem;">
                <div class="loading-spinner"></div>
                <p>Searching for employees...</p>
            </div>
        </div>
    `;
    
    try {
        const response = await fetch(`/api/linkedin/company-employees/${encodeURIComponent(companyName)}`, {
            credentials: 'include'
        });
        
        const data = await response.json();

        if (response.status === 401 && data.requiresAuthentication) {
            renderLockedLinkedInSection(companyName, data.error || 'Please sign in to view LinkedIn employee insights.');
            return;
        }

        if (response.status === 403 && data.requiresSubscription) {
            renderLockedLinkedInSection(companyName, data.message || 'Upgrade to Premium to view LinkedIn employee insights.');
            return;
        }
        
        if (data.linkedinNotConnected) {
            // User hasn't connected LinkedIn
            employeesSection.innerHTML = `
                <div class="analysis-section linkedin-connect-section">
                    <h3><span class="section-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="display: inline-block; vertical-align: middle;"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span> Network with ${companyName} Employees</h3>
                    <div class="linkedin-prompt">
                        <div class="linkedin-icon"><svg width="64" height="64" viewBox="0 0 24 24" fill="none"><rect x="4" y="5" width="16" height="14" rx="2" stroke="#0077b5" stroke-width="2"/><path d="M8 11v6M8 8.5v.01M12 13v4M16 11v6M12 11a3 3 0 013-3" stroke="#0077b5" stroke-width="2" stroke-linecap="round"/></svg></div>
                        <p><strong>Connect your LinkedIn to see employee profiles!</strong></p>
                        <p>Get direct access to people working at ${companyName} to expand your network.</p>
                        <button class="btn btn-linkedin" onclick="linkLinkedIn()">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="margin-right: 8px;"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            Connect LinkedIn Account
                        </button>
                    </div>
                    ${displayNetworkingSuggestions(data.suggestions)}
                </div>
            `;
            return;
        }
        
        if (data.tokenExpired) {
            // LinkedIn token expired
            employeesSection.innerHTML = `
                <div class="analysis-section linkedin-connect-section">
                    <h3><span class="section-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="display: inline-block; vertical-align: middle;"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span> Network with ${companyName} Employees</h3>
                    <div class="linkedin-prompt">
                        <div class="linkedin-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L2 22h20L12 2z" stroke="#ff9800" stroke-width="2" fill="none"/>
                                <path d="M12 9v4M12 17h.01" stroke="#ff9800" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </div>
                        <p><strong>Your LinkedIn connection has expired</strong></p>
                        <p>Reconnect to see employee profiles and expand your network.</p>
                        <button class="btn btn-linkedin" onclick="linkLinkedIn()">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="margin-right: 8px;"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            Reconnect LinkedIn
                        </button>
                    </div>
                    ${displayNetworkingSuggestions(data.suggestions)}
                </div>
            `;
            return;
        }
        
        if (data.success && data.profiles && data.profiles.length > 0) {
            // Display employee profiles
            employeesSection.innerHTML = `
                <div class="analysis-section">
                    <h3><span class="section-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="display: inline-block; vertical-align: middle;"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span> ${companyName} Employees on LinkedIn</h3>
                    <div class="employees-grid">
                        ${data.profiles.map(profile => `
                            <div class="employee-card">
                                ${profile.pictureUrl ? `
                                    <img src="${profile.pictureUrl}" alt="${profile.name}" class="employee-avatar">
                                ` : `
                                    <div class="employee-avatar-placeholder">
                                        ${profile.name.charAt(0).toUpperCase()}
                                    </div>
                                `}
                                <div class="employee-info">
                                    <div class="employee-name">${profile.name}</div>
                                    <div class="employee-position">${profile.currentPosition || profile.headline}</div>
                                    ${profile.connectionDegree !== 'unknown' ? `
                                        <div class="connection-degree">${profile.connectionDegree}° connection</div>
                                    ` : ''}
                                </div>
                                <a href="${profile.profileUrl}" target="_blank" class="btn-connect">
                                    View Profile →
                                </a>
                            </div>
                        `).join('')}
                    </div>
                    ${displayNetworkingSuggestions(data.suggestions)}
                </div>
            `;
        } else {
            // No profiles found or API limitation
            employeesSection.innerHTML = `
                <div class="analysis-section">
                    <h3><span class="section-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="display: inline-block; vertical-align: middle;"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span> Network with ${companyName} Employees</h3>
                    <div class="info-message">
                        <p>Below are the networking options to connect with employees:</p>
                    </div>
                    ${displayNetworkingSuggestions(data.suggestions)}
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error fetching employees:', error);
        employeesSection.innerHTML = `
            <div class="analysis-section">
                <h3><span class="section-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="display: inline-block; vertical-align: middle;"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span> Network with ${companyName} Employees</h3>
                <div class="error-message">
                    <p>Unable to fetch employee profiles at the moment.</p>
                </div>
            </div>
        `;
    }
}

// Display networking suggestions
function displayNetworkingSuggestions(suggestions) {
    if (!suggestions || !suggestions.tips) return '';
    
    return `
        <div class="networking-tips">
            <h4>${suggestions.message}</h4>
            <div class="tips-grid">
                ${suggestions.tips.map(tip => `
                    <a href="${tip.action}" target="_blank" class="tip-card">
                        <div class="tip-icon">${tip.icon}</div>
                        <div class="tip-content">
                            <div class="tip-title">${tip.title}</div>
                            <div class="tip-description">${tip.description}</div>
                        </div>
                        <div class="tip-arrow">→</div>
                    </a>
                `).join('')}
            </div>
        </div>
    `;
}
