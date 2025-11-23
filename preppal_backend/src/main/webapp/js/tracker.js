document.addEventListener('DOMContentLoaded', function() {
    initializeTracker();
});

let currentPeriod = 'today';
let nutritionChart = null; // Global chart instance

function initializeTracker() {
    checkLoginStatus();
    setupEventListeners();
}

function setupEventListeners() {
    // Handle period filter buttons (Today, This Week, This Month)
    const buttons = document.querySelectorAll('.time-filter-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active class from all
            buttons.forEach(b => b.classList.remove('active'));
            // Add to clicked
            e.target.classList.add('active');
            
            // Set period and reload
            currentPeriod = e.target.textContent.toLowerCase(); // "today", "this week"...
            loadTrackerData();
        });
    });
}

function checkLoginStatus() {
    fetch("/preppal_backend/auth")
        .then(response => response.json())
        .then(data => {
            if (data.status === "logged_in") {
                //Update Welcome Message
                const header = document.querySelector('.tracker-header h1');
                if(header) header.textContent = `Welcome, ${data.username}!`;

                //trigger today button click
              
                const todayBtn = document.querySelector('.time-filter-btn'); 
                if (todayBtn) {
                    todayBtn.click(); 
                } else {
                    // Fallback if button not found
                    loadTrackerData();
                }

            } else {
                showLoginMessage();
            }
        })
        .catch(err => console.error("Error checking login:", err));
}
function showLoginMessage() {
    const container = document.querySelector('.tracker-container');
    if (container) {
        container.innerHTML = `<div class="glass-card" style="text-align:center; padding: 3rem;">
            <h2>Please Log In</h2>
            <p>You need to be logged in to track your progress.</p>
            <a href="registration.html" class="btn" style="display:inline-block; margin-top:1rem;">Sign In</a>
        </div>`;
    }
}

function loadTrackerData() {
    // Fetch data from the updated TrackerServlet
    fetch(`/preppal_backend/tracker?period=${encodeURIComponent(currentPeriod)}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                updateTrackerUI(data);
            } else {
                console.error("Server returned error:", data.message);
            }
        })
        .catch(error => console.error('Error fetching tracker data:', error));
}

function updateTrackerUI(data) {
    // Update Nutrition Stats
    if (data.stats) {
        const stats = data.stats;
        const goal = 2000; // Default goal (can be dynamic later)
        
        // Helper to safely set text
        const setText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };

        // Update Calories
        setText('calories-consumed', stats.calories || 0);
        setText('calories-goal', goal);
        setText('calories-remaining', Math.max(0, goal - stats.calories));
        
        // Update Progress Bar
        const calPercent = Math.min(100, ((stats.calories || 0) / goal) * 100);
        const calFill = document.querySelector('.calorie-summary ~ .progress-bar .progress-fill');
        if (calFill) calFill.style.width = `${calPercent}%`;

        // Update Macros (Protein, Carbs, Fat)
        // Goals hardcoded for now: Protein 150g, Carbs 250g, Fat 65g
        updateMacro('protein', stats.protein, 150);
        updateMacro('carbs', stats.carbs, 250);
        updateMacro('fat', stats.fat, 65);
		
    }
	
    
    //Update Recent Meals List
    if (data.recentMeals) {
        updateRecentMeals(data.recentMeals);
    }
    
    //Update Chart
    if (data.history) {
        initCharts(data.history);
    }
}

function updateMacro(type, value, goal) {
    value = value || 0;
    const percent = Math.min(100, (value / goal) * 100);
    
    // Update Text (e.g., "65g / 150g")
    const valEl = document.getElementById(`${type}-val`);
    if (valEl) valEl.textContent = `${value}g / ${goal}g`;
    
    // Update Bar Width
    const barEl = document.getElementById(`${type}-bar`);
    if (barEl) barEl.style.width = `${percent}%`;
}

function updateRecentMeals(recentMeals) {
    const list = document.querySelector('.recipe-list'); // Make sure this targets the "Recent Recipes" list
    if (!list) return;

    if (!recentMeals || recentMeals.length === 0) {
        list.innerHTML = '<li class="recipe-item">No meals tracked yet.</li>';
        return;
    }

    list.innerHTML = recentMeals.map(meal => `
        <li class="recipe-item">
            <img src="../imgs/${meal.imagePath || 'default-food.jpg'}" alt="${meal.name}" class="recipe-img">
            <div class="recipe-info">
                <h3 class="recipe-name">${meal.name}</h3>
                <p class="recipe-meta">Consumed: ${meal.consumedDate}</p>
            </div>
            <div class="recipe-calories">${meal.calories} kcal</div>
        </li>
    `).join('');
}

function initCharts(historyData) {
    const ctx = document.getElementById('nutritionChart');
    if (!ctx) return; // Exit if canvas not found

    // Prepare data
    const labels = historyData.map(d => d.displayDate);
    const caloriesData = historyData.map(d => d.calories);

    // Destroy old chart if it exists to prevent overlay issues
    if (nutritionChart) {
        nutritionChart.destroy();
    }

    // Create new Chart
    nutritionChart = new Chart(ctx, {
        type: 'line', // Line chart looks good for trends
        data: {
            labels: labels,
            datasets: [{
                label: 'Calories',
                data: caloriesData,
                borderColor: '#34d399',
                backgroundColor: 'rgba(52, 211, 153, 0.2)',
                borderWidth: 3,
                tension: 0.4, // Smooth curves
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}
