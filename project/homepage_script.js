document.addEventListener('DOMContentLoaded', () => {
    // Display user name from database
    const currentUser = db.getCurrentUser();
    if (currentUser) {
        document.getElementById('userName').textContent = currentUser.name;
    }

    // Handle search button click
    document.getElementById('searchBtn').addEventListener('click', async () => {
        const query = document.getElementById('searchInput').value.toLowerCase();
        const courseFilter = document.getElementById('courseFilter').value;
        const scopeFilter = document.getElementById('scopeFilter').value;
        const feeFilter = document.getElementById('feeFilter').value;
        const rankingFilter = document.getElementById('rankingFilter').value;

        try {
            const response = await fetch('/project/colleges_data_500.csv');
            const csvData = await response.text();

            Papa.parse(csvData, {
                header: true,
                skipEmptyLines: true,
                complete: function(results) {
                    const colleges = results.data;
                    const tableBody = document.querySelector('#resultsTable tbody');
                    const noResults = document.getElementById('noResults');
                    
                    // Clear previous results
                    tableBody.innerHTML = '';
                    noResults.style.display = 'none';
                    
                    // Filter results
                    const filteredColleges = colleges.filter(college => {
                        const matchesQuery = college.name.toLowerCase().includes(query) ||
                                             college.courses.toLowerCase().includes(query) ||
                                             college.location.toLowerCase().includes(query);

                        const matchesFilters = (
                            (!courseFilter || college.courses.toLowerCase().includes(courseFilter.toLowerCase())) &&
                            (!scopeFilter || college.scope.toLowerCase() === scopeFilter.toLowerCase()) &&
                            (!feeFilter || (feeFilter === "low" && parseFloat(college.fees) < 20000) ||
                                            (feeFilter === "medium" && parseFloat(college.fees) >= 20000 && parseFloat(college.fees) <= 40000) ||
                                            (feeFilter === "high" && parseFloat(college.fees) > 40000)) &&
                            (!rankingFilter || (rankingFilter === "top10" && parseInt(college.ranking) <= 10) ||
                                               (rankingFilter === "top50" && parseInt(college.ranking) <= 50) ||
                                               (rankingFilter === "top100" && parseInt(college.ranking) <= 100))
                        );
                        return matchesQuery && matchesFilters;
                    });

                    // Display results
                    if (filteredColleges.length === 0) {
                        noResults.style.display = 'block';
                    } else {
                        filteredColleges.forEach(college => {
                            const row = document.createElement('tr');
                            row.innerHTML = `
                                <td>${college.name}</td>
                                <td>${college.location}</td>
                                <td>${college.courses}</td>
                                <td>₹${parseFloat(college.fees).toLocaleString('en-IN')}</td>
                                <td>#${college.ranking}</td>
                                <td>${college.scope}</td>
                                <td>${college.qualifications_required}</td>
                            `;
                            tableBody.appendChild(row);
                        });
                    }
                },
                error: function(error) {
                    console.error('Error parsing CSV:', error);
                    document.getElementById('noResults').textContent = 'Error loading data. Please try again.';
                    document.getElementById('noResults').style.display = 'block';
                }
            });
        } catch (error) {
            console.error('Error fetching CSV data:', error);
            document.getElementById('noResults').textContent = 'Failed to load data. Please check your connection.';
            document.getElementById('noResults').style.display = 'block';
        }
    });

    // Initialize logout functionality
    setupLogout();
});

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            db.logout();
            window.location.href = '/project/public/login.html';
        });
    }
}