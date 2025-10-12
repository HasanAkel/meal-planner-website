const aiWelcomePage = document.getElementById("ai-welcome-page");
const modeSelection = document.getElementById("mode-selection");
const startBtn = document.getElementById("start-ai-btn");
startBtn.addEventListener("click", () => {
    aiWelcomePage.style.display = "none"; // hide the start button
    modeSelection.style.display = "flex"; // show the mode buttons
    modeSelection.style.flexDirection = "column";
    modeSelection.style.gap = "10px";
});
