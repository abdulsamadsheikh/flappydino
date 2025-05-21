function detectCollision(dino, obstacle) {
    return (
        dino.x < obstacle.x + obstacle.width &&
        dino.x + dino.width > obstacle.x &&
        dino.y < obstacle.y + obstacle.height &&
        dino.y + dino.height > obstacle.y
    );
}

let touchStartX = 0;
let touchStartY = 0;
let isSwiping = false;

function handleInput(e) {
    if (gameState === 'start') {
        if (e.key === ' ' || e.type === 'touchstart') {
            gameState = 'playing';
            startGame();
        }
    } else if (gameState === 'playing') {
        if (e.key === 'p' || e.key === 'P') {
            togglePause();
        }
        if (!isPaused) {
            if (e.key === ' ' || e.type === 'touchstart') {
                dino.jump();
            }
            if (e.key === 'ArrowRight') {
                dino.shootLaser();
            }
        }
    } else if (gameState === 'gameover') {
        if (e.key === ' ' || e.type === 'touchstart') {
            resetGame();
            gameState = 'playing';
        }
    }
}

function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isSwiping = false;
}

function handleTouchMove(e) {
    if (!isSwiping) {
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const deltaX = touchX - touchStartX;
        const deltaY = touchY - touchStartY;

        // If horizontal movement is greater than vertical and significant enough
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            isSwiping = true;
            if (deltaX > 0 && gameState === 'playing' && !isPaused) {
                dino.shootLaser();
            }
        }
    }
}

function handleTouchEnd(e) {
    if (!isSwiping) {
        handleInput({ type: 'touchstart' });
    }
    isSwiping = false;
}

function removeFromArray(array, element) {
    const index = array.indexOf(element);
    if (index > -1) {
        array.splice(index, 1); 
    }
}

function detectLaserCollision(laser, enemy) {
    return (
        laser.x < enemy.x + enemy.width &&
        laser.x + laser.width > enemy.x &&
        laser.y < enemy.y + enemy.height &&
        laser.y + laser.height > enemy.y
    );
}

function detectLaserEnemyCollision(lasers, enemies) {
    lasers.forEach((laser) => {
        enemies.forEach((enemy) => {
            if (detectLaserCollision(laser, enemy)) {
                console.log('Laser hit an enemy!');
                removeFromArray(enemies, enemy); 
                removeFromArray(lasers, laser);  
                score += 10; 

                playRandomSound(hitSounds, COLLISION_SOUNDS_VOLUME);
            }
        });
    });
}

function detectDinoCollision(dino, obstacles, meteors, pterodactyls) {
    obstacles.forEach((obstacle) => {
        if (detectCollision(dino, obstacle)) {
            console.log('Dino hit a tree!');

            playRandomSound(hitSounds, COLLISION_SOUNDS_VOLUME);

            endGame();
        }
    });

    meteors.forEach((meteor) => {
        if (detectCollision(dino, meteor)) {
            console.log('Dino hit a meteor!');

            playRandomSound(hitSounds, COLLISION_SOUNDS_VOLUME);

            endGame();
        }
    });

    pterodactyls.forEach((pterodactyl) => {
        if (detectCollision(dino, pterodactyl)) {
            console.log('Dino hit a pterodactyl!');

            playRandomSound(hitSounds, COLLISION_SOUNDS_VOLUME);

            endGame();
        }
    });
}

function endGame() {
    console.log('Game Over!');
    gameState = 'gameover';

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);  
        console.log('New high score:', highScore);
    }

}

// Add touch event listeners for mobile
canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
canvas.addEventListener('touchend', handleTouchEnd, { passive: true });
