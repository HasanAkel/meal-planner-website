document.addEventListener("DOMContentLoaded", () => {
    checkLoginStatus();
});

function checkLoginStatus() {
    // Call the new doGet method in AuthServlet
    fetch("/preppal_backend/auth")
        .then(response => response.json())
        .then(data => {
            if (data.status === "logged_in") {
                updateNavForUser(data.username);
            }
        })
        .catch(err => console.error("Error checking login status:", err));
}

function updateNavForUser(username) {
    // 1. Find the nav
    const nav = document.querySelector('nav');
    
    // 2. Find the "Sign Up" link (looks for link to registration.html)
    const signUpLink = document.querySelector('a[href="registration.html"]');
    
    // Only replace if the Sign Up button actually exists on this page
    if (signUpLink) {
        const userElement = document.createElement('div');
        userElement.className = 'nav-element';
        userElement.style.display = 'inline-flex';
        userElement.style.alignItems = 'center';
        userElement.style.gap = '8px';
        userElement.style.color = '#064e3b';
        userElement.style.fontWeight = 'bold';
        userElement.style.cursor = 'pointer'; // Make it look clickable
        
        // Add Icon, Username, and a hidden Logout option (optional logic below)
        userElement.innerHTML = `
            <i class="fas fa-user-circle" style="font-size: 1.2rem;"></i>
            <span>${username}</span>
        `;
        
        // Optional: Add simple click to logout logic
        userElement.addEventListener('click', () => {
            if(confirm("Log out?")) {
                 fetch("/preppal_backend/auth?action=logout", { method: "POST" })
                 .then(() => window.location.href = "index.html");
            }
        });

        // 3. Replace
        nav.replaceChild(userElement, signUpLink);
    }
}
