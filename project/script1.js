// ======================
// DATABASE IMPLEMENTATION
// ======================

if (typeof window.db === 'undefined') {
    window.db = (function () {
        const DB_NAME = 'CareerChatbotDB';
        let users = JSON.parse(localStorage.getItem(DB_NAME)) || [];
        let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

        // Create a default test user if the database is empty
        if (users.length === 0) {
            users.push({
                id: 1,
                name: "Test User",
                email: "test@example.com",
                password: "password123"
            });
            localStorage.setItem(DB_NAME, JSON.stringify(users));
        }

        return {
            createUser(name, email, password) {
                return new Promise(resolve => {
                    if (users.some(user => user.email === email)) {
                        resolve({ success: false, message: "Email already exists" });
                        return;
                    }

                    const newUser = {
                        id: Date.now(),
                        name,
                        email,
                        password
                    };

                    users.push(newUser);
                    localStorage.setItem(DB_NAME, JSON.stringify(users));
                    resolve({ success: true, user: newUser });
                });
            },

            loginUser(email, password) {
                return new Promise(resolve => {
                    const user = users.find(u => u.email === email && u.password === password);
                    if (user) {
                        currentUser = user;
                        localStorage.setItem('currentUser', JSON.stringify(user));
                        resolve({ success: true, user });
                    } else {
                        resolve({ success: false, message: "Invalid email or password" });
                    }
                });
            },

            logout() {
                currentUser = null;
                localStorage.removeItem('currentUser');
            },

            getCurrentUser() {
                try {
                    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
                    if (!storedUser) return null;

                    return users.find(u => u.id === storedUser.id && u.email === storedUser.email) || null;
                } catch (error) {
                    console.error("Error retrieving current user:", error);
                    return null;
                }
            },

            getAllUsers() {
                return users;
            }
        };
    })();
}

// ========================
// PASSWORD STRENGTH INDICATOR
// ========================

function setupPasswordStrength() {
    const passwordInput = document.getElementById('password');
    if (!passwordInput) return;

    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');

    passwordInput.addEventListener('input', function () {
        const password = this.value;

        if (!strengthBar || !strengthText) return;

        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        const levels = [
            { width: '0%', color: '', text: '' },
            { width: '25%', color: '#ff3333', text: 'Weak' },
            { width: '50%', color: '#ff9933', text: 'Moderate' },
            { width: '75%', color: '#33cc33', text: 'Good' },
            { width: '100%', color: '#009900', text: 'Strong' }
        ];

        const { width, color, text } = levels[strength];

        strengthBar.style.width = width;
        strengthBar.style.backgroundColor = color;
        strengthText.textContent = text ? `Password strength: ${text}` : '';
        strengthText.style.color = color;
    });
}

// ========================
// SIGNUP HANDLER
// ========================

function handleSignup() {
    const form = document.getElementById('signupForm');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) return alert("Passwords don't match!");
        if (password.length < 8) return alert("Password must be at least 8 characters long");

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing Up...';

        try {
            const result = await db.createUser(name, email, password);
            if (result.success) {
                alert("Account created successfully! Redirecting to login...");
                setTimeout(() => window.location.href = '/project/public/login.html', 1000);
            } else {
                alert(result.message || "Signup failed");
            }
        } catch (error) {
            console.error("Signup error:", error);
            alert("An error occurred during signup");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Sign Up';
        }
    });
}

// ========================
// LOGIN HANDLER
// ========================

function handleLogin() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging In...';

        try {
            const result = await db.loginUser(email, password);
            if (result.success) {
                setTimeout(() => window.location.href = 'home.html', 1000);
            } else {
                alert(result.message || "Login failed");
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("An error occurred during login");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Login';
        }
    });
}

// ========================
// AUTH MANAGEMENT
// ========================

function checkAuthState() {
    document.addEventListener('readystatechange', () => {
        if (document.readyState !== 'interactive') return;

        const currentUser = db.getCurrentUser();
        const currentPage = window.location.pathname.split('/').pop();

        const isAuthPage = ['login.html', 'signup.html'].includes(currentPage);
        const isHomePage = currentPage === 'home.html';

        if (currentUser && isAuthPage) {
            setTimeout(() => window.location.href = '/project/public/home.html', 1000);
        } else if (!currentUser && isHomePage) {
            setTimeout(() => window.location.href = '/project/public/login.html', 1000);
        }
    });
}

// ========================
// LOGOUT SETUP
// ========================

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            db.logout();
            window.location.href = '/project/public/login.html';
        });
    }
}

// ========================
// INITIALIZATION
// ========================

function initializeApp() {
    setupPasswordStrength();
    handleSignup();
    handleLogin();
    checkAuthState();
    setupLogout();
}

document.addEventListener('DOMContentLoaded', initializeApp);
