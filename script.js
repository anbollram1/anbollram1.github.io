// --- 1. SAFE AUDIO SYNTHESIZER ---
// Global Web Audio Context
let audioCtx = null;

// Initialize or resume AudioContext safely on user gesture
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// Global click listener guarantees AudioContext is unlocked
window.addEventListener('click', initAudio, { once: true });
window.addEventListener('touchstart', initAudio, { once: true });

function playTone(freq, duration = 0.1, type = 'sine') {
    if (!audioCtx || audioCtx.state !== 'running') return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
        console.log("Audio error ignored:", e);
    }
}

// --- 2. THEME SWITCHER LOGIC ---
const themeButtons = document.querySelectorAll('.theme-btn');
const savedTheme = localStorage.getItem('userTheme') || 'theme-dark';
document.body.className = savedTheme;

themeButtons.forEach(button => {
    button.addEventListener('click', () => {
        initAudio();
        playTone(600, 0.08);
        const selectedTheme = button.getAttribute('data-theme');
        document.body.className = selectedTheme;
        localStorage.setItem('userTheme', selectedTheme);
    });
});

// --- 3. GAME 3: FRUIT SLICE GAME LOGIC ---
const fruitCanvas = document.getElementById('fruit-canvas');
const startFruitBtn = document.getElementById('start-fruit-btn');
const fruitStartScreen = document.getElementById('fruit-start-screen');
const fruitScoreDisplay = document.getElementById('fruit-score');
const fruitLivesDisplay = document.getElementById('fruit-lives');
const fruitHighScoreDisplay = document.getElementById('fruit-high-score');

const fruitTypes = ['🍎', '🍉', '🍌', '🍓', '🍍', '🍇', '🥭'];
let fruitScore = 0;
let fruitLives = 3;
let fruitGameInterval = null;
let activeIntervals = []; // Keeps track of active fruit fall timers
let isMouseDown = false;

// Global mouse drag tracking
window.addEventListener('mousedown', () => isMouseDown = true);
window.addEventListener('mouseup', () => isMouseDown = false);

// Load Fruit Slicer High Score from localStorage
let bestFruitScore = localStorage.getItem('bestFruitScore') || 0;
fruitHighScoreDisplay.textContent = bestFruitScore;

startFruitBtn.addEventListener('click', () => {
    initAudio();
    playTone(500, 0.1);
    
    // Clear old active timers if restarting
    clearAllFruitTimers();

    fruitScore = 0;
    fruitLives = 3;
    fruitScoreDisplay.textContent = fruitScore;
    fruitLivesDisplay.textContent = fruitLives;
    fruitStartScreen.style.display = 'none';

    // Spawn a fruit every 900ms
    fruitGameInterval = setInterval(spawnFruit, 900);
});

function spawnFruit() {
    if (fruitLives <= 0) return;

    const fruit = document.createElement('div');
    fruit.className = 'falling-fruit';
    fruit.textContent = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
    
    // Random horizontal position within boundaries
    const canvasWidth = fruitCanvas.clientWidth || 300;
    const randomLeft = Math.floor(Math.random() * (canvasWidth - 60));
    fruit.style.left = `${Math.max(10, randomLeft)}px`;
    fruit.style.top = `-50px`;

    fruitCanvas.appendChild(fruit);

    let currentTop = -50;
    const speed = Math.random() * 2 + 2.5; // Random fall speed

    // Animation interval for fruit movement
    const fallInterval = setInterval(() => {
        if (fruitLives <= 0) {
            clearInterval(fallInterval);
            fruit.remove();
            return;
        }

        currentTop += speed;
        fruit.style.top = `${currentTop}px`;

        // Check if fruit fell off bottom of canvas
        const canvasHeight = fruitCanvas.clientHeight || 300;
        if (currentTop > canvasHeight) {
            clearInterval(fallInterval);
            fruit.remove();
            
            // Deduct life
            fruitLives--;
            fruitLivesDisplay.textContent = fruitLives;
            playTone(150, 0.2, 'sawtooth');

            if (fruitLives <= 0) {
                endFruitGame();
            }
        }
    }, 20);

    activeIntervals.push(fallInterval);

    // Slice interaction handler
    let isSliced = false;
    const sliceFruit = () => {
        if (isSliced || fruitLives <= 0) return;
        isSliced = true;
        
        clearInterval(fallInterval);
        playTone(900, 0.1, 'triangle'); // Slice sound tone
        
        fruitScore++;
        fruitScoreDisplay.textContent = fruitScore;

        // Visual splat feedback
        fruit.textContent = '💥';
        setTimeout(() => fruit.remove(), 120);
    };

    // Supports both clicking and holding down mouse to swipe
    fruit.addEventListener('pointerdown', sliceFruit);
    fruit.addEventListener('pointerenter', () => {
        if (isMouseDown) sliceFruit();
    });
}

function clearAllFruitTimers() {
    if (fruitGameInterval) clearInterval(fruitGameInterval);
    activeIntervals.forEach(id => clearInterval(id));
    activeIntervals = [];
    
    // Remove lingering fruit DOM elements
    const remainingFruits = fruitCanvas.querySelectorAll('.falling-fruit');
    remainingFruits.forEach(f => f.remove());
}

function endFruitGame() {
    clearAllFruitTimers();
    playTone(200, 0.3, 'sawtooth');
    
    // Check and store High Score
    if (fruitScore > bestFruitScore) {
        bestFruitScore = fruitScore;
        localStorage.setItem('bestFruitScore', bestFruitScore);
        fruitHighScoreDisplay.textContent = bestFruitScore;
    }

    fruitStartScreen.style.display = 'flex';
    startFruitBtn.textContent = 'Game Over! Play Again';
}

// --- 4. GAME 1: REACTION SPEED TEST ---
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
    initAudio();
    playTone(400, 0.1);
    reactionResult.textContent = "Get ready...";
    reactionBox.textContent = "Wait for GREEN...";
    reactionBox.className = "game-box waiting";

    const randomDelay = Math.floor(Math.random() * 2500) + 2000;

    timerTimeout = setTimeout(() => {
        reactionBox.textContent = "CLICK NOW!";
        reactionBox.className = "game-box ready";
        playTone(800, 0.15, 'square');
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

        if (!bestScore || elapsedTime < bestScore) {
            bestScore = elapsedTime;
            localStorage.setItem('bestReaction', bestScore);
            bestScoreDisplay.textContent = `🏆 Best Score: ${bestScore} ms (NEW RECORD!)`;
        }
    } else if (reactionBox.classList.contains('waiting')) {
        clearTimeout(timerTimeout);
        playTone(150, 0.2, 'sawtooth');
        reactionResult.textContent = "❌ Too early! Click start to try again.";
        reactionBox.textContent = "Failed!";
        reactionBox.className = "game-box";
    }
});

// --- 5. GAME 2: CODE BREAKER ---
let secretCode = generateSecretCode();
let attempts = 0;

const codeInput = document.getElementById('code-input');
const guessBtn = document.getElementById('guess-btn');
const resetCodeBtn = document.getElementById('reset-code-btn');
const codeResult = document.getElementById('code-result');
const attemptsCount = document.getElementById('attempts-count');

function generateSecretCode() {
    return Math.floor(Math.random() * 900) + 100;
}

guessBtn.addEventListener('click', checkGuess);
codeInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') checkGuess();
});

function checkGuess() {
    initAudio();
    const userGuess = parseInt(codeInput.value);

    if (isNaN(userGuess) || userGuess < 100 || userGuess > 999) {
        playTone(200, 0.15, 'sawtooth');
        codeResult.textContent = "⚠️ Enter a 3-digit number between 100 and 999!";
        return;
    }

    attempts++;
    attemptsCount.textContent = `Attempts: ${attempts}`;

    if (userGuess === secretCode) {
        playTone(523, 0.1);
        setTimeout(() => playTone(659, 0.1), 100);
        setTimeout(() => playTone(784, 0.2), 200);

        codeResult.textContent = `🎉 ACCESS GRANTED in ${attempts} tries!`;
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

    codeInput.value = "";
}

resetCodeBtn.addEventListener('click', () => {
    initAudio();
    playTone(500, 0.1);
    secretCode = generateSecretCode();
    attempts = 0;
    attemptsCount.textContent = "Attempts: 0";
    codeResult.textContent = "New PIN generated. Ready to hack!";
    codeResult.style.color = "inherit";
    codeInput.value = "";
});
