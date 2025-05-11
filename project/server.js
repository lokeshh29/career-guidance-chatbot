// Handle login form submission
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const result = db.authenticateUser(email, password);
    
    if (result.success) {
        window.location.href = 'index.html';
    } else {
        alert(result.message);
    }
});

// Handle signup form submission
document.getElementById('signupForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        alert("Passwords don't match!");
        return;
    }
    
    // Validate password strength (basic example)
    if (password.length < 8) {
        alert("Password must be at least 8 characters long");
        return;
    }
    
    const result = db.createUser(name, email, password);
    
    if (result.success) {
        alert("Account created successfully! Please login.");
        window.location.href = 'login.html';
    } else {
        alert(result.message);
    }
});

// Handle logout
document.getElementById('logoutBtn')?.addEventListener('click', function() {
    db.logout();
    window.location.href = 'login.html';
});

// Password strength indicator (for signup page)
document.getElementById('password')?.addEventListener('input', function() {
    const password = this.value;
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    // Reset
    strengthBar.style.width = '0%';
    strengthBar.style.backgroundColor = '';
    strengthText.textContent = '';
    strengthText.style.color = '';
    
    if (password.length === 0) return;
    
    // Very basic strength check
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.match(/[A-Z]/)) strength += 1;
    if (password.match(/[0-9]/)) strength += 1;
    if (password.match(/[^A-Za-z0-9]/)) strength += 1;
    
    let width = 0;
    let color = '';
    let text = '';
    
    switch(strength) {
        case 1:
            width = 25;
            color = 'var(--error-color)';
            text = 'Weak';
            break;
        case 2:
            width = 50;
            color = 'var(--warning-color)';
            text = 'Fair';
            break;
        case 3:
            width = 75;
            color = '#4cc9f0';
            text = 'Good';
            break;
        case 4:
            width = 100;
            color = 'var(--success-color)';
            text = 'Strong';
            break;
    }
    
    strengthBar.style.width = `${width}%`;
    strengthBar.style.backgroundColor = color;
    strengthText.textContent = `Password strength: ${text}`;
    strengthText.style.color = color;
});

// Simple chat functionality for home page
if (document.getElementById('sendBtn')) {
    document.getElementById('sendBtn').addEventListener('click', sendMessage);
    document.getElementById('userInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });
    
    function sendMessage() {
        const input = document.getElementById('userInput');
        const message = input.value.trim();
        
        if (message) {
            // Add user message to chat
            addMessage(message, 'user');
            
            // Simulate bot response after a short delay
            setTimeout(() => {
                const responses = [
                    "That's an interesting question about your career!",
                    "Based on your profile, I'd recommend...",
                    "Many people in your field have found success by...",
                    "Have you considered looking into...?",
                    "That's a common challenge. Here's what I suggest..."
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                addMessage(randomResponse, 'bot');
            }, 1000);
            
            input.value = '';
        }
    }
    
    function addMessage(text, sender) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);
        messageElement.textContent = text;
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}