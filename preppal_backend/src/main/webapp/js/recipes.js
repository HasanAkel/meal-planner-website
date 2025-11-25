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

// ---- CREATE (POST) from form ----
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

// ---- READ + DISPLAY SAVED RECIPES ----
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
                // still need to sync example recipes (show all)
                updateExampleVisibility([]);
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

            // hide/show example recipes depending on what's saved
            updateExampleVisibility(data);

            applyRecipeSearchFilter();
        })
        .catch(err => console.error("Error loading saved recipes:", err));
}

// ---- SYNC EXAMPLE RECIPES WITH SAVED ONES ----
function updateExampleVisibility(savedRecipes) {
    const exampleCards = document.querySelectorAll(".example-recipe");
    if (!exampleCards.length) return;

    const savedNames = new Set(
        (savedRecipes || []).map(r =>
            (r.name || "").trim().toLowerCase()
        )
    );

    exampleCards.forEach(card => {
        // prefer data-name, fallback to heading text
        const exName =
            (card.dataset.name ||
             (card.querySelector("h3") ? card.querySelector("h3").textContent : "")
            ).trim().toLowerCase();

        if (!exName) return;

        if (savedNames.has(exName)) {
            // already saved → hide from example list
            card.style.display = "none";
        } else {
            // not saved → show
            card.style.display = "";
        }
    });
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

// ---- save example recipes into Saved Recipes ----
function initExampleRecipeSaveButtons() {
    const exampleCards = document.querySelectorAll(".example-recipe");

    exampleCards.forEach(card => {
        const btn = card.querySelector(".save-example-btn");
        if (!btn) return;

        btn.addEventListener("click", () => {
            const name        = card.dataset.name;
            const calories    = card.dataset.calories;
            const protein     = card.dataset.protein;
            const carbs       = card.dataset.carbs;
            const fat         = card.dataset.fat;
            const ingredients = card.dataset.ingredients;
            const image       = card.dataset.image;

            const params = new URLSearchParams();
            params.append("name", name);
            params.append("calories", calories);
            params.append("protein", protein);
            params.append("carbs", carbs);
            params.append("fat", fat);
            params.append("ingredients", ingredients);
            params.append("image", image);

            fetch(`${RECIPES_URL}?${params.toString()}`, {
                method: "POST"
            })
            .then(response => {
                if (response.status === 401) {
                    alert("Please log in to save recipes.");
                    window.location.href = "registration.html";
                    return;
                }
                if (!response.ok) {
                    throw new Error("Failed to save example recipe");
                }

                // Instead of removing permanently, just reload & let
                // updateExampleVisibility() hide it.
                loadSavedRecipes();
            })
            .catch(err => console.error("Error saving example recipe:", err));
        });
    });
}

// initial loads
loadSavedRecipes();
initExampleRecipeSaveButtons();
