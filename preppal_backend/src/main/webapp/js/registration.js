const container = document.querySelector('.registration-container');

// Elements for Step Control
const steps = {
    '0': document.getElementById('step-0-mode'),
    '1': document.getElementById('step-1-bio'),
    '2': document.getElementById('step-2-goals'),
    '3': document.getElementById('step-3-credentials'),
    'login': document.getElementById('step-login')
};

// Mode Selection Buttons (manual only now)
const manualRegBtn = document.getElementById('manual-reg-btn');

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
    Object.values(steps).forEach(step => {
        step.classList.add('hidden');
    });

    const targetStep = steps[stepId];
    if (targetStep) {
        targetStep.classList.remove('hidden');
    }

    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// --- INITIAL MODE SELECTION LISTENER ---
manualRegBtn.addEventListener('click', () => {
    showStep('1');
});

// --- STEP 1: BIO DATA LOGIC ---
function updateSliderValue(slider, valueElement, unit) {
    valueElement.textContent = `${slider.value} ${unit}`;
}

// Initial values
updateSliderValue(heightRange, heightValue, 'cm');
updateSliderValue(weightRange, weightValue, 'kg');

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

        goalCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        registrationData.goals = goal;
        goalNextBtn.disabled = false;
    });
});

// --- GLOBAL NAVIGATION LISTENERS (Next/Back) ---
document.querySelectorAll('button[data-action]').forEach(button => {
    button.addEventListener('click', (event) => {
        const action = button.dataset.action;
        const targetStep = button.dataset.targetStep;

        if (action === 'next') {
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

        if (!ageInput.value || parseInt(ageInput.value) < 15) {
            alert("Please enter a valid age (must be 15 or older).");
            return false;
        }

        registrationData.age = parseInt(ageInput.value);
        registrationData.height = parseInt(heightRange.value);
        registrationData.weight = parseFloat(weightRange.value);

        console.log("Saved Bio Data:", registrationData);
        return true;
    }

    if (currentStepId === 'step-2-goals') {
        if (!registrationData.goals) {
            alert("Please select a goal before proceeding.");
            return false;
        }
        return true;
    }

    return true;
}

// --- STEP 3: FINAL SUBMISSION LISTENER ---
document
  .querySelector('#step-3-credentials .step-form')
  .addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('reg-email').value;
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const submitBtn = document.getElementById('final-submit-btn');
    const errorDiv = document.getElementById("error-div");

    submitBtn.disabled = true;
    submitBtn.textContent = "Creating Account...";
    errorDiv.style.display = "none";

    const params = new URLSearchParams();
    params.append("action", "register");
    params.append("username", username);
    params.append("password", password);
    params.append("email", email);
    params.append("goal", registrationData.goals);
    params.append("height", registrationData.height);
    params.append("weight", registrationData.weight);
    params.append("age", registrationData.age);

    fetch("/preppal_backend/auth", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            alert("Registration successful! Redirecting to your dashboard...");
            window.location.href = 'index.html';
        } else {
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
const goToLoginBtn = document.getElementById('go-to-login-btn');
if (goToLoginBtn) {
    goToLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showStep('login');
    });
}

const loginForm = document.getElementById('login-form');
const loginErrorDiv = document.getElementById('login-error-div');

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const usernameVal = document.getElementById('login-username').value;
        const passwordVal = document.getElementById('login-password').value;

        const params = new URLSearchParams();
        params.append('action', 'login');
        params.append('username', usernameVal);
        params.append('password', passwordVal);

        fetch("/preppal_backend/auth", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                alert("Login Successful!");
                updateNavForUser(data.username);

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
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
    showStep('0'); // Start at the manual mode selection screen
};
