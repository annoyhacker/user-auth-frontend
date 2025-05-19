const authModal = document.getElementById('auth-modal');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

// Configuration
const API_BASE = 'http://localhost:3000';
const API = {
    login: `${API_BASE}/api/login`,
    signup: `${API_BASE}/api/signup`,
    validate: `${API_BASE}/api/validate`
};

// UI Controls
function toggleLoading(button, isLoading) {
    const spinner = button.querySelector('.spinner');
    const btnText = button.querySelector('.btn-text');
    button.disabled = isLoading;
    spinner.style.display = isLoading ? 'block' : 'none';
    btnText.style.visibility = isLoading ? 'hidden' : 'visible';
}

function showError(formId, message) {
    const errorEl = document.getElementById(`${formId}-error`);
    errorEl.textContent = message;
    errorEl.style.display = 'block';
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.style.display = 'none';
        el.textContent = '';
    });
}

// Modal Management
function openModal(formType) {
    authModal.style.display = 'block';
    loginForm.style.display = formType === 'login' ? 'block' : 'none';
    signupForm.style.display = formType === 'signup' ? 'block' : 'none';
    clearErrors();
}

authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
        authModal.style.display = 'none';
    }
});

document.querySelector('.close').addEventListener('click', () => {
    authModal.style.display = 'none';
});

// Form Handling
document.getElementById('show-signup').addEventListener('click', (e) => {
    e.preventDefault();
    openModal('signup');
});

document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    openModal('login');
});

async function handleAuth(endpoint, body, formType) {
    const button = document.querySelector(`#${formType}-form .auth-btn`);

    try {
        toggleLoading(button, true);
        const response = await fetch(API[formType], {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `${formType} failed`);
        }

        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        authModal.style.display = 'none';
        updateUI();
    } catch (error) {
        showError(formType, error.message);
    } finally {
        toggleLoading(button, false);
    }
}

// Form Submissions
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        showError('login', 'Please fill in all fields');
        return;
    }

    await handleAuth('login', { email, password }, 'login');
});

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    if (password !== confirmPassword) {
        showError('signup', 'Passwords do not match');
        return;
    }

    await handleAuth('signup', { username, email, password }, 'signup');
});

// Auth State Management
function updateUI() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const authLinks = document.querySelector('.auth-links');
    const userProfile = document.getElementById('user-profile');

    if (userData) {
        authLinks.style.display = 'none';
        userProfile.style.display = 'flex';
        document.getElementById('username-display').textContent = userData.username;
    } else {
        authLinks.style.display = 'flex';
        userProfile.style.display = 'none';
    }
}

// Token Validation
async function validateToken() {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    try {
        const response = await fetch(API.validate, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.ok;
    } catch {
        return false;
    }
}

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.clear();
    updateUI();
});

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    const isValid = await validateToken();
    if (!isValid) localStorage.clear();
    updateUI();
});

// Header Event Listeners
document.getElementById('login-link').addEventListener('click', (e) => {
    e.preventDefault();
    openModal('login');
});

document.getElementById('signup-link').addEventListener('click', (e) => {
    e.preventDefault();
    openModal('signup');
});
