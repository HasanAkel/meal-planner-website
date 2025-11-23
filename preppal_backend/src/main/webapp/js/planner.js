// Minimal data for this draft
/*const RECIPE_DATA = {
  "Chicken Salad": { img: "./imgs/chicken_veg.jpg" },
  Pizza: { img: "./imgs/pizza.avif" },
  "BBQ Ribs": { img: "./imgs/ribs.jpg" },
};
*/

const RECIPE_SERVLET_URL = "/preppal_backend/planner";
let RECIPE_DATA = {};
const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let totalNutrition = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0
};

function updateWeeklyTotals() {
  document.getElementById("totalCalories").textContent = `${totalNutrition.calories} kcal energy`;
  document.getElementById("totalProtein").textContent = `${totalNutrition.protein} g protein`;
  document.getElementById("totalCarbs").textContent = `${totalNutrition.carbs} g carbs`;
  document.getElementById("totalFat").textContent = `${totalNutrition.fat} g fat`;
}

function debugDOMState() {
  console.log("=== DOM STATE DEBUG ===");
  document.querySelectorAll(".calender-item-container").forEach((container, index) => {
    const caption = container.querySelector(".tile-caption");
    const hoverTitle = container.querySelector(".hover-info h4");
    const recipeId = container.getAttribute("data-recipe-id");
    const recipeName = container.getAttribute("data-recipe-name");

    console.log(`Day ${index}:`, {
      caption: caption?.textContent,
      hoverTitle: hoverTitle?.textContent,
      recipeId: recipeId,
      recipeName: recipeName,
      containerData: container.dataset,
    });
  });
  console.log("=== END DEBUG ===");
}

async function loadRecipes() {
  try {
    const res = await fetch(RECIPE_SERVLET_URL);

    if (!res.ok) throw new Error("Unknown error, please try again");

    const recipes = await res.json();
    console.log("Loaded recipes from server:", recipes);

    // Clear RECIPE_DATA first
    RECIPE_DATA = {};

    recipes.forEach((r) => {
      RECIPE_DATA[r.name] = {
        id: r.id,
        img: r.imagePath,
        calories: r.calories,
        protein: r.protein || 0, // default values
        carbs: r.carbs || 0,
        fat: r.fat || 0,
        ingredients: r.ingredients,
      };
    });

    console.log("RECIPE_DATA after loading:", RECIPE_DATA);
    initPlanner();
  } catch (err) {
    console.log("Error fetching the recipes:", err);
  }
}

function generateSelectedInfo(r, choice, dayIdx) {
  const dayName = weekdays[dayIdx] || "Day";
  return `
	<div class="selected-info" data-day="${dayIdx}">
	      <div class="img-container">
			  <div class="selected-day">
			  	<p>${dayName}</p>
			  </div>
		      <img class="selected-img" src="../imgs/${r.img}" alt="${choice}"/>
	      </div>
	      <div class="information-selected">
	        <h2>${choice}</h2>
	        <div class="information-stats">
	          <div class="stat-grid">
	            <div class="stat-headings stat-eng">
	              <i class="fa-sharp fa-solid fa-fire fa-lg"></i>
	              ${r.calories} kcal
	            </div>
	            <div class="stat-headings stat-prot">
	              <i class="fa-sharp fa-solid fa-leaf fa-lg"></i>
	              ${r.protein || 0} g
	            </div>
	            <div class="stat-headings stat-carb">
	              <i class="fa-sharp fa-solid fa-plate-wheat fa-lg"></i>
	              ${r.carbs || 0} g
	            </div>
				<div class="stat-headings stat-fat">
          <img src="../imgs/fat.png" alt="Fat" class="fat-icon" />
					${r.fat || 0} g
				</div>
	          </div>
	        </div>
	        <p>${r.ingredients}</p>
	      </div>
	    </div>	
	`;
}

function initPlanner() {
  // Make initial text neutral
  document.querySelectorAll(".calender-item .hover-info h4").forEach((h4) => {
    h4.textContent = "Choose a recipe";
  });
  document.querySelectorAll(".calender-item .tile-caption").forEach((c) => {
    if (!c.textContent.trim() || c.textContent.trim() === "No recipes") {
      c.textContent = "Choose a recipe";
    }
  });

  document.querySelectorAll(".image-container").forEach((container, index) => {
    container.addEventListener("click", (e) => {
      e.stopPropagation();

      const dayIndex = index;
      const dayContainer = container.closest(".calender-item-container");
      const dayName = dayContainer.dataset.day;

      // Close other menus & lower raised tiles
      document.querySelectorAll(".dropdown-menu").forEach((menu) => menu.remove());
      document
        .querySelectorAll(".calender-item-container.is-open")
        .forEach((c) => c.classList.remove("is-open"));

      if (dayContainer) dayContainer.classList.add("is-open");

      const dropdown = document.createElement("div");
      dropdown.className = "dropdown-menu show";
      dropdown.innerHTML = Object.keys(RECIPE_DATA)
        .map((name) => `<div class="dropdown-option" data-recipe-name="${name}">${name}</div>`)
        .join("");

      container.appendChild(dropdown);

      dropdown.querySelectorAll(".dropdown-option").forEach((opt) => {
        opt.addEventListener("click", (ev) => {
          ev.stopPropagation();

          const choice = opt.textContent.trim();
          const data = RECIPE_DATA[choice];

          console.log("Recipe selected:", choice, "for day:", dayName);
          console.log("Recipe data:", data);

          if (!data) {
            console.error("No data found for recipe:", choice);
            return;
          }

          const box = dayContainer.querySelector(".calender-item");
          const hover = box.querySelector(".hover-info h4");
          const cap = box.querySelector(".tile-caption");
          const hoverInfo = box.querySelector(".hover-tags");

          // Update background image
          let img = box.querySelector(".selectedImg");
          if (!img) {
            img = document.createElement("img");
            img.className = "selectedImg";
            box.prepend(img);
          }
          img.src = `../imgs/${data.img}` || "";
          img.alt = choice;

          if (cap) {
            cap.textContent = choice;
            cap.setAttribute("data-recipe-name", choice);
          }
          if (hover) {
            hover.textContent = choice;
          }

          // Store recipe data in the container for easy retrieval
          dayContainer.setAttribute("data-recipe-id", data.id);
          dayContainer.setAttribute("data-recipe-name", choice);

          // Update hover info with actual data
          if (hoverInfo) {
            const caloriesEl = hoverInfo.querySelector(".calories");
            const proteinEl = hoverInfo.querySelector(".protein");
            const carbsEl = hoverInfo.querySelector(".carbs");

            if (caloriesEl) caloriesEl.textContent = `${data.calories || 0} kcal`;
            if (proteinEl) proteinEl.textContent = `${data.protein || 0} g protein`;
            if (carbsEl) carbsEl.textContent = `${data.carbs || 0} g carbs`;
          }

          const weeklyItemsContainer = document.querySelector(".week-summary-selected");

          // Remove existing item for this day if any
          const existingSelectedItem = weeklyItemsContainer.querySelector(
            `[data-day="${dayIndex}"]`
          );
          if (
            existingSelectedItem &&
            existingSelectedItem.querySelector("h2").textContent.trim() === choice
          ) {
            dropdown.remove();
            dayContainer.classList.remove("is-open");
            return;
          }

          if (existingSelectedItem) {
            const oldChoice = existingSelectedItem.querySelector("h2").textContent.trim();
            const oldData = RECIPE_DATA[oldChoice] || {};

            totalNutrition.calories -= oldData.calories || 0;
            totalNutrition.protein -= oldData.protein || 0;
            totalNutrition.carbs -= oldData.carbs || 0;
            totalNutrition.fat -= oldData.fat || 0;
            existingSelectedItem.remove();
          }

          // Add new recipe nutrition
          totalNutrition.calories += data.calories || 0;
          totalNutrition.protein += data.protein || 0;
          totalNutrition.carbs += data.carbs || 0;
          totalNutrition.fat += data.fat || 0;
          updateWeeklyTotals();

          // Add to weekly summary
          const selectedItems = weeklyItemsContainer.querySelectorAll(".selected-info");
          weeklyItemsContainer.insertAdjacentHTML(
            "beforeend",
            generateSelectedInfo(data, choice, dayIndex)
          );

          const newEntry = weeklyItemsContainer.lastElementChild;
          const nextEntry = Array.from(selectedItems).find(
            (el) => Number(el.dataset.day) > dayIndex
          );

          if (nextEntry) {
            weeklyItemsContainer.insertBefore(newEntry, nextEntry);
          }

          // Close dropdown
          dropdown.remove();
          dayContainer.classList.remove("is-open");

          console.log("Updated container:", {
            day: dayName,
            recipeId: data.id,
            recipeName: choice,
            caption: cap?.textContent,
          });
        });
      });
    });
  });

  document.addEventListener("click", () => {
    document.querySelectorAll(".dropdown-menu").forEach((menu) => menu.remove());
    document
      .querySelectorAll(".calender-item-container.is-open")
      .forEach((c) => c.classList.remove("is-open"));
  });
}

// Save button handler
document.getElementById("saveBtn").addEventListener("click", savePlannedMeals);

function savePlannedMeals() {
  console.log("Save button clicked - checking login status");

  // First check login status
  fetch("/preppal_backend/auth")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((authData) => {
      console.log("Auth check response:", authData);

      if (authData.status !== "logged_in") {
        alert("Please log in to save your meal plan");
        window.location.href = "registration.html";
        return;
      }

      // User is logged in, proceed with saving
      const plannedMeals = [];
      const startOfWeek = getStartOfWeek();

      document.querySelectorAll(".calender-item-container").forEach((container, index) => {
        const recipeId = container.getAttribute("data-recipe-id");
        const recipeName = container.getAttribute("data-recipe-name");
        const dayName = container.dataset.day;

        console.log(`Day ${dayName}:`, { recipeId, recipeName });

        if (recipeId && recipeName && recipeName !== "Choose a recipe") {
          const plannedDate = new Date(startOfWeek);
          plannedDate.setDate(startOfWeek.getDate() + index);

          const formattedDate = plannedDate.toISOString().split("T")[0];

          plannedMeals.push({
            recipeId: parseInt(recipeId),
            dayOfWeek: dayName,
            plannedDate: formattedDate,
          });
        }
      });

      console.log("Planned meals to save:", plannedMeals);

      if (plannedMeals.length === 0) {
        alert("No meals to save. Please add some recipes to your plan.");
        return;
      }

      // Send to backend
      return fetch("/preppal_backend/planner", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `action=saveMeals&meals=${encodeURIComponent(JSON.stringify(plannedMeals))}`,
      });
    })
    .then((response) => {
      if (!response) return; // No response if we redirected to login

      console.log("Save response status:", response.status);
      return response.json();
    })
    .then((result) => {
      if (result) {
        console.log("Save result:", result);
        alert(result.message);
        if (result.status === "success") {
          console.log("Meals saved successfully!");
        }
      }
    })
    .catch((error) => {
      console.error("Error in save process:", error);
      alert("Error saving meal plan. Please try again.");
    });
}

function getStartOfWeek() {
  const today = new Date();
  const day = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const diff = today.getDate() - day;
  return new Date(today.setDate(diff));
}

/* get the data as soon as DOM is loaded*/
window.addEventListener("DOMContentLoaded", loadRecipes);
