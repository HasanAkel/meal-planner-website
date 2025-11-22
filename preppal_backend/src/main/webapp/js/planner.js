// Minimal data for this draft
/*const RECIPE_DATA = {
  "Chicken Salad": { img: "./imgs/chicken_veg.jpg" },
  Pizza: { img: "./imgs/pizza.avif" },
  "BBQ Ribs": { img: "./imgs/ribs.jpg" },
};
*/

const RECIPE_SERVLET_URL = "/preppal_backend/planner"
let RECIPE_DATA = {};
const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let totalNutrition = {
	calories:0,
	protein:0,
	carbs:0
};

function updateWeeklyTotals() {
  document.getElementById('totalCalories').textContent = `${totalNutrition.calories} kcal energy`;
  document.getElementById('totalProtein').textContent = `${totalNutrition.protein} g protein`;
  document.getElementById('totalCarbs').textContent = `${totalNutrition.carbs} g carbs`;
}


async function loadRecipes(){
	
	try{
		const res = await fetch(RECIPE_SERVLET_URL);
		
		// either in the range of 4xx to 5xx 
		if(!res.ok) throw new Error("Unknown error, please try again");
		
		const recipes = await res.json();
		recipes.forEach(r => {
			RECIPE_DATA[r.name] = {
				id:r.id,
				img: r.imagePath,
				calories: r.calories,
                ingredients: r.ingredients
			}
		})
		initPlanner();
	}catch(err){
		console.log("Error fetching the recipes:",err);
	}
	
}


function generateSelectedInfo(r,choice,dayIdx){
	const dayName = weekdays[dayIdx] || "Day"
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
	              0 g
	            </div>
	            <div class="stat-headings stat-carb">
	              <i class="fa-sharp fa-solid fa-plate-wheat fa-lg"></i>
	              0 g
	            </div>
	          </div>
	        </div>
	        <p>${r.ingredients}</p>
	      </div>
	    </div>	
	`;
}


function initPlanner(){
	
	// Make initial text neutral
	document.querySelectorAll(".calender-item .hover-info h4").forEach((h4) => {
	  h4.textContent = "Choose a recipe";
	});
	document.querySelectorAll(".calender-item .tile-caption").forEach((c) => {
	  if (!c.textContent.trim()) c.textContent = "Choose a recipe";
	});
	
	
	
	document.querySelectorAll(".image-container").forEach((container,index) => {
	  container.addEventListener("click", (e) => {
	    e.stopPropagation();
		
		const dayIndex = index;
		
	    // Close other menus & lower raised tiles
	    document
	      .querySelectorAll(".dropdown-menu")
	      .forEach((menu) => menu.remove());
	    document
	      .querySelectorAll(".calender-item-container.is-open")
	      .forEach((c) => c.classList.remove("is-open"));
	
	    const dayContainer = container.closest(".calender-item-container");
	    if (dayContainer) dayContainer.classList.add("is-open");
	
	    const dropdown = document.createElement("div");
	    dropdown.className = "dropdown-menu show";
	    dropdown.innerHTML = Object.keys(RECIPE_DATA).map(name => `<div class="dropdown-option">${name}</div>`).join('');
		
	
	    container.appendChild(dropdown);
	
	    dropdown.querySelectorAll(".dropdown-option").forEach((opt) => {
	      opt.addEventListener("click", (ev) => {
	        ev.stopPropagation();
	
	        const choice = opt.textContent.trim();
	        const data = RECIPE_DATA[choice] || {};
	
	        const box = dayContainer.querySelector(".calender-item");
	        const hover = box.querySelector(".hover-info h4");
	        const cap = box.querySelector(".tile-caption");
			const hoverInfo = box.querySelector(".hover-tags");
			
	        // background image
	        let img = box.querySelector(".selectedImg");
	        if (!img) {
	          img = document.createElement("img");
	          img.className = "selectedImg";
	          box.prepend(img);
	        }
	        img.src = `../imgs/${data.img}` || "";
	        img.alt = choice;
	
	        // update name: visible caption + hover title
	        if (cap) {
	          cap.textContent = choice;
	        }
			if(hover) hover.textContent = choice;
	        if (hoverInfo) {
			  hoverInfo.querySelector(".calories").textContent = `${data.calories || 0} kcal`;
			  hoverInfo.querySelector(".protein").textContent = `${data.protein || 0} g protein`;
			  hoverInfo.querySelector(".carbs").textContent = `${data.carbs || 0} g carbs`;
	        }
			
			const weeklyItemsContainer = document.querySelector('.week-summary-selected');
			
			/*if we have the same existing item update, delete for now*/
			const existingSelectedItem = weeklyItemsContainer.querySelector(`[data-day="${dayIndex}"]`);
			if(existingSelectedItem && existingSelectedItem.querySelector('h2').textContent.trim() === choice){
				dropdown.remove();
				dayContainer.classList.remove("is-open");
				return;	
			}
			
			if (existingSelectedItem) {
				const oldChoice = existingSelectedItem.querySelector('h2').textContent.trim();
				const oldData = RECIPE_DATA[oldChoice] || {};
				
				totalNutrition.calories -= oldData.calories || 0;
				totalNutrition.protein -= oldData.protein || 0;
				totalNutrition.carbs -= oldData.carbs || 0;

				existingSelectedItem.remove();
			}

			// Add new recipe nutrition
			totalNutrition.calories += data.calories || 0;
			totalNutrition.protein += data.protein || 0;
			totalNutrition.carbs += data.carbs || 0;

			updateWeeklyTotals();
			
			
			/* select all selectedItems*/
			const selectedItems = weeklyItemsContainer.querySelectorAll(".selected-info"); 
			
			/* insert in the end for now and update the position later*/
			weeklyItemsContainer.insertAdjacentHTML("beforeend", generateSelectedInfo(data,choice,dayIndex));

			/*find the next next day (biggest index)*/
			const newEntry = weeklyItemsContainer.lastElementChild; 
			const nextEntry = Array.from(selectedItems).find(
			  el => Number(el.dataset.day) > dayIndex
			);

			if (nextEntry) {
			    weeklyItemsContainer.insertBefore(newEntry, nextEntry);
			}
			
			
	        // close & reset z-index
	        dropdown.remove();
	        dayContainer.classList.remove("is-open");
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

document.getElementById("printBtn").addEventListener("click",() => {
	window.print();
})


/* get the data as soon as DOM is loaded*/
window.addEventListener("DOMContentLoaded",loadRecipes);
