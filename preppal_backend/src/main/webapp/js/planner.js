// Minimal data for this draft
/*const RECIPE_DATA = {
  "Chicken Salad": { img: "./imgs/chicken_veg.jpg" },
  Pizza: { img: "./imgs/pizza.avif" },
  "BBQ Ribs": { img: "./imgs/ribs.jpg" },
};
*/

const RECIPE_SERVLET_URL = "/preppal_backend/planner"
let RECIPE_DATA = {};

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


function initPlanner(){
	
	// Make initial text neutral
	document.querySelectorAll(".calender-item .hover-info h4").forEach((h4) => {
	  h4.textContent = "Choose a recipe";
	});
	document.querySelectorAll(".calender-item .tile-caption").forEach((c) => {
	  if (!c.textContent.trim()) c.textContent = "Choose a recipe";
	});
	
	
	
	document.querySelectorAll(".image-container").forEach((container) => {
	  container.addEventListener("click", (e) => {
	    e.stopPropagation();
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
	
	        // background image
	        let img = box.querySelector(".selectedImg");
	        if (!img) {
	          img = document.createElement("img");
	          img.className = "selectedImg";
	          box.prepend(img);
	        }
	        img.src = data.img || "";
	        img.alt = choice;
	
	        // update name: visible caption + hover title
	        if (cap) {
	          cap.textContent = choice;
	        }
	        if (hover) {
	          hover.textContent = choice;
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


/* get the data as soon as DOM is loaded*/
window.addEventListener("DOMContentLoaded",loadRecipes);
