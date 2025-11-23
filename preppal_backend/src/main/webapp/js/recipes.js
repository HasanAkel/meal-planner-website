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

// ---- CREATE (POST) ----
addRecipeForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("recipe-name").value;
    const calories = document.getElementById("recipe-calories").value;
    const protein = document.getElementById("recipe-protein").value;
    const carbs = document.getElementById("recipe-carbs").value;
	const fat = document.getElementById("recipe-fat").value;
    const ingredients = document.getElementById("recipe-ingredients").value;

    const imageInput = document.getElementById("recipe-image");
    const imagePath = imageInput.files.length > 0 ? imageInput.files[0].name : "";

    const params = new URLSearchParams();
    params.append("name", name);
    params.append("calories", calories);
    params.append("protein", protein);
    params.append("carbs", carbs);
	params.append("fat", fat);
    params.append("ingredients", ingredients);
    params.append("image", imagePath);

    fetch(`${RECIPES_URL}?${params.toString()}`, {
        method: "POST"
    })
        .then(() => {
            addRecipeForm.classList.add("hidden");
            recipeControlsSection.classList.remove("hidden");
            addRecipeForm.reset();
            loadSavedRecipes();
        })
        .catch(err => console.error("Error while saving recipe:", err));
});

// ---- READ + DISPLAY ----
function loadSavedRecipes() {
    fetch(RECIPES_URL)
        .then(response => response.json())
        .then(data => {
            const section = document.getElementById("saved-recipes-section");
            const grid = document.getElementById("saved-recipes-grid");

            if (!section || !grid) return;

            grid.innerHTML = "";

            if (!Array.isArray(data) || data.length === 0) {
                section.classList.add("hidden");
                return;
            }

            section.classList.remove("hidden");

            data.forEach(r => {
                const card = document.createElement("article");
                card.className = "glass-card";

                let imgHtml = "";
                if (r.imagePath && r.imagePath.trim() !== "") {
                    imgHtml = `
                        <img src="../imgs/${r.imagePath}" 
                             alt="${r.name}" 
                             class="recipe-img">
                    `;
                }

                const proteinText = (r.protein != null && r.protein !== 0)
                    ? `${r.protein} g protein • `
                    : "";
                const carbsText = (r.carbs != null && r.carbs !== 0)
                    ? `${r.carbs} g carbs • `
                    : "";
					const fatText = (r.fat != null && r.fat !== 0)
					    ? `${r.fat} g fat • `
					    : "";

                card.innerHTML = `
                    <h3>${r.name}</h3>
                    ${imgHtml}
                    <p class="meta">
                        ${r.calories} kcal • 
                        ${proteinText}${carbsText}${fatText}${r.ingredients}
                    </p>

                    <button class="delete-recipe-btn" data-id="${r.id}">
                        Delete
                    </button>
                `;

                grid.appendChild(card);

                // ---- DELETE HANDLER ----
                const deleteBtn = card.querySelector(".delete-recipe-btn");
                deleteBtn.addEventListener("click", function () {
                    const recipeId = this.getAttribute("data-id");

                    fetch(`${RECIPES_URL}?id=${recipeId}`, {
                        method: "DELETE"
                    })
                    .then(() => loadSavedRecipes())
                    .catch(err => console.error("Error deleting recipe:", err));
                });
            });

            applyRecipeSearchFilter();
        })
        .catch(err => console.error("Error loading saved recipes:", err));
}

// ---- SEARCH (saved recipes only) ----
function applyRecipeSearchFilter() {
    const grid = document.getElementById("saved-recipes-grid");
    const section = document.getElementById("saved-recipes-section");
    if (!grid || !section) return;

    let term = "";
    if (searchInput && searchInput.value) {
        term = searchInput.value;
    }
    term = term.toLowerCase().trim();

    const cards = grid.querySelectorAll(".glass-card");

    const oldMsg = document.getElementById("no-recipes-message");
    if (oldMsg) oldMsg.remove();

    if (cards.length === 0) return;

    let anyVisible = false;

    cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        const match = term === "" || text.includes(term);

        card.style.display = match ? "" : "none";

        if (match) anyVisible = true;
    });

    if (term !== "" && !anyVisible) {
        const msg = document.createElement("p");
        msg.id = "no-recipes-message";
        msg.className = "meta";
        msg.textContent = "No recipes with that name.";
        grid.appendChild(msg);
    }
}

if (searchInput) {
    searchInput.addEventListener("input", applyRecipeSearchFilter);
}

loadSavedRecipes();
