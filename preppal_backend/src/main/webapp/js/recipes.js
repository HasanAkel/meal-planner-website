const addRecipeBtn = document.getElementById("add-recipe-btn");
const addRecipeForm = document.getElementById("add-recipe-form");
const recipeControlsSection = document.getElementById("recipes-controls");
const cancelBtn = document.getElementById("cancel-btn");

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

addRecipeForm.addEventListener("submit", function (event) {
    event.preventDefault(); // prevent full page reload

    // Grab values manually
    const name = document.getElementById("recipe-name").value;
    const calories = document.getElementById("recipe-calories").value;
    const ingredients = document.getElementById("recipe-ingredients").value;

    // For now, just store the file name (or empty string)
    const imageInput = document.getElementById("recipe-image");
    const imagePath = imageInput.files.length > 0 ? imageInput.files[0].name : "";

    // Build query string instead of body
    const params = new URLSearchParams();
    params.append("name", name);
    params.append("calories", calories);
    params.append("ingredients", ingredients);
    params.append("image", imagePath);

    // Send POST request with parameters in the URL
    fetch(`${RECIPES_URL}?${params.toString()}`, {
        method: "POST"
        // no body, no Content-Type needed
    })
        .then(() => {
            addRecipeForm.classList.add("hidden");
            recipeControlsSection.classList.remove("hidden");
            addRecipeForm.reset();
            loadSavedRecipes();
        })
        .catch(err => console.error("Error while saving recipe:", err));
});


function loadSavedRecipes() {
    fetch(RECIPES_URL)
        .then(response => response.json())
        .then(data => {
            const grid = document.getElementById("saved-recipes-grid");
            if (!grid) return;

            grid.innerHTML = "";

            data.forEach(r => {
                const card = document.createElement("article");
                card.className = "glass-card";
                card.innerHTML = `
                    <h3>${r.name}</h3>
                    <p class="meta">${r.calories} kcal • ${r.ingredients}</p>
                `;
                grid.appendChild(card);
            });
        })
        .catch(err => console.error("Error loading saved recipes:", err));
}

loadSavedRecipes();
