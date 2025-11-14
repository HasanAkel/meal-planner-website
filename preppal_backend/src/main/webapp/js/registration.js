const aiWelcomePage = document.getElementById("ai-welcome-page");
const modeSelection = document.getElementById("mode-selection");
const startBtn = document.getElementById("start-ai-btn");
startBtn.addEventListener("click", () => {
    aiWelcomePage.style.display = "none"; // hide the start button
    modeSelection.style.display = "flex"; // show the mode buttons
    modeSelection.style.flexDirection = "column";
    modeSelection.style.gap = "10px";
});

const chatModeBtn = document.getElementById("chat-mode-btn");
const voiceModeBtn = document.getElementById("voice-mode-btn");

chatModeBtn.addEventListener("click", () => {
    //<!-- Do the backend stuff that will link an ai chatbot to this -->
});
voiceModeBtn.addEventListener("click", () => {
    //<!-- Do the backend stuff that will link an ai voice bot to this -->
});