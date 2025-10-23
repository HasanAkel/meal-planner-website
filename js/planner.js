// Minimal data for this draft
const RECIPE_DATA = {
  "Chicken Salad": { img: "./imgs/chicken_veg.jpg" },
  Pizza: { img: "./imgs/pizza.avif" },
  "BBQ Ribs": { img: "./imgs/ribs.jpg" },
};

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
    dropdown.innerHTML = `
      <div class="dropdown-option">Chicken Salad</div>
      <div class="dropdown-option">Pizza</div>
      <div class="dropdown-option">BBQ Ribs</div>
    `;

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
