const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d', { alpha: false });

function rectsOverlap(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function shrinkBox(box, padX, padY) {
    return {
        x: box.x + padX,
        y: box.y + padY,
        width: box.width - padX * 2,
        height: box.height - padY * 2,
    };
}

function removeFromArray(array, element) {
    const index = array.indexOf(element);
    if (index > -1) array.splice(index, 1);
}

function clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
}

function detectLaserEnemyCollision(lasers, enemies, onHit) {
    for (let i = lasers.length - 1; i >= 0; i--) {
        const laser = lasers[i];
        const laserHit = shrinkBox(laser, laser.width * 0.25, laser.height * 0.35);
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (rectsOverlap(laserHit, enemy)) {
                lasers.splice(i, 1);
                enemies.splice(j, 1);
                if (onHit) onHit();
                break;
            }
        }
    }
}

function detectDinoHit(dino, obstacles, meteors, pterodactyls) {
    const dinoBox = shrinkBox(dino, dino.width * 0.18, dino.height * 0.18);
    for (const o of obstacles) {
        const ob = shrinkBox(o, o.width * 0.15, o.height * 0.08);
        if (rectsOverlap(dinoBox, ob)) return true;
    }
    for (const m of meteors) {
        const mb = shrinkBox(m, m.width * 0.12, m.height * 0.12);
        if (rectsOverlap(dinoBox, mb)) return true;
    }
    for (const p of pterodactyls) {
        const pb = shrinkBox(p, p.width * 0.15, p.height * 0.2);
        if (rectsOverlap(dinoBox, pb)) return true;
    }
    return false;
}
