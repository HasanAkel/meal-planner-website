const container = document.querySelector('.registration-container');

// Elements for Step Control
const steps = {
    '0': document.getElementById('step-0-mode'),
    '1': document.getElementById('step-1-bio'),
    '2': document.getElementById('step-2-goals'),
    '3': document.getElementById('step-3-credentials'),
    'ai': document.getElementById('ai-message'),
	'login': document.getElementById('step-login') 
};
// Mode Selection Buttons
const manualRegBtn = document.getElementById('manual-reg-btn');
const aiRegBtn = document.getElementById('ai-reg-btn');

// Bio Data Sliders (Step 1)
const heightRange = document.getElementById('reg-height');
const heightValue = document.getElementById('height-value');
const weightRange = document.getElementById('reg-weight');
const weightValue = document.getElementById('weight-value');

// Goal Selection (Step 2)
const goalCards = document.querySelectorAll('.goal-card');
const goalNextBtn = document.getElementById('goal-next-btn');
// Data storage object
let registrationData = {
    age: 0,
    height: 175,
    weight: 70,
    goals: '',
    email: '',
    username: ''
};

// --- CORE NAVIGATION FUNCTION ---
function showStep(stepId) {
    // Hide all steps
    Object.values(steps).forEach(step => {
        step.classList.add('hidden');
    });

    // Show the requested step
    const targetStep = steps[stepId];
    if (targetStep) {
        targetStep.classList.remove('hidden');
    }

    // Optional: Scroll to top of form container
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// --- INITIAL MODE SELECTION LISTENERS (Step 0) ---

manualRegBtn.addEventListener('click', () => {
    // Start the manual registration flow
    showStep('1');
});

aiRegBtn.addEventListener('click', () => {
    // Show the AI message
    showStep('ai');
});


// --- STEP 1: BIO DATA LOGIC ---

// Helper function to update slider labels
function updateSliderValue(slider, valueElement, unit) {
    valueElement.textContent = `${slider.value} ${unit}`;
}

// Initial setup for sliders
updateSliderValue(heightRange, heightValue, 'cm');
updateSliderValue(weightRange, weightValue, 'kg');

// Add listeners for height/weight sliders
heightRange.addEventListener('input', () => {
    updateSliderValue(heightRange, heightValue, 'cm');
});

weightRange.addEventListener('input', () => {
    updateSliderValue(weightRange, weightValue, 'kg');
});

// --- STEP 2: GOALS LOGIC ---

goalCards.forEach(card => {
    card.addEventListener('click', () => {
        const goal = card.dataset.goal;
        
        // 1. Deselect all other cards
        goalCards.forEach(c => c.classList.remove('selected'));
        
        // 2. Select the clicked card
        card.classList.add('selected');

        // 3. Store the selection
        registrationData.goals = goal;

        // 4. Enable the Next button
        goalNextBtn.disabled = false;
    });
});


// --- GLOBAL NAVIGATION LISTENERS (Next/Back) ---

document.querySelectorAll('button[data-action]').forEach(button => {
    button.addEventListener('click', (event) => {
        const action = button.dataset.action;
        const targetStep = button.dataset.targetStep;

        if (action === 'next') {
            // Validate current step and save data before moving
            if (validateAndSaveStep(button.closest('.reg-step').id)) {
                showStep(targetStep);
            }
        } else if (action === 'back') {
            showStep(targetStep);
        }
    });
});

// Helper function to validate and save data for the current step
function validateAndSaveStep(currentStepId) {
    if (currentStepId === 'step-1-bio') {
        const ageInput = document.getElementById('reg-age');
        
        // Basic validation for Age
        if (!ageInput.value || parseInt(ageInput.value) < 15) {
            alert("Please enter a valid age (must be 15 or older).");
            return false;
        }

        // Save data from Step 1
        registrationData.age = parseInt(ageInput.value);
        registrationData.height = parseInt(heightRange.value);
        registrationData.weight = parseFloat(weightRange.value);
        
        console.log("Saved Bio Data:", registrationData);
        return true;
    } 
    
    // Step 2 doesn't need validation here, as goals are saved on click
    if (currentStepId === 'step-2-goals') {
        if (!registrationData.goals) {
            // Should not happen if the next button is properly disabled, but good practice
            alert("Please select a goal before proceeding.");
            return false;
        }
        return true;
    }

    return true;
}

// --- STEP 3: FINAL SUBMISSION LISTENER ---
document.querySelector('#step-3-credentials .step-form').addEventListener('submit', function(event) {
    event.preventDefault(); 

    // Gather final credentials
    const email = document.getElementById('reg-email').value;
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const submitBtn = document.getElementById('final-submit-btn');
	const errorDiv = document.getElementById("error-div");
    // Update UI state
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating Account...";
    errorDiv.style.display = "none";

    // Prepare payload for Servlet
    const params = new URLSearchParams();
    params.append("action", "register");
    params.append("username", username);
    params.append("password", password);
    params.append("email", email);
    // Append data collected from previous steps
    params.append("goal", registrationData.goals);
    params.append("height", registrationData.height);
    params.append("weight", registrationData.weight);
    params.append("age", registrationData.age);

    // SEND TO BACKEND
	fetch("/preppal_backend/auth", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            alert("Registration Successful! Redirecting to login...");
            // Redirect to login or home page
            window.location.href = 'index.html'; 
        } else {
            // Handle backend errors (e.g., Username taken)
            errorDiv.textContent = data.message || "Registration failed.";
            errorDiv.style.display = "block";
            submitBtn.disabled = false;
            submitBtn.textContent = "Sign Up Now!";
        }
    })
    .catch(err => {
        console.error("Error:", err);
        errorDiv.textContent = "Network error. Please try again.";
        errorDiv.style.display = "block";
        submitBtn.disabled = false;
        submitBtn.textContent = "Sign Up Now!";
    });
});

// --- LOGIN FLOW LOGIC ---

// Listener for "Already have an account?" link
const goToLoginBtn = document.getElementById('go-to-login-btn');
if (goToLoginBtn) {
    goToLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showStep('login');
    });
}

// Handle Login Form Submission
const loginForm = document.getElementById('login-form');
const loginErrorDiv = document.getElementById('login-error-div');
const stepLogin = document.getElementById("step-login");

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Stop page reload
        const usernameVal = document.getElementById('login-username').value;
        const passwordVal = document.getElementById('login-password').value;

        // Prepare data for backend
        const params = new URLSearchParams();
        params.append('action', 'login'); // Tells AuthServlet this is a login
        params.append('username', usernameVal);
        params.append('password', passwordVal);

        // Call the Backend
        fetch("/preppal_backend/auth", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                // Login Successful
                alert("Login Successful!");
                
                // Update the UI (Remove Sign Up -> Show User)
                updateNavForUser(data.username);

                // Optional: Redirect to home page after a short delay
                setTimeout(() => {
                   window.location.href = 'index.html'; 
                }, 1000);
            } else {
                // Login Failed
                loginErrorDiv.textContent = data.message || "Invalid username or password.";
                loginErrorDiv.style.display = "block";
            }
        })
        .catch(err => {
            console.error(err);
            loginErrorDiv.textContent = "Network error. Please try again.";
            loginErrorDiv.style.display = "block";
        });
    });
}


// --- INITIALIZATION ---
window.onload = () => {
    showStep('0'); // Start at the mode selection screen
};