const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
let frames = 0;
const degree = Math.PI / 180;

// Load Images
// Procedural Asset Generation
function createPixelArt(width, height, pixelScale, drawFn) {
    const c = document.createElement('canvas');
    c.width = width * pixelScale;
    c.height = height * pixelScale;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    drawFn(ctx, width, height, pixelScale);

    const img = new Image();
    img.src = c.toDataURL();
    return img;
}

// Generate Ball Sprites
const skins = {};

function createBallSprite(type) {
    return createPixelArt(32, 32, 1, (ctx, w, h, s) => {
        const cx = w / 2;
        const cy = h / 2;
        const r = 14.5; // Adjusted for 32px size

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.clip();

        if (type === 'basketball') {
            ctx.fillStyle = '#e67e22';
            ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 3; // Thicker lines
            ctx.beginPath();
            ctx.moveTo(0, cy); ctx.lineTo(w, cy); // Horizontal
            ctx.moveTo(cx, 0); ctx.lineTo(cx, h); // Vertical
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2); // Inner circle
            ctx.stroke();
        } else if (type === 'soccer') {
            ctx.fillStyle = '#ecf0f1';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#2c3e50';
            // Pentagons (simplified)
            ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(cx - 12, cy - 9, 4.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(cx + 12, cy - 9, 4.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(cx, cy + 13.5, 4.5, 0, Math.PI * 2); ctx.fill();
        } else if (type === 'tennis') {
            ctx.fillStyle = '#c7f464'; // Tennis green
            ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx - 12, cy, r * 0.8, -Math.PI / 2, Math.PI / 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(cx + 12, cy, r * 0.8, Math.PI / 2, -Math.PI / 2);
            ctx.stroke();
        } else if (type === 'beach') {
            ctx.fillStyle = '#f1c40f'; // Yellow
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#e74c3c'; // Red
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, 0, Math.PI / 3); ctx.fill();
            ctx.fillStyle = '#3498db'; // Blue
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, Math.PI, Math.PI * 1.33); ctx.fill();
            ctx.fillStyle = '#ffffff'; // White top
            ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
        } else if (type === 'golden') {
            // Gradient Gold
            const grad = ctx.createRadialGradient(cx, cy, 3, cx, cy, r);
            grad.addColorStop(0, '#f1c40f');
            grad.addColorStop(1, '#d35400');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = '#f39c12';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, cy); ctx.lineTo(w, cy);
            ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
            ctx.stroke();
        }

        // Shading
        const grad = ctx.createRadialGradient(cx - 6, cy - 6, 3, cx, cy, r);
        grad.addColorStop(0, 'rgba(255,255,255,0.3)');
        grad.addColorStop(1, 'rgba(0,0,0,0.1)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        ctx.restore();
    });
}

// Initialize Skins
skins.basketball = createBallSprite('basketball');
skins.soccer = createBallSprite('soccer');
skins.tennis = createBallSprite('tennis');
skins.beach = createBallSprite('beach');
skins.golden = createBallSprite('golden');

let currentSkin = localStorage.getItem('flappy_basketball_skin') || 'basketball';
let sprite = skins[currentSkin];

// Generate Background (Procedural)
const bg = createPixelArt(320, 480, 1, (ctx, w, h, s) => {
    // Wood Floor Base
    ctx.fillStyle = '#e6b87d'; // Light wood
    ctx.fillRect(0, 0, w, h);

    // Wood Planks Pattern
    ctx.fillStyle = '#d4a265'; // Slightly darker wood
    for (let y = 0; y < h; y += 40) {
        // Offset every other row
        let xOffset = (y % 80 === 0) ? 0 : 20;
        for (let x = -20; x < w; x += 40) {
            ctx.fillRect(x + xOffset, y, 38, 38);
        }
    }

    // Court Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    ctx.beginPath();

    // Center Line
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);

    // Center Circle
    ctx.moveTo(w / 2 + 40, h / 2);
    ctx.arc(w / 2, h / 2, 40, 0, Math.PI * 2);

    // Top Key (Three-point line approximation)
    ctx.moveTo(0, 80);
    ctx.quadraticCurveTo(w / 2, 180, w, 80);

    // Bottom Key
    ctx.moveTo(0, h - 80);
    ctx.quadraticCurveTo(w / 2, h - 180, w, h - 80);

    ctx.stroke();

    // Key Areas (Rectangles)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(w / 2 - 50, 0, 100, 120);
    ctx.fillRect(w / 2 - 50, h - 120, 100, 120);
    ctx.strokeRect(w / 2 - 50, 0, 100, 120);
    ctx.strokeRect(w / 2 - 50, h - 120, 100, 120);
});

// Procedural Asset Generation
function createPixelArt(width, height, pixelScale, drawFn) {
    const c = document.createElement('canvas');
    c.width = width * pixelScale;
    c.height = height * pixelScale;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    drawFn(ctx, width, height, pixelScale);

    const img = new Image();
    img.src = c.toDataURL();
    return img;
}

// Generate Obstacle Bottom (Hoop Stand)
// Width increased to 16 units total canvas, Pole width 7 units (28px)
const obstacleBottom = createPixelArt(16, 100, 4, (ctx, w, h, s) => {
    // Colors
    const darkMetal = '#2c3e50';
    const lightMetal = '#95a5a6';
    const baseColor = '#34495e';

    // Pole (Wider: 7 units)
    // Centered in 16 units: start at 4.5 -> let's say 4.5 to 11.5 (7 units)
    ctx.fillStyle = darkMetal;
    ctx.fillRect(4.5 * s, 0, 7 * s, h * s); // Main pole

    // Highlights
    ctx.fillStyle = lightMetal;
    ctx.fillRect(6 * s, 0, 1.5 * s, h * s); // Highlight strip

    // Base (at the bottom)
    ctx.fillStyle = baseColor;
    ctx.fillRect(2 * s, (h - 10) * s, 12 * s, 10 * s); // Wide base

    // Diagonal Support
    ctx.fillStyle = darkMetal;
    for (let i = 0; i < 20; i++) {
        ctx.fillRect((4.5 - i * 0.2) * s, (h - 10 - i) * s, 1 * s, 1 * s);
    }
});

// Generate Obstacle Top (Scoreboard)
// Width increased to 16 units total canvas, Scoreboard width 14 units (56px)
const obstacleTop = createPixelArt(16, 100, 4, (ctx, w, h, s) => {
    // Colors
    const boardColor = '#000000';
    const frameColor = '#7f8c8d';
    const redLight = '#e74c3c';
    const yellowLight = '#f1c40f';

    // Wire/Chain
    ctx.fillStyle = frameColor;
    ctx.fillRect(7.5 * s, 0, 1 * s, (h - 20) * s);

    // Scoreboard Box
    const boxY = h - 20;
    const boxH = 20;

    ctx.fillStyle = boardColor;
    ctx.fillRect(1 * s, boxY * s, 14 * s, boxH * s);

    // Frame
    ctx.strokeStyle = frameColor;
    ctx.lineWidth = s;
    ctx.strokeRect(1.5 * s, (boxY + 0.5) * s, 13 * s, (boxH - 1) * s);

    // Lights/Digits
    ctx.fillStyle = redLight;
    ctx.fillRect(3.5 * s, (boxY + 5) * s, 2 * s, 3 * s); // 88
    ctx.fillRect(7 * s, (boxY + 5) * s, 2 * s, 3 * s); // 88

    ctx.fillStyle = yellowLight;
    ctx.fillRect(10.5 * s, (boxY + 5) * s, 1 * s, 1 * s); // Dot
});

// Game Control
const state = {
    current: 0,
    menu: 0,
    getReady: 1,
    game: 2,
    over: 3
};

function showAchievement(points) {
    const container = document.getElementById('achievement-container');
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerText = `Great Job! ${points} Points!`;
    container.appendChild(toast);

    // Remove after animation
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

const score = {
    best: localStorage.getItem('flappy_basketball_best') || 0,
    value: 0,

    draw: function () {
        const scoreElement = document.getElementById('score');
        if (state.current == state.game || state.current == state.getReady) {
            scoreElement.innerText = this.value;
        } else if (state.current == state.over) {
            scoreElement.innerText = '';
            document.getElementById('final-score').innerText = this.value;
        } else {
            scoreElement.innerText = '';
        }
    }
}

const basketball = {
    x: 50,
    y: 150,
    w: 32, // Decreased to 32
    h: 32, // Decreased to 32
    radius: 16, // Decreased to 16
    speed: 0,
    gravity: 0.25,
    jump: 4.6,
    rotation: 0,

    draw: function () {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Draw Basketball Sprite with clipping to ensure roundness
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(sprite, -16, -16, 32, 32); // Adjusted for new size

        ctx.restore();
    },

    update: function (timeScale) {
        // Period
        if (state.current == state.getReady || state.current == state.menu) {
            this.y = 150; // Keep stationary-ish
            this.rotation += 1 * degree;
        } else {
            this.speed += this.gravity * timeScale;
            this.y += this.speed * timeScale;

            // Rotation effect
            this.rotation += (this.speed * 2) * degree * timeScale;

            // Collision with floor
            if (this.y + this.radius >= canvas.height) {
                this.y = canvas.height - this.radius;
                if (state.current == state.game) {
                    state.current = state.over;
                    document.getElementById('game-over-screen').classList.add('active');
                }
            }
        }
    },

    flap: function () {
        this.speed = -this.jump;
    }
}

const pipes = {
    position: [],

    w: 64, // Updated width: 16 units * 4 scale = 64px
    h: 400,
    gap: 100,
    dx: 2,
    spawnTimer: 0,

    draw: function () {
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];
            let topY = p.y;
            let bottomY = p.y + this.h + this.gap;

            // Top Pipe (Scoreboard/Beam)
            ctx.drawImage(obstacleTop, p.x, topY, this.w, this.h);

            // Bottom Pipe (Defender/Stand)
            ctx.drawImage(obstacleBottom, p.x, bottomY, this.w, this.h);
        }
    },

    update: function (timeScale) {
        if (state.current !== state.game) return;

        // Add new pipe (Timer based)
        this.spawnTimer += timeScale;
        if (this.spawnTimer >= 100) { // Approx 100 frames at 60fps
            this.spawnTimer = 0;
            this.position.push({
                x: canvas.width,
                y: -150 * (Math.random() + 1)
            });
        }

        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];

            let bottomPipeY = p.y + this.h + this.gap;

            // Collision Detection
            // Top pipe (Scoreboard)
            // Visual: Box is roughly from 1s to 15s (14 units wide)
            // 1s = 4px. So offset 4px, width 56px.
            let topHitboxX = p.x + 4;
            let topHitboxW = 56;

            if (basketball.x + basketball.radius > topHitboxX &&
                basketball.x - basketball.radius < topHitboxX + topHitboxW &&
                basketball.y - basketball.radius < p.y + this.h) {
                state.current = state.over;
                document.getElementById('game-over-screen').classList.add('active');
            }

            // Bottom pipe (Stand)
            // Visual: Pole is from 4.5s to 11.5s (7 units wide)
            // 4.5s = 18px. Width 28px.
            let bottomHitboxX = p.x + 18;
            let bottomHitboxW = 28;

            if (basketball.x + basketball.radius > bottomHitboxX &&
                basketball.x - basketball.radius < bottomHitboxX + bottomHitboxW &&
                basketball.y + basketball.radius > bottomPipeY) {
                state.current = state.over;
                document.getElementById('game-over-screen').classList.add('active');
            }

            // Move pipes
            p.x -= this.dx * timeScale;

            // Remove pipes
            if (p.x + this.w <= 0) {
                this.position.shift();
                score.value += 1;
                score.best = Math.max(score.value, score.best);
                localStorage.setItem('flappy_basketball_best', score.best);

                // Achievement Check
                if (score.value % 10 === 0) {
                    showAchievement(score.value);
                }
            }
        }
    }
}

// Draw Loop
function draw() {
    // Draw Background
    // Draw it enough times to cover width or just stretch/tile
    // For now, let's just draw it to cover the canvas
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    pipes.draw();
    basketball.draw();
    score.draw();
}

// Update Loop
function update(timeScale) {
    basketball.update(timeScale);
    pipes.update(timeScale);
}

// Game Loop
// Game Loop
let lastTime = 0;
const TARGET_FPS = 60;
const OPTIMAL_TIME = 1000 / TARGET_FPS;

function loop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    // Cap deltaTime to prevent huge jumps if tab is inactive
    const cappedDelta = Math.min(deltaTime, 100);

    const timeScale = cappedDelta / OPTIMAL_TIME;

    update(timeScale);
    draw();
    frames++; // Still useful for animation cycles if any

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

// Initialize High Score Display
document.getElementById('best-score').innerText = score.best;

// Ensure game starts in Menu state
resetGame();

function startGameFlow() {
    state.current = state.getReady;
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('game-over-screen').classList.remove('active');
    document.getElementById('get-ready-message').classList.add('active');
    document.getElementById('btn-home').classList.remove('hidden');
    document.getElementById('score').classList.remove('hidden'); // Show score in game

    // Reset ball position for getReady
    basketball.y = 150;
    basketball.rotation = 0;
    basketball.speed = 0;
    pipes.position = [];
    score.value = 0;
}

function resetGame() {
    basketball.speed = 0;
    basketball.rotation = 0;
    basketball.y = 150;
    pipes.position = [];
    score.value = 0;
    frames = 0;

    // Go back to Menu
    state.current = state.menu;
    document.getElementById('game-over-screen').classList.remove('active');
    document.getElementById('start-screen').classList.add('active');
    document.getElementById('get-ready-message').classList.remove('active');
    document.getElementById('btn-home').classList.add('hidden');
    document.getElementById('score').classList.add('hidden'); // Hide score in menu
    document.getElementById('best-score').innerText = score.best;
}

function handleInput() {
    switch (state.current) {
        case state.menu:
            // Do nothing, waiting for button click
            break;
        case state.getReady:
            state.current = state.game;
            frames = 0;
            document.getElementById('get-ready-message').classList.remove('active');
            basketball.flap();
            break;
        case state.game:
            basketball.flap();
            break;
        case state.over:
            // Handled by button
            break;
    }
}

// Event Listeners
document.getElementById('btn-play').addEventListener('click', startGameFlow);
document.getElementById('btn-home').addEventListener('click', resetGame);
document.getElementById('restart-btn').addEventListener('click', startGameFlow);

// Outfits Logic
const outfitsBtn = document.getElementById('btn-outfits');
const outfitsScreen = document.getElementById('outfits-screen');
const backOutfitsBtn = document.getElementById('btn-back-outfits');
const skinsGrid = document.getElementById('skins-grid');

outfitsBtn.addEventListener('click', () => {
    document.getElementById('start-screen').classList.remove('active');
    outfitsScreen.classList.add('active');
    renderSkinsGrid();
});

backOutfitsBtn.addEventListener('click', () => {
    outfitsScreen.classList.remove('active');
    document.getElementById('start-screen').classList.add('active');
});

function renderSkinsGrid() {
    skinsGrid.innerHTML = '';
    Object.keys(skins).forEach(key => {
        const btn = document.createElement('div');
        btn.className = `skin-option ${currentSkin === key ? 'selected' : ''}`;

        const img = new Image();
        img.src = skins[key].src;
        btn.appendChild(img);

        btn.addEventListener('click', () => {
            currentSkin = key;
            sprite = skins[key];
            localStorage.setItem('flappy_basketball_skin', key);
            renderSkinsGrid(); // Re-render to update selection
        });

        skinsGrid.appendChild(btn);
    });
}

document.getElementById('btn-settings').addEventListener('click', () => console.log('Settings clicked'));

// Input Handling
// Input Handling
function onInput(e) {
    // Ignore input if clicking on a button or skin option
    if (e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.closest('.skin-option')) return;

    if (e.type === 'touchstart') {
        e.preventDefault(); // Prevent scrolling/zooming
    }

    handleInput();
}

window.addEventListener('mousedown', onInput);
window.addEventListener('touchstart', onInput, { passive: false });

window.addEventListener('keydown', function (e) {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        handleInput();
    }
});

// Initial Visibility Setup
// Handled by resetGame()
// Handled by resetGame()
