const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d', { alpha: false });

function resizeCanvas() {
    canvas.width = Math.max(1, window.innerWidth);
    canvas.height = Math.max(1, window.innerHeight);
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', resizeCanvas);

const BG = {
    layer1: { img: new Image(), x: 0, speed: 18 },
    layer2: { img: new Image(), x: 0, speed: 45 },
    layer3: { img: new Image(), x: 0, speed: 140 },
};
BG.layer1.img.src = 'assets/images/background_layer_1.png';
BG.layer2.img.src = 'assets/images/background_layer_2.png';
BG.layer3.img.src = 'assets/images/background_layer_3.png';

const VOLUME = {
    music: 0.5,
    hit: 0.25,
    shoot: 0.18,
    jump: 0.12,
};

function makeAudio(src, volume, loop = false) {
    const a = new Audio(src);
    a.preload = 'auto';
    a.volume = volume;
    a.loop = loop;
    return a;
}

const backgroundMusic = makeAudio('assets/sounds/background_music.mp3', VOLUME.music, true);

const soundPools = {
    hit: ['assets/sounds/Hit_00.mp3', 'assets/sounds/Hit_01.mp3', 'assets/sounds/Hit_02.mp3', 'assets/sounds/Hit_03.mp3'],
    jump: ['assets/sounds/Jump_00.mp3', 'assets/sounds/Jump_01.mp3', 'assets/sounds/Jump_02.mp3', 'assets/sounds/Jump_03.mp3'],
    shoot: ['assets/sounds/Shoot_00.mp3', 'assets/sounds/Shoot_01.mp3', 'assets/sounds/Shoot_02.mp3', 'assets/sounds/Shoot_03.mp3'],
};

const POOL_SIZE = 4;
const audioPools = {};
for (const key in soundPools) {
    audioPools[key] = [];
    for (const src of soundPools[key]) {
        const variants = [];
        for (let i = 0; i < POOL_SIZE; i++) variants.push(makeAudio(src, VOLUME[key]));
        audioPools[key].push(variants);
    }
}

let isMuted = localStorage.getItem('muted') === '1';

function applyMute() {
    backgroundMusic.muted = isMuted;
    for (const key in audioPools) {
        for (const variants of audioPools[key]) {
            for (const a of variants) a.muted = isMuted;
        }
    }
}
applyMute();

const Game = {
    state: 'loading',
    score: 0,
    highScore: Number(localStorage.getItem('highScore')) || 0,
    topScores: parseTopScores(),
    dino: null,
    obstacles: [],
    meteors: [],
    pterodactyls: [],
    spawnTimers: { tree: 0, meteor: 0, pterodactyl: 0 },
    spawnIntervals: { tree: 1.8, meteor: 1.3, pterodactyl: 2.4 },
    baseSpeed: 220,
    speed: 220,
    elapsed: 0,
    isPaused: false,
    musicReady: false,
    restartCooldown: 0,
    flashAlpha: 0,
    pulse: 0,

    playRandomSound(key) {
        if (isMuted) return;
        const group = audioPools[key];
        if (!group) return;
        const variants = group[Math.floor(Math.random() * group.length)];
        const audio = variants.find(a => a.paused || a.ended) || variants[0];
        try {
            audio.currentTime = 0;
            audio.muted = isMuted;
            audio.play().catch(() => {});
        } catch (_) {}
    },

    startMusic() {
        if (isMuted) return;
        backgroundMusic.muted = false;
        backgroundMusic.play().catch(() => {});
    },

    stopMusic() {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    },

    start() {
        this.dino = new Dino();
        this.obstacles = [];
        this.meteors = [];
        this.pterodactyls = [];
        this.spawnTimers.tree = 0;
        this.spawnTimers.meteor = 0.5;
        this.spawnTimers.pterodactyl = 1.0;
        this.score = 0;
        this.elapsed = 0;
        this.speed = this.baseSpeed;
        this.state = 'playing';
        this.restartCooldown = 0;
        this.flashAlpha = 0;
        this.startMusic();
    },

    endGame() {
        if (this.state !== 'playing') return;
        this.state = 'gameover';
        this.flashAlpha = 0.55;
        this.restartCooldown = 0.6;
        this.playRandomSound('hit');
        const finalScore = Math.floor(this.score);
        updateTopScores(this, finalScore);
        if (finalScore > this.highScore) {
            this.highScore = finalScore;
            localStorage.setItem('highScore', String(this.highScore));
        }
        backgroundMusic.pause();
    },

    togglePause() {
        if (this.state !== 'playing') return;
        this.isPaused = !this.isPaused;
        if (this.isPaused) backgroundMusic.pause();
        else if (!isMuted) backgroundMusic.play().catch(() => {});
    },

    toggleMute() {
        isMuted = !isMuted;
        localStorage.setItem('muted', isMuted ? '1' : '0');
        applyMute();
        if (!isMuted && this.state === 'playing' && !this.isPaused) {
            backgroundMusic.play().catch(() => {});
        } else {
            backgroundMusic.pause();
        }
        updateMuteButton();
    },
};

function parseTopScores() {
    try {
        const raw = JSON.parse(localStorage.getItem('topScores'));
        if (Array.isArray(raw)) return raw.map(Number).filter(n => Number.isFinite(n)).slice(0, 3);
    } catch (_) {}
    return [];
}

function updateTopScores(g, newScore) {
    g.topScores.push(newScore);
    g.topScores.sort((a, b) => b - a);
    g.topScores = g.topScores.slice(0, 3);
    localStorage.setItem('topScores', JSON.stringify(g.topScores));
}

function drawBackgroundLayer(layer, dt) {
    layer.x -= layer.speed * dt;
    const w = canvas.width;
    const h = canvas.height;
    if (!layer.img.complete || layer.img.naturalWidth === 0) return;
    if (layer.x <= -w) layer.x += w;
    context.drawImage(layer.img, layer.x, 0, w, h);
    context.drawImage(layer.img, layer.x + w, 0, w, h);
}

function drawBackground(dt) {
    context.fillStyle = '#87ceeb';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawBackgroundLayer(BG.layer1, dt);
    drawBackgroundLayer(BG.layer2, dt);
    drawBackgroundLayer(BG.layer3, dt);
}

function pixelFont(px) {
    return `bold ${Math.round(px)}px "Segoe UI", Arial, sans-serif`;
}

function drawTextCentered(text, x, y, size, color = '#fff', shadow = true) {
    context.font = pixelFont(size);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    if (shadow) {
        context.fillStyle = 'rgba(0,0,0,0.55)';
        context.fillText(text, x + 2, y + 2);
    }
    context.fillStyle = color;
    context.fillText(text, x, y);
}

function drawScore() {
    const size = clamp(canvas.width / 22, 22, 44);
    drawTextCentered(`${Math.floor(Game.score)}`, canvas.width / 2, size * 0.9 + 10, size * 1.4, '#fff');
}

function roundedRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
}

function drawPanel(x, y, w, h) {
    context.save();
    context.fillStyle = 'rgba(10, 14, 30, 0.78)';
    roundedRect(context, x, y, w, h, 18);
    context.fill();
    context.strokeStyle = 'rgba(255,255,255,0.12)';
    context.lineWidth = 1.5;
    context.stroke();
    context.restore();
}

function drawStartScreen() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const w = Math.min(canvas.width * 0.85, 420);
    const h = Math.min(canvas.height * 0.7, 440);
    drawPanel(cx - w / 2, cy - h / 2, w, h);

    const titleSize = clamp(canvas.width / 14, 32, 56);
    drawTextCentered('Flappy Dino', cx, cy - h / 2 + titleSize, titleSize, '#bb86fc');

    let y = cy - h / 2 + titleSize * 2 + 18;
    drawTextCentered('TOP SCORES', cx, y, clamp(canvas.width / 36, 14, 20), 'rgba(255,255,255,0.65)');
    y += 28;
    if (Game.topScores.length === 0) {
        drawTextCentered('—', cx, y, 22, '#fff');
        y += 32;
    } else {
        for (let i = 0; i < Game.topScores.length; i++) {
            drawTextCentered(`${i + 1}.  ${Game.topScores[i]}`, cx, y, 22, '#fff');
            y += 30;
        }
    }

    y = cy + h / 2 - 110;
    const isTouch = isTouchDevice();
    drawTextCentered(isTouch ? 'TRYKK for å starte' : 'MELLOMROM for å starte',
        cx, y, clamp(canvas.width / 30, 16, 22), '#fff');
    y += 32;
    drawTextCentered(isTouch ? 'Trykk = hopp, sveip høyre = skyt' : 'SPACE = hopp · → = skyt · P = pause',
        cx, y, clamp(canvas.width / 38, 13, 17), 'rgba(255,255,255,0.75)');

    const blink = 0.6 + Math.sin(Game.pulse * 4) * 0.4;
    context.save();
    context.globalAlpha = blink;
    drawTextCentered('▼', cx, cy + h / 2 - 40, 24, '#bb86fc');
    context.restore();
}

function drawGameOverScreen() {
    context.save();
    context.fillStyle = 'rgba(0,0,0,0.55)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const w = Math.min(canvas.width * 0.85, 380);
    const h = Math.min(canvas.height * 0.6, 340);
    drawPanel(cx - w / 2, cy - h / 2, w, h);

    drawTextCentered('Game Over', cx, cy - h / 2 + 50, clamp(canvas.width / 16, 28, 48), '#ff79c6');
    drawTextCentered(`Score: ${Math.floor(Game.score)}`, cx, cy - 10, 26, '#fff');
    drawTextCentered(`High: ${Game.highScore}`, cx, cy + 28, 22, 'rgba(255,255,255,0.85)');

    const isTouch = isTouchDevice();
    const blink = 0.55 + Math.sin(Game.pulse * 4) * 0.45;
    context.save();
    context.globalAlpha = blink;
    drawTextCentered(isTouch ? 'Trykk for å spille igjen' : 'SPACE for å spille igjen',
        cx, cy + h / 2 - 40, clamp(canvas.width / 32, 16, 20), '#fff');
    context.restore();
}

function drawPauseScreen() {
    context.save();
    context.fillStyle = 'rgba(0,0,0,0.55)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();
    drawTextCentered('PAUSE', canvas.width / 2, canvas.height / 2 - 8, 56, '#fff');
    drawTextCentered(isTouchDevice() ? 'Trykk pause-knappen for å fortsette' : 'P for å fortsette',
        canvas.width / 2, canvas.height / 2 + 36, 18, 'rgba(255,255,255,0.8)');
}

function spawnObstacles(dt) {
    Game.spawnTimers.tree += dt;
    Game.spawnTimers.meteor += dt;
    Game.spawnTimers.pterodactyl += dt;

    if (Game.spawnTimers.tree >= Game.spawnIntervals.tree) {
        Game.spawnTimers.tree = 0;
        Game.obstacles.push(new Tree(Game.speed));
    }
    if (Game.spawnTimers.meteor >= Game.spawnIntervals.meteor) {
        Game.spawnTimers.meteor = 0;
        Game.meteors.push(new Meteor(Game.speed));
    }
    if (Game.spawnTimers.pterodactyl >= Game.spawnIntervals.pterodactyl) {
        Game.spawnTimers.pterodactyl = 0;
        Game.pterodactyls.push(new Pterodactyl(Game.speed));
    }
}

function pruneOffscreen() {
    for (let i = Game.obstacles.length - 1; i >= 0; i--)
        if (Game.obstacles[i].isOffscreen()) Game.obstacles.splice(i, 1);
    for (let i = Game.meteors.length - 1; i >= 0; i--)
        if (Game.meteors[i].isOffscreen()) Game.meteors.splice(i, 1);
    for (let i = Game.pterodactyls.length - 1; i >= 0; i--)
        if (Game.pterodactyls[i].isOffscreen()) Game.pterodactyls.splice(i, 1);
}

function updatePlaying(dt) {
    Game.elapsed += dt;
    Game.speed = Game.baseSpeed + Math.min(280, Game.elapsed * 6);
    Game.spawnIntervals.tree = Math.max(0.9, 1.8 - Game.elapsed * 0.012);
    Game.spawnIntervals.meteor = Math.max(0.6, 1.3 - Game.elapsed * 0.008);
    Game.spawnIntervals.pterodactyl = Math.max(1.2, 2.4 - Game.elapsed * 0.01);

    for (const o of Game.obstacles) { o.speed = Game.speed; o.update(dt); }
    for (const m of Game.meteors) m.update(dt);
    for (const p of Game.pterodactyls) { p.speed = Game.speed * 1.25; p.update(dt); }

    Game.dino.update(dt);

    detectLaserEnemyCollision(Game.dino.lasers, Game.meteors, () => {
        Game.score += 10;
        Game.playRandomSound('hit');
    });
    detectLaserEnemyCollision(Game.dino.lasers, Game.pterodactyls, () => {
        Game.score += 10;
        Game.playRandomSound('hit');
    });

    if (Game.state === 'playing' &&
        detectDinoHit(Game.dino, Game.obstacles, Game.meteors, Game.pterodactyls)) {
        Game.dino.alive = false;
        Game.endGame();
    }

    spawnObstacles(dt);
    pruneOffscreen();

    Game.score += dt * 10;
}

function drawWorld(dt) {
    drawBackground(dt);
    for (const o of Game.obstacles) o.draw(context);
    for (const p of Game.pterodactyls) p.draw(context);
    for (const m of Game.meteors) m.draw(context);
    Game.dino.draw(context);
}

let lastTime = performance.now();
const MAX_DT = 1 / 30;

function gameLoop(now) {
    let dt = (now - lastTime) / 1000;
    lastTime = now;
    if (dt > MAX_DT) dt = MAX_DT;

    Game.pulse += dt;
    if (Game.restartCooldown > 0) Game.restartCooldown -= dt;

    if (Game.state === 'loading') {
    } else if (Game.state === 'start') {
        drawBackground(dt);
        drawStartScreen();
    } else if (Game.state === 'playing') {
        if (!Game.isPaused) {
            updatePlaying(dt);
            drawWorld(dt);
        } else {
            drawWorld(0);
        }
        drawScore();
        if (Game.isPaused) drawPauseScreen();
    } else if (Game.state === 'gameover') {
        drawWorld(0);
        if (Game.flashAlpha > 0) {
            context.fillStyle = `rgba(255,255,255,${Game.flashAlpha})`;
            context.fillRect(0, 0, canvas.width, canvas.height);
            Game.flashAlpha = Math.max(0, Game.flashAlpha - dt * 1.6);
        }
        drawGameOverScreen();
    }

    requestAnimationFrame(gameLoop);
}

function isTouchDevice() {
    return ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
}

function handleAction(action) {
    if (Game.state === 'start') {
        if (action === 'primary') Game.start();
    } else if (Game.state === 'playing') {
        if (Game.isPaused) return;
        if (action === 'primary') Game.dino.jump();
        else if (action === 'secondary') Game.dino.shootLaser();
    } else if (Game.state === 'gameover') {
        if (action === 'primary' && Game.restartCooldown <= 0) Game.start();
    }
}

window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    if (e.code === 'Space') { e.preventDefault(); handleAction('primary'); }
    else if (e.code === 'ArrowRight') { e.preventDefault(); handleAction('secondary'); }
    else if (e.key === 'p' || e.key === 'P') Game.togglePause();
    else if (e.key === 'm' || e.key === 'M') Game.toggleMute();
});

let touchStartX = 0, touchStartY = 0, touchStartT = 0, isSwiping = false;
const SWIPE_THRESHOLD = 40;
const TAP_MAX_DURATION = 250;

canvas.addEventListener('touchstart', (e) => {
    if (e.target.closest && e.target.closest('.hud')) return;
    e.preventDefault();
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
    touchStartT = Date.now();
    isSwiping = false;
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    if (isSwiping) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.2) {
        isSwiping = true;
        if (dx > 0) handleAction('secondary');
    }
}, { passive: true });

canvas.addEventListener('touchend', (e) => {
    if (isSwiping) { isSwiping = false; return; }
    const duration = Date.now() - touchStartT;
    if (duration < TAP_MAX_DURATION) handleAction('primary');
    isSwiping = false;
}, { passive: true });

canvas.addEventListener('mousedown', (e) => {
    if (e.target.closest && e.target.closest('.hud')) return;
    if (isTouchDevice()) return;
    if (e.button === 0) handleAction('primary');
    else if (e.button === 2) handleAction('secondary');
});
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

document.addEventListener('visibilitychange', () => {
    if (document.hidden && Game.state === 'playing' && !Game.isPaused) Game.togglePause();
});
window.addEventListener('blur', () => {
    if (Game.state === 'playing' && !Game.isPaused) Game.togglePause();
});

function updateMuteButton() {
    const btn = document.getElementById('muteBtn');
    if (!btn) return;
    btn.innerHTML = isMuted ? '&#x1F507;' : '&#x1F50A;';
    btn.classList.toggle('muted', isMuted);
    btn.setAttribute('aria-label', isMuted ? 'Skru på lyd' : 'Demp lyd');
}

document.addEventListener('DOMContentLoaded', () => {
    const muteBtn = document.getElementById('muteBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    if (muteBtn) {
        updateMuteButton();
        muteBtn.addEventListener('click', () => Game.toggleMute());
    }
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => Game.togglePause());
    }
});

function loadAsset(img) {
    return new Promise(res => {
        if (img.complete && img.naturalWidth > 0) return res();
        img.addEventListener('load', res, { once: true });
        img.addEventListener('error', res, { once: true });
    });
}

async function preloadAll(onProgress) {
    const images = [
        BG.layer1.img, BG.layer2.img, BG.layer3.img,
        dinoImage, treeImage, meteorImage, pterodactylImage,
    ];
    let loaded = 0;
    const total = images.length + LASER_COUNT;
    const tick = () => { loaded++; if (onProgress) onProgress(loaded / total); };
    const imgPromises = images.map(img => loadAsset(img).then(tick));

    const laserPromise = (async () => {
        for (let i = 1; i <= LASER_COUNT; i++) {
            const img = new Image();
            const name = i < 10 ? `0${i}.png` : `${i}.png`;
            img.src = `assets/images/lasers/${name}`;
            laserImages.push(img);
            await loadAsset(img);
            tick();
        }
    })();

    await Promise.all([...imgPromises, laserPromise]);
}

function startUp() {
    const loading = document.getElementById('loadingScreen');
    const fill = document.getElementById('loadingBarFill');
    const pct = document.getElementById('loadingPct');

    preloadAll((p) => {
        const v = Math.round(p * 100);
        if (fill) fill.style.width = v + '%';
        if (pct) pct.textContent = v + '%';
    }).then(() => {
        Game.state = 'start';
        if (loading) {
            loading.classList.add('hidden');
            setTimeout(() => loading.remove(), 400);
        }
    });

    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startUp);
} else {
    startUp();
}
