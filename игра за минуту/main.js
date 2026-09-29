// ============ MAIN GAME ============
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const VIEW_W = 960;
const VIEW_H = 640;

const GameState = {
    MENU: 'menu', PLAYING: 'playing', DEAD: 'dead',
    LEVEL_COMPLETE: 'level_complete', PAUSED: 'paused', VICTORY: 'victory'
};

let state = GameState.MENU;
let currentLevel = 0;
let totalDeaths = 0;
let totalTime = 0;
let levelStartTime = 0;
let elapsedTime = 0;
let lastTimestamp = 0;
let level = null;
let deathParticles = [];

const player = {
    x: 0, y: 0, w: 26, h: 26,
    vx: 0, vy: 0,
    speed: 260,
    alive: true
};

const keys = {};

// ============ INPUT ============
window.addEventListener('keydown', function (e) {
    const k = e.key.toLowerCase();
    keys[k] = true;
    const code = e.code;
    if (code === 'KeyW' || code === 'ArrowUp') keys['w'] = true;
    if (code === 'KeyA' || code === 'ArrowLeft') keys['a'] = true;
    if (code === 'KeyS' || code === 'ArrowDown') keys['s'] = true;
    if (code === 'KeyD' || code === 'ArrowRight') keys['d'] = true;
    if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' '].indexOf(k) !== -1) {
        e.preventDefault();
    }
    if (code === 'Escape') handleEscape();
    if (code === 'KeyR') handleRestart();
    if (code === 'Enter') handleEnter();
});
window.addEventListener('keyup', function (e) {
    const k = e.key.toLowerCase();
    keys[k] = false;
    const code = e.code;
    if (code === 'KeyW' || code === 'ArrowUp') keys['w'] = false;
    if (code === 'KeyA' || code === 'ArrowLeft') keys['a'] = false;
    if (code === 'KeyS' || code === 'ArrowDown') keys['s'] = false;
    if (code === 'KeyD' || code === 'ArrowRight') keys['d'] = false;
});
window.addEventListener('blur', function () {
    for (const k in keys) keys[k] = false;
});

// ============ LEVELS ============
function cloneLevel(lv) { return JSON.parse(JSON.stringify(lv)); }

function loadLevel(index) {
    currentLevel = index;
    level = cloneLevel(Levels[index]);
    player.x = level.playerStart.x;
    player.y = level.playerStart.y;
    player.vx = 0; player.vy = 0;
    player.alive = true;
    elapsedTime = 0;
    levelStartTime = performance.now();
    deathParticles = [];
    if (level.doors) level.doors.forEach(function (d) { d.open = false; });
    if (level.keys) level.keys.forEach(function (k) { k.collected = false; });
    updateHUD();
}

function restartLevel() {
    if (state === GameState.PLAYING || state === GameState.DEAD || state === GameState.PAUSED) {
        loadLevel(currentLevel);
        state = GameState.PLAYING;
        hideAllScreens();
        updateHUDVisibility();
    }
}

function nextLevel() {
    if (currentLevel + 1 >= Levels.length) {
        state = GameState.VICTORY;
        showVictory();
        return;
    }
    loadLevel(currentLevel + 1);
    state = GameState.PLAYING;
    hideAllScreens();
    updateHUDVisibility();
}

// ============ COLLISION ============
function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
function getPlayerRect() { return { x: player.x, y: player.y, w: player.w, h: player.h }; }

function isSolidAt(x, y, w, h) {
    if (!level) return false;
    const r = { x: x, y: y, w: w, h: h };
    if (level.walls) {
        for (let i = 0; i < level.walls.length; i++) {
            if (rectsOverlap(r, level.walls[i])) return true;
        }
    }
    if (level.movingWalls) {
        for (let i = 0; i < level.movingWalls.length; i++) {
            if (rectsOverlap(r, getMovingWallRect(level.movingWalls[i]))) return true;
        }
    }
    if (level.doors) {
        for (let i = 0; i < level.doors.length; i++) {
            const d = level.doors[i];
            if (!d.open && rectsOverlap(r, d)) return true;
        }
    }
    if (level.disappearing) {
        for (let i = 0; i < level.disappearing.length; i++) {
            const dp = level.disappearing[i];
            if (isDisappearingSolid(dp) && rectsOverlap(r, dp)) return true;
        }
    }
    return false;
}

function getMovingWallRect(mw) {
    const offset = Math.sin(elapsedTime * mw.speed + mw.phase) * mw.range;
    if (mw.axis === 'x') return { x: mw.x + offset, y: mw.y, w: mw.w, h: mw.h };
    return { x: mw.x, y: mw.y + offset, w: mw.w, h: mw.h };
}
function getLaserRect(l) {
    const offset = Math.sin(elapsedTime * l.speed + l.phase) * l.range;
    if (l.axis === 'x') return { x: l.x + offset, y: l.y, w: l.w, h: l.h };
    return { x: l.x, y: l.y + offset, w: l.w, h: l.h };
}
function isDisappearingSolid(dp) {
    const cycle = (elapsedTime + dp.phase) % (dp.interval + dp.duration);
    return cycle < dp.interval;
}

function movePlayer(dt) {
    let tx = 0, ty = 0;
    if (keys['w'] || keys['arrowup']) ty -= 1;
    if (keys['s'] || keys['arrowdown']) ty += 1;
    if (keys['a'] || keys['arrowleft']) tx -= 1;
    if (keys['d'] || keys['arrowright']) tx += 1;

    const len = Math.sqrt(tx * tx + ty * ty);
    if (len > 0) { tx /= len; ty /= len; }

    const targetVx = tx * player.speed;
    const targetVy = ty * player.speed;

    const accel = 2400;
    const decel = 2000;

    if (tx !== 0 || ty !== 0) {
        player.vx += Math.sign(targetVx - player.vx) * Math.min(accel * dt, Math.abs(targetVx - player.vx));
        player.vy += Math.sign(targetVy - player.vy) * Math.min(accel * dt, Math.abs(targetVy - player.vy));
    } else {
        if (Math.abs(player.vx) < decel * dt) player.vx = 0;
        else player.vx -= Math.sign(player.vx) * decel * dt;
        if (Math.abs(player.vy) < decel * dt) player.vy = 0;
        else player.vy -= Math.sign(player.vy) * decel * dt;
    }

    const nx = player.x + player.vx * dt;
    if (!isSolidAt(nx, player.y, player.w, player.h)) {
        player.x = nx;
    } else {
        player.vx = 0;
    }

    const ny = player.y + player.vy * dt;
    if (!isSolidAt(player.x, ny, player.w, player.h)) {
        player.y = ny;
    } else {
        player.vy = 0;
    }

    player.x = Math.max(TILE, Math.min(player.x, (level.cols - 1) * TILE - player.w));
    player.y = Math.max(TILE, Math.min(player.y, (level.rows - 1) * TILE - player.h));
}

// ============ HAZARDS ============
function checkSpikes() {
    if (!level.spikes || level.spikes.length === 0) return false;
    const pr = getPlayerRect();
    for (let i = 0; i < level.spikes.length; i++) {
        const s = level.spikes[i];
        const sr = { x: s.x + 6, y: s.y + 6, w: s.w - 12, h: s.h - 12 };
        if (rectsOverlap(pr, sr)) return true;
    }
    return false;
}
function checkMovingWalls() {
    if (!level.movingWalls || level.movingWalls.length === 0) return false;
    const pr = getPlayerRect();
    for (let i = 0; i < level.movingWalls.length; i++) {
        if (rectsOverlap(pr, getMovingWallRect(level.movingWalls[i]))) return true;
    }
    return false;
}
function checkLasers() {
    if (!level.lasers || level.lasers.length === 0) return false;
    const pr = getPlayerRect();
    for (let i = 0; i < level.lasers.length; i++) {
        if (rectsOverlap(pr, getLaserRect(level.lasers[i]))) return true;
    }
    return false;
}
function checkKeys() {
    if (!level.keys || level.keys.length === 0) return;
    const pr = getPlayerRect();
    for (let i = 0; i < level.keys.length; i++) {
        const k = level.keys[i];
        if (!k.collected && rectsOverlap(pr, k)) {
            k.collected = true;
            AudioSystem.keyPickup();
            let all = true;
            for (let j = 0; j < level.keys.length; j++) if (!level.keys[j].collected) all = false;
            if (all && level.doors) {
                level.doors.forEach(function (d) { d.open = true; });
                AudioSystem.doorOpen();
            }
        }
    }
}
function checkFinish() {
    if (!level.finish) return false;
    if (level.doors) {
        for (let i = 0; i < level.doors.length; i++) {
            if (!level.doors[i].open) return false;
        }
    }
    const fr = { x: level.finish.x, y: level.finish.y, w: TILE, h: TILE };
    return rectsOverlap(getPlayerRect(), fr);
}

// ============ RENDER ============
function drawBackground() {
    const g = ctx.createRadialGradient(VIEW_W/2, VIEW_H/2, 100, VIEW_W/2, VIEW_H/2, VIEW_W);
    g.addColorStop(0, '#1a1a30');
    g.addColorStop(1, '#0a0a14');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.strokeStyle = 'rgba(60, 60, 120, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < VIEW_W; x += TILE) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, VIEW_H); ctx.stroke();
    }
    for (let y = 0; y < VIEW_H; y += TILE) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(VIEW_W, y); ctx.stroke();
    }
}

function drawWalls() {
    if (!level || !level.walls) return;
    for (let i = 0; i < level.walls.length; i++) {
        const wl = level.walls[i];
        ctx.fillStyle = '#2a2a45';
        ctx.fillRect(wl.x, wl.y, wl.w, wl.h);
        ctx.fillStyle = '#3d3d60';
        ctx.fillRect(wl.x, wl.y, wl.w, 3);
        ctx.strokeStyle = 'rgba(100, 100, 180, 0.25)';
        ctx.lineWidth = 1;
        ctx.strokeRect(wl.x + 0.5, wl.y + 0.5, wl.w - 1, wl.h - 1);
    }
}
function drawMovingWalls() {
    if (!level || !level.movingWalls) return;
    for (let i = 0; i < level.movingWalls.length; i++) {
        const r = getMovingWallRect(level.movingWalls[i]);
        ctx.fillStyle = '#4a3060';
        ctx.fillRect(r.x, r.y, r.w, r.h);
        ctx.fillStyle = '#7a4fa0';
        ctx.fillRect(r.x, r.y, r.w, 3);
        ctx.strokeStyle = 'rgba(160, 100, 220, 0.4)';
        ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
    }
}
function drawSpikes() {
    if (!level || !level.spikes) return;
    for (let i = 0; i < level.spikes.length; i++) {
        const s = level.spikes[i];
        const n = Math.max(1, Math.floor(s.w / 16));
        const sw = s.w / n;
        for (let j = 0; j < n; j++) {
            const sx = s.x + j * sw;
            ctx.fillStyle = '#cc3344';
            ctx.beginPath();
            if (s.dir === 'up') {
                ctx.moveTo(sx, s.y + s.h); ctx.lineTo(sx + sw/2, s.y); ctx.lineTo(sx + sw, s.y + s.h);
            } else if (s.dir === 'down') {
                ctx.moveTo(sx, s.y); ctx.lineTo(sx + sw/2, s.y + s.h); ctx.lineTo(sx + sw, s.y);
            } else if (s.dir === 'left') {
                ctx.moveTo(sx + sw, s.y); ctx.lineTo(sx, s.y + s.h/2); ctx.lineTo(sx + sw, s.y + s.h);
            } else {
                ctx.moveTo(sx, s.y); ctx.lineTo(sx + sw, s.y + s.h/2); ctx.lineTo(sx, s.y + s.h);
            }
            ctx.closePath(); ctx.fill();
        }
    }
}
function drawLasers() {
    if (!level || !level.lasers) return;
    for (let i = 0; i < level.lasers.length; i++) {
        const r = getLaserRect(level.lasers[i]);
        const p = 0.7 + 0.3 * Math.sin(elapsedTime * 8);
        ctx.shadowColor = '#ff2266';
        ctx.shadowBlur = 15 * p;
        ctx.fillStyle = 'rgba(255, 34, 102, ' + (0.6 * p) + ')';
        ctx.fillRect(r.x, r.y, r.w, r.h);
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255, 200, 220, 0.9)';
        if (r.w > r.h) ctx.fillRect(r.x, r.y + r.h/2 - 1, r.w, 2);
        else ctx.fillRect(r.x + r.w/2 - 1, r.y, 2, r.h);
    }
    ctx.shadowBlur = 0;
}
function drawDisappearing() {
    if (!level || !level.disappearing) return;
    for (let i = 0; i < level.disappearing.length; i++) {
        const dp = level.disappearing[i];
        const solid = isDisappearingSolid(dp);
        if (solid) {
            ctx.fillStyle = 'rgba(60, 180, 200, 0.85)';
            ctx.fillRect(dp.x, dp.y, dp.w, dp.h);
            ctx.strokeStyle = 'rgba(100, 230, 255, 0.85)';
            ctx.strokeRect(dp.x + 0.5, dp.y + 0.5, dp.w - 1, dp.h - 1);
        } else {
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = 'rgba(100, 230, 255, 0.3)';
            ctx.strokeRect(dp.x + 0.5, dp.y + 0.5, dp.w - 1, dp.h - 1);
            ctx.setLineDash([]);
        }
    }
}
function drawKeys() {
    if (!level || !level.keys) return;
    for (let i = 0; i < level.keys.length; i++) {
        const k = level.keys[i];
        if (k.collected) continue;
        const cx = k.x + k.w/2, cy = k.y + k.h/2;
        const p = 1 + 0.1 * Math.sin(elapsedTime * 4);
        ctx.shadowColor = '#ffdd44';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#ffdd44';
        ctx.beginPath(); ctx.arc(cx - 4, cy, 4 * p, 0, Math.PI * 2); ctx.fill();
        ctx.fillRect(cx, cy - 2, 8, 4);
        ctx.fillRect(cx + 6, cy, 2, 3);
        ctx.shadowBlur = 0;
    }
}
function drawDoors() {
    if (!level || !level.doors) return;
    for (let i = 0; i < level.doors.length; i++) {
        const d = level.doors[i];
        if (d.open) {
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = 'rgba(100, 255, 150, 0.3)';
            ctx.strokeRect(d.x + 2, d.y + 2, d.w - 4, d.h - 4);
            ctx.setLineDash([]);
        } else {
            ctx.fillStyle = '#5a3010';
            ctx.fillRect(d.x, d.y, d.w, d.h);
            ctx.strokeStyle = '#aa6622';
            ctx.strokeRect(d.x + 0.5, d.y + 0.5, d.w - 1, d.h - 1);
            ctx.fillStyle = '#ffdd44';
            ctx.beginPath(); ctx.arc(d.x + d.w/2, d.y + d.h/2, 5, 0, Math.PI * 2); ctx.fill();
        }
    }
}
function drawFinish() {
    if (!level || !level.finish) return;
    const fx = level.finish.x, fy = level.finish.y;
    const p = 0.6 + 0.4 * Math.sin(elapsedTime * 3);
    ctx.shadowColor = '#44ff88';
    ctx.shadowBlur = 25 * p;
    const g = ctx.createRadialGradient(fx + TILE/2, fy + TILE/2, 2, fx + TILE/2, fy + TILE/2, TILE);
    g.addColorStop(0, 'rgba(100, 255, 180, ' + (0.9 * p) + ')');
    g.addColorStop(1, 'rgba(30, 150, 80, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(fx - 8, fy - 8, TILE + 16, TILE + 16);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(120, 255, 180, ' + p + ')';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(fx + TILE/2, fy + TILE/2, TILE/2 - 2, 0, Math.PI * 2);
    ctx.stroke();
}
function drawPlayer() {
    if (!player.alive) return;
    const cx = player.x + player.w/2, cy = player.y + player.h/2;
    ctx.shadowColor = '#6688ff';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#8899ff';
    ctx.beginPath(); ctx.arc(cx, cy, player.w/2, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#bbccff';
    ctx.beginPath(); ctx.arc(cx - 2, cy - 2, player.w/2 - 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a1a30';
    ctx.beginPath(); ctx.arc(cx - 3, cy - 3, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 3, cy - 3, 2.5, 0, Math.PI * 2); ctx.fill();
}
function drawParticles() {
    for (let i = deathParticles.length - 1; i >= 0; i--) {
        const p = deathParticles[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.15;
        p.life -= 0.025; p.vx *= 0.98;
        if (p.life <= 0) { deathParticles.splice(i, 1); continue; }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
}
function spawnDeathParticles(x, y) {
    for (let i = 0; i < 30; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 1 + Math.random() * 4;
        deathParticles.push({
            x: x, y: y,
            vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1,
            life: 1, size: 3 + Math.random() * 5,
            color: Math.random() > 0.5 ? '#ff5566' : '#ffaa44'
        });
    }
}

// ============ UI ============
const screens = {
    menu: document.getElementById('menu-screen'),
    gameover: document.getElementById('gameover-screen'),
    levelcomplete: document.getElementById('levelcomplete-screen'),
    pause: document.getElementById('pause-screen'),
    victory: document.getElementById('victory-screen')
};
const hud = document.getElementById('hud');

function hideAllScreens() {
    for (const k in screens) screens[k].classList.add('hidden');
}
function showScreen(name) {
    hideAllScreens();
    screens[name].classList.remove('hidden');
}
function updateHUDVisibility() {
    if (state === GameState.PLAYING || state === GameState.PAUSED) hud.classList.remove('hidden');
    else hud.classList.add('hidden');
}
function updateHUD() {
    document.getElementById('hud-level').textContent = 'LEVEL ' + (currentLevel + 1);
    document.getElementById('hud-timer').textContent = formatTime(elapsedTime);
    document.getElementById('hud-deaths').textContent = '☠ ' + totalDeaths;
}
function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
}

// ============ SAVE ============
const SAVE_KEY = 'escape_protocol_save';
function saveProgress() {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify({
            currentLevel: currentLevel, totalDeaths: totalDeaths, totalTime: totalTime
        }));
    } catch (e) {}
}
function loadProgress() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
}
function hasSave() { return loadProgress() !== null; }
function clearSave() {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
}

// ============ FLOW ============
function startGame(fromSave) {
    AudioSystem.init();
    if (fromSave) {
        const save = loadProgress();
        if (save) {
            totalDeaths = save.totalDeaths || 0;
            totalTime = save.totalTime || 0;
            loadLevel(Math.min(save.currentLevel || 0, Levels.length - 1));
        } else {
            totalDeaths = 0; totalTime = 0; loadLevel(0);
        }
    } else {
        totalDeaths = 0; totalTime = 0; loadLevel(0);
    }
    state = GameState.PLAYING;
    hideAllScreens();
    updateHUDVisibility();
}
function newGame() { clearSave(); startGame(false); }

function handleDeath() {
    if (state !== GameState.PLAYING) return;
    player.alive = false;
    totalDeaths++;
    saveProgress();
    AudioSystem.death();
    spawnDeathParticles(player.x + player.w/2, player.y + player.h/2);
    document.getElementById('death-level').textContent = 'Уровень ' + (currentLevel + 1);
    state = GameState.DEAD;
    setTimeout(function () {
        if (state === GameState.DEAD) {
            showScreen('gameover');
            updateHUDVisibility();
            updateHUD();
        }
    }, 500);
}
function handleLevelComplete() {
    if (state !== GameState.PLAYING) return;
    totalTime += elapsedTime;
    saveProgress();
    AudioSystem.levelComplete();
    const nextIdx = currentLevel + 1;
    if (nextIdx >= Levels.length) {
        state = GameState.VICTORY;
        showVictory();
        return;
    }
    document.getElementById('complete-info').textContent =
        'Следующий: Уровень ' + (nextIdx + 1) + ' — ' + Levels[nextIdx].name;
    state = GameState.LEVEL_COMPLETE;
    showScreen('levelcomplete');
    updateHUDVisibility();
}
function showVictory() {
    AudioSystem.victory();
    document.getElementById('stat-time').textContent = formatTime(totalTime + elapsedTime);
    document.getElementById('stat-deaths').textContent = totalDeaths;
    document.getElementById('stat-levels').textContent = Levels.length;
    showScreen('victory');
    updateHUDVisibility();
    clearSave();
}
function handleEscape() {
    if (state === GameState.PLAYING) {
        state = GameState.PAUSED;
        showScreen('pause');
        updateHUDVisibility();
    } else if (state === GameState.PAUSED) {
        state = GameState.PLAYING;
        hideAllScreens();
        updateHUDVisibility();
    }
}
function handleRestart() {
    if (state === GameState.PLAYING || state === GameState.DEAD || state === GameState.PAUSED) {
        restartLevel();
    }
}
function handleEnter() {
    if (state === GameState.LEVEL_COMPLETE) nextLevel();
    else if (state === GameState.MENU) startGame(hasSave());
}
function goToMenu() {
    state = GameState.MENU;
    hideAllScreens();
    showScreen('menu');
    updateHUDVisibility();
    if (hasSave()) document.getElementById('btn-continue').classList.remove('hidden');
}

// ============ UPDATE / RENDER ============
function update(dt) {
    if (state === GameState.PLAYING) {
        elapsedTime = (performance.now() - levelStartTime) / 1000;
        movePlayer(dt);
        checkKeys();
        if (checkSpikes() || checkMovingWalls() || checkLasers()) {
            handleDeath();
            return;
        }
        if (checkFinish()) {
            handleLevelComplete();
            return;
        }
        updateHUD();
    }
}
function render() {
    ctx.clearRect(0, 0, VIEW_W, VIEW_H);
    drawBackground();

    if (level && state !== GameState.MENU) {
        drawWalls();
        drawDisappearing();
        drawDoors();
        drawMovingWalls();
        drawSpikes();
        drawLasers();
        drawKeys();
        drawFinish();
        drawPlayer();
        drawParticles();
    }
}

// ============ LOOP ============
function gameLoop(ts) {
    if (!lastTimestamp) lastTimestamp = ts;
    let dt = (ts - lastTimestamp) / 1000;
    lastTimestamp = ts;
    if (dt > 0.05) dt = 0.05;
    if (dt < 0) dt = 0;
    update(dt);
    render();
    requestAnimationFrame(gameLoop);
}

// ============ INIT ============
function init() {
    document.getElementById('btn-play').addEventListener('click', function () {
        AudioSystem.button(); newGame();
    });
    document.getElementById('btn-continue').addEventListener('click', function () {
        AudioSystem.button(); startGame(true);
    });
    document.getElementById('btn-reset').addEventListener('click', function () {
        AudioSystem.button(); clearSave();
        document.getElementById('btn-continue').classList.add('hidden');
        newGame();
    });
    document.getElementById('btn-retry').addEventListener('click', function () {
        AudioSystem.button(); restartLevel();
    });
    document.getElementById('btn-menu-from-death').addEventListener('click', function () {
        AudioSystem.button(); goToMenu();
    });
    document.getElementById('btn-next').addEventListener('click', function () {
        AudioSystem.button(); nextLevel();
    });
    document.getElementById('btn-resume').addEventListener('click', function () {
        AudioSystem.button(); handleEscape();
    });
    document.getElementById('btn-restart-level').addEventListener('click', function () {
        AudioSystem.button(); restartLevel();
    });
    document.getElementById('btn-menu-from-pause').addEventListener('click', function () {
        AudioSystem.button(); goToMenu();
    });
    document.getElementById('btn-play-again').addEventListener('click', function () {
        AudioSystem.button(); newGame();
    });
    if (hasSave()) document.getElementById('btn-continue').classList.remove('hidden');
    requestAnimationFrame(gameLoop);
}

init();