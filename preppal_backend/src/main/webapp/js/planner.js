const RECIPE_SERVLET_URL = "/preppal_backend/planner";
let RECIPE_DATA = {};
const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

let totalNutrition = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0
};

// In-memory weekly plan: multiple meals per day
let weeklyPlan = {};
weekdays.forEach(day => {
  weeklyPlan[day] = [];
});

function updateWeeklyTotals() {
  document.getElementById("totalCalories").textContent = `${totalNutrition.calories} kcal energy`;
  document.getElementById("totalProtein").textContent = `${totalNutrition.protein} g protein`;
  document.getElementById("totalCarbs").textContent = `${totalNutrition.carbs} g carbs`;
  document.getElementById("totalFat").textContent = `${totalNutrition.fat} g fat`;
}

function debugDOMState() {
  console.log("=== DOM STATE DEBUG ===");
  document.querySelectorAll(".calender-item-container").forEach((container, index) => {
    const dayName = container.dataset.day;
    const meals = weeklyPlan[dayName] || [];
    console.log(`Day ${index} (${dayName}):`, meals);
  });
  console.log("=== END DEBUG ===");
}

// ---------- LOAD RECIPES FOR DROPDOWN ----------
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
        protein: r.protein || 0,
        carbs: r.carbs || 0,
        fat: r.fat || 0,
        ingredients: r.ingredients,
      };
    });

    console.log("RECIPE_DATA after loading:", RECIPE_DATA);
    initPlanner();

    // Load saved plan for this week from backend (if your servlet supports it)
    await loadSavedPlan();
  } catch (err) {
    console.log("Error fetching the recipes:", err);
  }
}

// ---------- LOAD SAVED PLAN FROM BACKEND ----------
async function loadSavedPlan() {
  try {
    const res = await fetch(`${RECIPE_SERVLET_URL}?action=getSavedPlan`);
    if (!res.ok) {
      console.error("Failed to load saved plan");
      return;
    }

    const savedMeals = await res.json();
    console.log("Saved plan from server:", savedMeals);

    // reset local plan
    weekdays.forEach(day => {
      weeklyPlan[day] = [];
    });

    // build weeklyPlan from server data
    savedMeals.forEach(m => {
      const dayName = m.dayOfWeek; // e.g. "Sunday"
      const normalizedDay =
        weekdays.find(d => d.toLowerCase() === dayName.toLowerCase()) || null;

      if (!normalizedDay) return;

      const recipeName = m.name;
      const recipeEntry = RECIPE_DATA[recipeName];

      if (!recipeEntry) {
        console.warn("Recipe from saved plan not in RECIPE_DATA:", recipeName);
        return;
      }

      weeklyPlan[normalizedDay].push({
        recipeId: recipeEntry.id,
        name: recipeName,
      });
    });

    // refresh UI
    recomputeWeeklySummary();
    weekdays.forEach(day => updateDayVisual(day));

  } catch (err) {
    console.error("Error loading saved plan:", err);
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

// ---------- REBUILD WEEKLY SUMMARY FROM weeklyPlan ----------
function recomputeWeeklySummary() {
  const weeklyItemsContainer = document.querySelector(".week-summary-selected");
  if (!weeklyItemsContainer) return;

  weeklyItemsContainer.innerHTML = "";
  totalNutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 };

  weekdays.forEach((dayName, dayIndex) => {
    const meals = weeklyPlan[dayName] || [];
    meals.forEach(meal => {
      const r = RECIPE_DATA[meal.name];
      if (!r) return;

      totalNutrition.calories += r.calories || 0;
      totalNutrition.protein += r.protein || 0;
      totalNutrition.carbs += r.carbs || 0;
      totalNutrition.fat += r.fat || 0;

      weeklyItemsContainer.insertAdjacentHTML(
        "beforeend",
        generateSelectedInfo(r, meal.name, dayIndex)
      );
    });
  });

  updateWeeklyTotals();
}

// ---------- UPDATE VISUALS FOR A SINGLE DAY ----------
function updateDayVisual(dayName) {
  const container = document.querySelector(
    `.calender-item-container[data-day="${dayName}"]`
  );
  if (!container) return;

  const box = container.querySelector(".calender-item");
  const hoverInfo = box.querySelector(".hover-info");
  const titleEl = hoverInfo?.querySelector("h4");
  const caloriesEl = hoverInfo?.querySelector(".calories");
  const proteinEl = hoverInfo?.querySelector(".protein");
  const carbsEl = hoverInfo?.querySelector(".carbs");
  const fatEl = hoverInfo?.querySelector(".fat");

  let img = box.querySelector(".selectedImg");
  const meals = weeklyPlan[dayName] || [];

  // MAIN BOX (most recent meal)
  if (meals.length === 0) {
    // No meals: remove image + reset hover
    if (img) img.remove();
    if (hoverInfo) {
      hoverInfo.style.display = "";
      if (titleEl) titleEl.textContent = "Choose a recipe";
      if (caloriesEl) caloriesEl.textContent = "0 kcal";
      if (proteinEl) proteinEl.textContent = "0g protein";
      if (carbsEl) carbsEl.textContent = "0g carbs";
      if (fatEl) fatEl.textContent = "0g fat";
    }
  } else {
    const latestMeal = meals[meals.length - 1];
    const r = RECIPE_DATA[latestMeal.name];

    if (r) {
      if (!img) {
        img = document.createElement("img");
        img.className = "selectedImg";
        box.prepend(img);
      }
      img.src = `../imgs/${r.img}`;
      img.alt = latestMeal.name;

      if (hoverInfo) {
        hoverInfo.style.display = "";
        if (titleEl) titleEl.textContent = latestMeal.name;
        if (caloriesEl) caloriesEl.textContent = `${r.calories || 0} kcal`;
        if (proteinEl) proteinEl.textContent = `${r.protein || 0}g protein`;
        if (carbsEl)   carbsEl.textContent   = `${r.carbs   || 0}g carbs`;
        if (fatEl)     fatEl.textContent     = `${r.fat     || 0}g fat`;
      }
    }
  }

  // LIST UNDER ARROW
  let list = container.querySelector(".day-meal-list");
  if (!list) {
    list = document.createElement("div");
    list.className = "day-meal-list";
    container.appendChild(list);
  }

  list.innerHTML = "";

  meals.forEach((meal, idx) => {
    const pill = document.createElement("div");
    pill.className = "day-meal-pill";
    pill.innerHTML = `
      <span class="day-meal-name">${meal.name}</span>
      <button type="button" class="day-meal-remove" title="Remove">&times;</button>
    `;

    const btn = pill.querySelector(".day-meal-remove");
    btn.addEventListener("click", () => {
      // Remove this meal from weeklyPlan
      weeklyPlan[dayName].splice(idx, 1);
      recomputeWeeklySummary();
      updateDayVisual(dayName);
    });

    list.appendChild(pill);
  });
}

// ---------- INIT PLANNER INTERACTIONS ----------
function initPlanner() {
  // Set initial hover text
  document.querySelectorAll(".calender-item .hover-info h4").forEach((h4) => {
    h4.textContent = "Choose a recipe";
  });

  // Ensure visuals are clean at start
  weekdays.forEach(dayName => updateDayVisual(dayName));

  // Each day’s dropdown behavior
  document.querySelectorAll(".image-container").forEach((container) => {
    container.addEventListener("click", (e) => {
      e.stopPropagation();

      const dayContainer = container.closest(".calender-item-container");
      if (!dayContainer) return;

      const dayName = dayContainer.dataset.day;

      // Close other menus & reset open state
      document.querySelectorAll(".dropdown-menu").forEach((menu) => menu.remove());
      document
        .querySelectorAll(".calender-item-container.is-open")
        .forEach((c) => c.classList.remove("is-open"));

      dayContainer.classList.add("is-open");

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

          // Update weeklyPlan
          const mealsForDay = weeklyPlan[dayName] || [];
          mealsForDay.push({
            recipeId: data.id,
            name: choice
          });
          weeklyPlan[dayName] = mealsForDay;

          // Refresh summary + visuals for that day
          recomputeWeeklySummary();
          updateDayVisual(dayName);

          // Close dropdown
          dropdown.remove();
          dayContainer.classList.remove("is-open");

          console.log("Updated weeklyPlan:", weeklyPlan);
        });
      });
    });
  });

  // Click outside closes dropdown
  document.addEventListener("click", () => {
    document.querySelectorAll(".dropdown-menu").forEach((menu) => menu.remove());
    document
      .querySelectorAll(".calender-item-container.is-open")
      .forEach((c) => c.classList.remove("is-open"));
  });
}

// ---------- SAVE WEEKLY PLAN ----------
const saveBtn = document.getElementById("saveBtn");
if (saveBtn) {
  saveBtn.addEventListener("click", savePlannedMeals);
}

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

      weekdays.forEach((dayName, index) => {
        const meals = weeklyPlan[dayName] || [];
        const plannedDate = new Date(startOfWeek);
        plannedDate.setDate(startOfWeek.getDate() + index);
        const formattedDate = plannedDate.toISOString().split("T")[0];

        meals.forEach(meal => {
          plannedMeals.push({
            recipeId: meal.recipeId,
            dayOfWeek: dayName,
            plannedDate: formattedDate,
          });
        });
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

// ---------- CLEAR WEEKLY PLAN ----------
const clearBtn = document.getElementById("clearBtn");
if (clearBtn) {
  clearBtn.addEventListener("click", clearPlanner);
}

function clearPlanner() {
  if (!confirm("Clear all recipes from this week's plan?")) return;

  // Reset in-memory plan
  weekdays.forEach(day => {
    weeklyPlan[day] = [];
  });

  // Reset UI summary + day visuals
  recomputeWeeklySummary();
  weekdays.forEach(day => updateDayVisual(day));

  // Persist cleared plan: overwrite this week's planned meals with empty
  fetch("/preppal_backend/auth")
    .then(res => res.json())
    .then(authData => {
      if (authData.status !== "logged_in") {
        // If somehow not logged in, just clear UI silently
        return;
      }

      const emptyMeals = [];
      return fetch("/preppal_backend/planner", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `action=saveMeals&meals=${encodeURIComponent(JSON.stringify(emptyMeals))}`,
      });
    })
    .then(res => {
      if (!res) return;
      return res.json();
    })
    .then(result => {
      if (result) {
        console.log("Clear plan result:", result);
        // optional: alert("Weekly plan cleared.");
      }
    })
    .catch(err => {
      console.error("Error clearing planner:", err);
      alert("Error clearing plan. Please try again.");
    });
}

function getStartOfWeek() {
  const today = new Date();
  const day = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const diff = today.getDate() - day;
  return new Date(today.setDate(diff));
}

// ---------- PRINT ----------
const printBtn = document.getElementById("printBtn");
if (printBtn) {
  printBtn.addEventListener("click", () => {
    const selectedRecipes = document.querySelectorAll(".week-summary-selected .selected-info");

    if (!selectedRecipes.length) {
      alert("No recipes selected to print.");
      return;
    }

    // CSS @media print already hides everything except #weekSummary,
    // which includes these selected recipes.
    window.print();
  });
}

// ---------- INITIAL LOAD ----------
window.addEventListener("DOMContentLoaded", loadRecipes);
