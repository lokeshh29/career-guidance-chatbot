const db = new (function() {
    let dbInstance;
    const DB_NAME = 'CareerChatbotDB';
    const DB_VERSION = 1;
    const STORE_NAME = 'users';
    
    this.init = function() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            
            request.onerror = (event) => {
                console.error("Database error:", event.target.error);
                reject(event.target.error);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                    store.createIndex('email', 'email', { unique: true });
                    // Add default user if needed
                    store.add({ name: "Test User", email: "test@example.com", password: "password123" });
                }
            };
            
            request.onsuccess = (event) => {
                dbInstance = event.target.result;
                resolve();
            };
        });
    };
    
    this.createUser = async function(name, email, password) {
        return new Promise((resolve, reject) => {
            const transaction = dbInstance.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            
            const emailCheck = store.index('email').get(email);
            
            emailCheck.onsuccess = (e) => {
                if (e.target.result) {
                    resolve({ success: false, message: "Email already exists" });
                    return;
                }
                
                const newUser = { name, email, password };
                const request = store.add(newUser);
                
                request.onsuccess = () => {
                    resolve({ success: true, user: { ...newUser, id: request.result } });
                };
                
                request.onerror = (event) => {
                    reject(event.target.error);
                };
            };
            
            emailCheck.onerror = (event) => {
                reject(event.target.error);
            };
        });
    };
    
    this.loginUser = function(email, password) {
        return new Promise((resolve, reject) => {
            const transaction = dbInstance.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.index('email').get(email);
            
            request.onsuccess = (event) => {
                const user = event.target.result;
                if (user && user.password === password) {
                    // Store current user in localStorage for session management
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    resolve({ success: true, user });
                } else {
                    resolve({ success: false, message: "Invalid email or password" });
                }
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    };
    
    this.getCurrentUser = function() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    };
    
    this.logout = function() {
        localStorage.removeItem('currentUser');
    };
})();

// Initialize database and handle redirection
window.addEventListener('DOMContentLoaded', async function() {
    try {
        await db.init();
        
        // Get current user
        const currentUser = db.getCurrentUser();
        console.log(curr)
        // Redirect logic
        if (currentUser) {
            // If on auth pages but logged in, go to home
            if (window.location.pathname.includes('/project/public/login.html') || 
                window.location.pathname.includes('/project/public/signup.html')) {
                window.location.href = '/project/public/home.html';
            }
            
            // Update UI if on home page
            if (window.location.pathname.includes('home.html') && document.getElementById('userName')) {
                document.getElementById('userName').textContent = currentUser.name;
            }
        } else {
            // If on protected pages but not logged in, go to login
            if (window.location.pathname.includes('/project/public/home.html')) {
                window.location.href = '/project/public/login.html';
            }
        }
    } catch (error) {
        console.error("Initialization error:", error);
    }
});