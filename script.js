// --- 1. SYNTH AUDIO FEEDBACK (Web Audio API) ---
// Generates sound effects directly in the browser without external files
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, duration = 0.1, type = 'sine') {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
    osc.stop(audioCtx.currentTime + duration);
}

// --- 2. THEME SWITCHER & LOCAL STORAGE ---
const themeButtons = document.querySelectorAll('.theme-btn');

// Load saved theme on startup
const savedTheme = localStorage.getItem('userTheme') || 'theme-dark';
document.body.className = savedTheme;

themeButtons.forEach(button => {
    button.addEventListener('click', () => {
        playTone(600, 0.08); // Play click sound
        const selectedTheme = button.getAttribute('data-theme');
        document.body.className = selectedTheme;
        localStorage.setItem('userTheme', selectedTheme); // Save choice
    });
});

// --- 3. REACTION SPEED GAME WITH HIGH SCORE ---
const reactionBox = document.getElementById('reaction-box');
const startGameBtn = document.getElementById('start-game-btn');
const reactionResult = document.getElementById('reaction-result');
const bestScoreDisplay = document.getElementById('best-score');

let startTime, timerTimeout;
let bestScore = localStorage.getItem('bestReaction') || null;

if (bestScore) {
    bestScoreDisplay.textContent = `🏆 Best Score: ${bestScore} ms`;
}

startGameBtn.addEventListener('click', () => {
    playTone(400, 0.1);
    reactionResult.textContent = "Get ready...";
    reactionBox.textContent = "Wait for GREEN...";
    reactionBox.className = "game-box waiting";

    // Random delay between 2 and 4.5 seconds
    const randomDelay = Math.floor(Math.random() * 2500) + 2000;

    timerTimeout = setTimeout(() => {
        reactionBox.textContent = "CLICK NOW!";
        reactionBox.className = "game-box ready";
        playTone(800, 0.15, 'square'); // High beep when green
        startTime = Date.now();
    }, randomDelay);
});

reactionBox.addEventListener('click', () => {
    if (reactionBox.classList.contains('ready')) {
        const elapsedTime = Date.now() - startTime;
        playTone(1000, 0.2, 'triangle');
        reactionResult.textContent = `⚡ Reaction time: ${elapsedTime} ms!`;
        reactionBox.textContent = "Nice hit!";
        reactionBox.className = "game-box";

        // Save High Score
        if (!bestScore || elapsedTime < bestScore) {
            bestScore = elapsedTime;
            localStorage.setItem('bestReaction', bestScore);
            bestScoreDisplay.textContent = `🏆 Best Score: ${bestScore} ms (NEW RECORD!)`;
        }
    } else if (reactionBox.classList.contains('waiting')) {
        clearTimeout(timerTimeout);
        playTone(150, 0.2, 'sawtooth'); // Error sound
        reactionResult.textContent = "❌ Too early! Click start to try again.";
        reactionBox.textContent = "Failed!";
        reactionBox.className = "game-box";
    }
});

// --- 4. CODE BREAKER GAME WITH RESET & COUNTER ---
let secretCode = generateSecretCode();
let attempts = 0;

const codeInput = document.getElementById('code-input');
const guessBtn = document.getElementById('guess-btn');
const resetCodeBtn = document.getElementById('reset-code-btn');
const codeResult = document.getElementById('code-result');
const attemptsCount = document.getElementById('attempts-count');

function generateSecretCode() {
    return Math.floor(Math.random() * 900) + 100; // 3-digit number
}

guessBtn.addEventListener('click', checkGuess);

// Allow pressing "Enter" key inside input field
codeInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        checkGuess();
    }
});

function checkGuess() {
    const userGuess = parseInt(codeInput.value);

    if (isNaN(userGuess) || userGuess < 100 || userGuess > 999) {
        playTone(200, 0.15, 'sawtooth');
        codeResult.textContent = "⚠️ Enter a 3-digit number between 100 and 999!";
        return;
    }

    attempts++;
    attemptsCount.textContent = `Attempts: ${attempts}`;

    if (userGuess === secretCode) {
        // Victory chime!
        playTone(523, 0.1);
        setTimeout(() => playTone(659, 0.1), 100);
        setTimeout(() => playTone(784, 0.2), 200);

        codeResult.textContent = `🎉 ACCESS GRANTED in ${attempts} tries! System Hacked!`;
        codeResult.style.color = "#22c55e";
    } else if (userGuess < secretCode) {
        playTone(350, 0.08);
        codeResult.textContent = "📈 Secret code is HIGHER!";
        codeResult.style.color = "#eab308";
    } else {
        playTone(300, 0.08);
        codeResult.textContent = "📉 Secret code is LOWER!";
        codeResult.style.color = "#eab308";
    }

    codeInput.value = ""; // Clear input box for next guess
}

resetCodeBtn.addEventListener('click', () => {
    playTone(500, 0.1);
    secretCode = generateSecretCode();
    attempts = 0;
    attemptsCount.textContent = "Attempts: 0";
    codeResult.textContent = "New PIN generated. Ready to hack!";
    codeResult.style.color = "inherit";
    codeInput.value = "";
});
