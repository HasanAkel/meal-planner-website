document.addEventListener("DOMContentLoaded", () => {
    checkLoginStatus();
});

function checkLoginStatus() {
    fetch("/preppal_backend/auth")
        .then(response => response.json())
        .then(data => {
            if (data.status === "logged_in") {
                updateNavForUser(data.username);
            } else {
                // guest / not logged in
                updateNavForGuest();
            }
        })
        .catch(err => console.error("Error checking login status:", err));
}

/**
 * When the user is NOT logged in:
 * - Hide protected links (Recipes, Planner, Tracker)
 * - Keep Home + Sign-Up only
 */
function updateNavForGuest() {
    const nav = document.querySelector("nav");
    if (!nav) return;

    const protectedPages = ["recipes.html", "planner.html", "tracker.html"];

    protectedPages.forEach(page => {
        const link = nav.querySelector(`a[href="${page}"]`);
        if (link) {
            link.remove(); // just remove it from the navbar
        }
    });
}

/**
 * When the user IS logged in:
 * - Keep all links (so don't remove anything)
 * - Replace Sign-Up with username + logout
 */
function updateNavForUser(username) {
    const nav = document.querySelector("nav");
    const signUpLink = document.querySelector('a[href="registration.html"]');
    
    if (signUpLink && nav) {
        const userElement = document.createElement("div");
        userElement.className = "nav-element";
        userElement.style.display = "inline-flex";
        userElement.style.alignItems = "center";
        userElement.style.gap = "8px";
        userElement.style.color = "#064e3b";
        userElement.style.fontWeight = "bold";
        userElement.style.cursor = "pointer";

        userElement.innerHTML = `
            <i class="fas fa-user-circle" style="font-size: 1.2rem;"></i>
            <span>${username}</span>
        `;

        userElement.addEventListener("click", () => {
            if (confirm("Log out?")) {
                fetch("/preppal_backend/auth?action=logout", { method: "POST" })
                    .then(res => res.json())
                    .then(() => {
                        window.location.href = "index.html";
                    })
                    .catch(err => console.error("Logout error:", err));
            }
        });

        nav.replaceChild(userElement, signUpLink);
    }
}
