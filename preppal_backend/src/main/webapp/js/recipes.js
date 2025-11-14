const addRecipeBtn = document.getElementById("add-recipe-btn");
const addRecipeForm = document.getElementById("add-recipe-form");
const recipeControlsSection = document.getElementById("recipes-controls");
const cancelBtn = document.getElementById("cancel-btn");

cancelBtn.addEventListener("click", function() {
        addRecipeForm.classList.add("hidden");
        addRecipeForm.classList.remove("top-spacing");
        recipeControlsSection.classList.remove("hidden");
});
addRecipeBtn.addEventListener("click", function() {
        addRecipeForm.classList.remove("hidden");
        addRecipeForm.classList.add("top-spacing");
        recipeControlsSection.classList.add("hidden");
});


addRecipeForm.addEventListener("submit", function(event) {
    event.preventDefault(); // prevent page reload

    const formData = new FormData(addRecipeForm);

    fetch("recipes", {
        method: "POST",
        body: formData
    })
    .then(() => {
        // hide form again
        addRecipeForm.classList.add("hidden");
        recipeControlsSection.classList.remove("hidden");

        // clear form
        addRecipeForm.reset();

        // reload saved recipes from the backend
        loadSavedRecipes();
    })
    .catch(err => console.error("Error while saving recipe:", err));
});



function loadSavedRecipes() {
    fetch("recipes")
        .then(response => response.json())
        .then(data => {
            const grid = document.getElementById("saved-recipes-grid");
            grid.innerHTML = "";

            data.forEach(r => {
                const card = document.createElement("article");
                card.classList = "glass-card";
                card.innerHTML = `
                    <h3>${r.name}</h3>
                    <p class="meta">${r.calories} kcal • ${r.ingredients}</p>
                `;
                grid.appendChild(card);
            });
        })
        .catch(err => console.error("Error loading saved recipes:", err));
}

// Load on page start
loadSavedRecipes();
