// --- 1. THEME SWITCHER LOGIC ---
const themeButtons = document.querySelectorAll('.theme-btn');

themeButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove all previous theme classes from body
        document.body.className = '';
        // Add selected theme class based on data-theme attribute
        const selectedTheme = button.getAttribute('data-theme');
        document.body.classList.add(selectedTheme);
    });
});

// --- 2. GAME 1: REACTION SPEED TEST ---
const reactionBox = document.getElementById('reaction-box');
const startGameBtn = document.getElementById('start-game-btn');
const reactionResult = document.getElementById('reaction-result');

let startTime, timerTimeout;

startGameBtn.addEventListener('click', () => {
    reactionResult.textContent = "";
    reactionBox.textContent = "Wait for GREEN...";
    reactionBox.className = "game-box waiting";

    // Pick a random delay between 2 and 5 seconds
    const randomDelay = Math.floor(Math.random() * 3000) + 2000;

    timerTimeout = setTimeout(() => {
        reactionBox.textContent = "CLICK NOW!";
        reactionBox.className = "game-box ready";
        startTime = Date.now();
    }, randomDelay);
});

reactionBox.addEventListener('click', () => {
    if (reactionBox.classList.contains('ready')) {
        const elapsedTime = Date.now() - startTime;
        reactionResult.textContent = `⚡ Reaction time: ${elapsedTime} ms!`;
        reactionBox.textContent = "Great job!";
        reactionBox.className = "game-box";
    } else if (reactionBox.classList.contains('waiting')) {
        clearTimeout(timerTimeout);
        reactionResult.textContent = "❌ Too early! Click start to try again.";
        reactionBox.textContent = "Failed!";
        reactionBox.className = "game-box";
    }
});

// --- 3. GAME 2: CODE BREAKER MINIGAME ---
const secretCode = Math.floor(Math.random() * 900) + 100; // Random 3-digit number
const codeInput = document.getElementById('code-input');
const guessBtn = document.getElementById('guess-btn');
const codeResult = document.getElementById('code-result');

guessBtn.addEventListener('click', () => {
    const userGuess = parseInt(codeInput.value);

    if (isNaN(userGuess)) {
        codeResult.textContent = "Please enter a valid number!";
    } else if (userGuess === secretCode) {
        codeResult.textContent = "🎉 ACCESS GRANTED! You hacked the system!";
        codeResult.style.color = "#22c55e";
    } else if (userGuess < secretCode) {
        codeResult.textContent = "📈 Secret code is HIGHER!";
        codeResult.style.color = "#eab308";
    } else {
        codeResult.textContent = "📉 Secret code is LOWER!";
        codeResult.style.color = "#eab308";
    }
});
