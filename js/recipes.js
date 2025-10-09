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
