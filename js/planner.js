document.querySelectorAll(".image-container").forEach(container => {
    container.addEventListener("click", (e) => {

        e.stopPropagation();
        document.querySelectorAll(".dropdown-menu").forEach(menu => menu.remove());

        const dropdown = document.createElement("div");
        dropdown.className = "dropdown-menu show";
        dropdown.innerHTML = `
            <div class="dropdown-option">Chicken</div>
            <div class="dropdown-option">Pizza</div>
            <div class="dropdown-option">Honey Glaze Ribs</div>
        `;

        container.appendChild(dropdown);

        dropdown.querySelectorAll(".dropdown-option").forEach(opt => {
            opt.addEventListener("click", (ev) => {
                ev.stopPropagation();
                // JS: need to dynamically create selected-item in the HTML and showcase the users selected option 
                // JS: also need to change the calenders background dynamically on the correct slected day
                alert(opt.textContent);
                dropdown.remove();
            });
        });
    });
});

document.addEventListener("click", () => {
    document.querySelectorAll(".dropdown-menu").forEach(menu => menu.remove());
});
