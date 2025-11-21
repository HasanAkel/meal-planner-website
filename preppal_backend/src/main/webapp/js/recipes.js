const addRecipeBtn = document.getElementById("add-recipe-btn");
const addRecipeForm = document.getElementById("add-recipe-form");
const recipeControlsSection = document.getElementById("recipes-controls");
const cancelBtn = document.getElementById("cancel-btn");
const searchInput = document.getElementById("recipe-search");

const RECIPES_URL = "/preppal_backend/recipes";

cancelBtn.addEventListener("click", function () {
    addRecipeForm.classList.add("hidden");
    addRecipeForm.classList.remove("top-spacing");
    recipeControlsSection.classList.remove("hidden");
});

addRecipeBtn.addEventListener("click", function () {
    addRecipeForm.classList.remove("hidden");
    addRecipeForm.classList.add("top-spacing");
    recipeControlsSection.classList.add("hidden");
});

// Submit handler: send data via query string (works with getParameter)
addRecipeForm.addEventListener("submit", function (event) {
    event.preventDefault(); // prevent full page reload

    // Grab values manually
    const name = document.getElementById("recipe-name").value;
    const calories = document.getElementById("recipe-calories").value;
    const protein = document.getElementById("recipe-protein").value;
    const carbs = document.getElementById("recipe-carbs").value;
    const ingredients = document.getElementById("recipe-ingredients").value;

    // For now, just store the file name (or empty string)
    const imageInput = document.getElementById("recipe-image");
    const imagePath = imageInput.files.length > 0 ? imageInput.files[0].name : "";

    // Build query string
    const params = new URLSearchParams();
    params.append("name", name);
    params.append("calories", calories);
    params.append("protein", protein);
    params.append("carbs", carbs);
    params.append("ingredients", ingredients);
    params.append("image", imagePath);

    fetch(`${RECIPES_URL}?${params.toString()}`, {
        method: "POST"
    })
        .then(() => {
            addRecipeForm.classList.add("hidden");
            recipeControlsSection.classList.remove("hidden");
            addRecipeForm.reset();
            loadSavedRecipes();   // refresh list after save
        })
        .catch(err => console.error("Error while saving recipe:", err));
});

function loadSavedRecipes() {
    fetch(RECIPES_URL)
        .then(response => response.json())
        .then(data => {
            const section = document.getElementById("saved-recipes-section");
            const grid = document.getElementById("saved-recipes-grid");

            if (!section || !grid) return;

            // Clear previous content & any old "no results" message
            grid.innerHTML = "";

            // If no recipes in DB, hide the whole section
            if (!Array.isArray(data) || data.length === 0) {
                section.classList.add("hidden");
                return;
            }

            // We have data → show section
            section.classList.remove("hidden");

            data.forEach(r => {
                const card = document.createElement("article");
                card.className = "glass-card";

                // Optional image
                let imgHtml = "";
                if (r.imagePath && r.imagePath.trim() !== "") {
                    imgHtml = `
                        <img src="/preppal_backend/imgs/${r.imagePath}" 
                             alt="${r.name}" 
                             class="recipe-img">
                    `;
                }

                // Optional protein/carbs text (will show nicely once backend sends these fields)
                const proteinText = (r.protein != null && r.protein !== 0)
                    ? `${r.protein} g protein • `
                    : "";
                const carbsText = (r.carbs != null && r.carbs !== 0)
                    ? `${r.carbs} g carbs • `
                    : "";

                card.innerHTML = `
                    <h3>${r.name}</h3>
                    ${imgHtml}
                    <p class="meta">
                        ${r.calories} kcal • 
                        ${proteinText}${carbsText}${r.ingredients}
                    </p>
                `;

                grid.appendChild(card);
            });

            // After loading, re-apply current search term (if any)
            applyRecipeSearchFilter();
        })
        .catch(err => console.error("Error loading saved recipes:", err));
}

// Apply search only to SAVED recipes, not example recipes
function applyRecipeSearchFilter() {
    const grid = document.getElementById("saved-recipes-grid");
    const section = document.getElementById("saved-recipes-section");
    if (!grid || !section) return;

    // Older compatible way (no optional chaining)
    let term = "";
    if (searchInput && searchInput.value) {
        term = searchInput.value;
    }
    term = term.toLowerCase().trim();

    const cards = grid.querySelectorAll(".glass-card");

    // Remove old "no results" message if present
    const oldMsg = document.getElementById("no-recipes-message");
    if (oldMsg) oldMsg.remove();

    // If there are no cards at all, nothing to filter
    if (cards.length === 0) {
        return;
    }

    let anyVisible = false;

    cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        const match = term === "" || text.includes(term);

        card.style.display = match ? "" : "none";

        if (match) {
            anyVisible = true;
        }
    });

    // If user typed something AND no cards are visible → show message
    if (term !== "" && !anyVisible) {
        const msg = document.createElement("p");
        msg.id = "no-recipes-message";
        msg.className = "meta";
        msg.textContent = "No recipes with that name.";
        grid.appendChild(msg);
    }
}

// Attach search listener (only affects saved recipes)
if (searchInput) {
    searchInput.addEventListener("input", applyRecipeSearchFilter);
}

// Load existing recipes (if any) when page loads
loadSavedRecipes();
