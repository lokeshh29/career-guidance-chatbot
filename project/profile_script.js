document.addEventListener('DOMContentLoaded', () => {
    // Debug: Check if script is loading
    console.log("Profile script loaded");
    
    // Load user data
    const currentUser = db.getCurrentUser();
    if (!currentUser) {
        console.log("No user logged in, redirecting");
        window.location.href = 'login.html';
        return;
    }

    // Debug: User data
    console.log("Current user:", currentUser);

    // Display user info
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userInitial').textContent = currentUser.name.charAt(0).toUpperCase();
    document.getElementById('userEmail').textContent = currentUser.email;
    
    // Set join date if not already set
    if (!currentUser.joinDate) {
        currentUser.joinDate = new Date().toLocaleDateString();
        updateUserInDB(currentUser);
    }
    document.getElementById('joinDate').textContent = currentUser.joinDate;

    // Set interests if not set
    if (!currentUser.interests) {
        const interests = [
            'Computer Science', 'Engineering', 'Business', 
            'Medicine', 'Arts', 'Mathematics', 'Physics'
        ];
        currentUser.interests = getRandomItems(interests, 3).join(', ');
        updateUserInDB(currentUser);
    }
    document.getElementById('userInterests').textContent = currentUser.interests;

    // Sample data for suggestions - MOVED TO GLOBAL SCOPE
    window.allCourses = [
    
  { title: "Introduction to Artificial Intelligence", field: "Computer Science", duration: "10 weeks", level: "Intermediate", institution: "MIT Online" },
  { title: "Business Analytics with Excel", field: "Business", duration: "6 weeks", level: "Beginner", institution: "Wharton School" },
  { title: "Digital Marketing Strategies", field: "Marketing", duration: "4 weeks", level: "Beginner", institution: "Coursera - Google" },
  { title: "Human Anatomy & Physiology", field: "Medicine", duration: "12 weeks", level: "Advanced", institution: "Harvard Medical School" },
  { title: "Modern Art and Ideas", field: "Arts", duration: "5 weeks", level: "Beginner", institution: "MoMA" },
  { title: "Quantum Mechanics Essentials", field: "Physics", duration: "8 weeks", level: "Advanced", institution: "Stanford University" },
  { title: "Data Structures & Algorithms", field: "Computer Science", duration: "6 weeks", level: "Intermediate", institution: "IIT Bombay" },
  { title: "Engineering Thermodynamics", field: "Mechanical Engineering", duration: "9 weeks", level: "Advanced", institution: "NPTEL" },
  { title: "Statistical Thinking for Data Science", field: "Mathematics", duration: "7 weeks", level: "Intermediate", institution: "Johns Hopkins University" },
  { title: "Financial Accounting Basics", field: "Commerce", duration: "6 weeks", level: "Beginner", institution: "University of Illinois" }


        
    ];

    window.allColleges = [
        { name: "IIT Bombay", location: "Mumbai", courses: "Engineering, Computer Science, Physics", ranking: 1, fees: "₹2,30,000" },
        { name: "IIT Delhi", location: "New Delhi", courses: "Engineering, Mathematics, AI", ranking: 2, fees: "₹2,20,000" },
        { name: "IISc Bangalore", location: "Bangalore", courses: "Science, Engineering, Research", ranking: 3, fees: "₹35,000" },
        { name: "AIIMS Delhi", location: "New Delhi", courses: "Medicine, Nursing, Biomedical Sciences", ranking: 1, fees: "₹5,000" },
        { name: "University of Delhi", location: "Delhi", courses: "Arts, Commerce, Science", ranking: 6, fees: "₹15,000" },
        { name: "JNU", location: "New Delhi", courses: "Arts, Political Science, Science", ranking: 8, fees: "₹12,000" },
        { name: "NIT Trichy", location: "Tiruchirappalli", courses: "Engineering, Architecture, Management", ranking: 9, fees: "₹1,80,000" },
        { name: "IIM Ahmedabad", location: "Ahmedabad", courses: "Business, Management", ranking: 1, fees: "₹23,00,000" },
        { name: "VIT Vellore", location: "Vellore", courses: "Engineering, Management", ranking: 18, fees: "₹1,98,000" },
        { name: "BHU", location: "Varanasi", courses: "Science, Arts, Ayurveda", ranking: 10, fees: "₹5,000" }
    ];
    

    // Debug: Check if data exists
    console.log("Courses data:", window.allCourses);
    console.log("Colleges data:", window.allColleges);

    // Initial generation
    generateSuggestions();

    // Refresh buttons
    document.getElementById('refreshCourses').addEventListener('click', generateSuggestions);
    document.getElementById('refreshColleges').addEventListener('click', generateSuggestions);

    // Setup logout button
    document.getElementById('logoutBtn').addEventListener('click', function() {
        db.logout();
        window.location.href = 'login.html';
    });

    // Helper functions
    function updateUserInDB(user) {
        try {
            // First try the modern method
            if (db && typeof db.getAllUsers === 'function') {
                const users = db.getAllUsers();
                const userIndex = users.findIndex(u => u.id === user.id);
                if (userIndex !== -1) {
                    users[userIndex] = user;
                    localStorage.setItem('CareerChatbotDB', JSON.stringify(users));
                }
            } 
            // Fallback to direct localStorage access
            else {
                const users = JSON.parse(localStorage.getItem('CareerChatbotDB')) || [];
                const userIndex = users.findIndex(u => u.id === user.id);
                if (userIndex !== -1) {
                    users[userIndex] = user;
                    localStorage.setItem('CareerChatbotDB', JSON.stringify(users));
                }
            }
        } catch (error) {
            console.error("Error updating user:", error);
        }
    }
    function getRandomItems(array, count) {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    function generateSuggestions() {
        console.log("Generating suggestions...");
        
        // Generate course suggestions
        const coursesContainer = document.getElementById('courseSuggestions');
        if (!coursesContainer) {
            console.error("Courses container not found!");
            return;
        }
        coursesContainer.innerHTML = '';
        
        const selectedCourses = getRandomItems(window.allCourses, 3);
        console.log("Selected courses:", selectedCourses);

        selectedCourses.forEach(course => {
            const courseElement = document.createElement('div');
            courseElement.className = 'suggestion-card';
            courseElement.innerHTML = `
                <div class="suggestion-icon"><i class="fas fa-graduation-cap"></i></div>
                <div class="suggestion-content">
                    <div class="suggestion-title">${course.title}</div>
                    <p>${course.field} course by ${course.institution}</p>
                    <div class="suggestion-meta">
                        <span><i class="fas fa-clock"></i> ${course.duration}</span>
                        <span><i class="fas fa-signal"></i> ${course.level}</span>
                    </div>
                </div>
            `;
            coursesContainer.appendChild(courseElement);
        });

        // Generate college suggestions
        const collegesContainer = document.getElementById('collegeSuggestions');
        if (!collegesContainer) {
            console.error("Colleges container not found!");
            return;
        }
        collegesContainer.innerHTML = '';
        
        const selectedColleges = getRandomItems(window.allColleges, 3);
        console.log("Selected colleges:", selectedColleges);

        selectedColleges.forEach(college => {
            const collegeElement = document.createElement('div');
            collegeElement.className = 'suggestion-card';
            collegeElement.innerHTML = `
                <div class="suggestion-icon"><i class="fas fa-university"></i></div>
                <div class="suggestion-content">
                    <div class="suggestion-title">${college.name}</div>
                    <p>${college.location} | ${college.courses}</p>
                    <div class="suggestion-meta">
                        <span><i class="fas fa-trophy"></i> Ranking: ${college.ranking}</span>
                        <span><i class="fas fa-rupee-sign"></i> Fees: ${college.fees}/year</span>
                    </div>
                </div>
            `;
            collegesContainer.appendChild(collegeElement);
        });
    }
});