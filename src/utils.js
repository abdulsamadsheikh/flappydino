// Contents of src/utils.js

// Detect collision between Dino and an obstacle
function detectCollision(dino, obstacle) {
    return (
        dino.x < obstacle.x + obstacle.width &&
        dino.x + dino.width > obstacle.x &&
        dino.y < obstacle.y + obstacle.height &&
        dino.y + dino.height > obstacle.y
    );
}

// Handle user input for jumping, shooting, and game state transitions
function handleInput(e) {
    if (gameState === 'start') {
        if (e.key === ' ') {
            // Start the game
            gameState = 'playing';
            startGame();
        }
    } else if (gameState === 'playing') {
        if (e.key === ' ') {
            // Spacebar pressed for jumping
            dino.jump();
        }
        if (e.key === 'ArrowRight') {
            // Right arrow pressed for shooting lasers
            dino.shootLaser();
        }
    } else if (gameState === 'gameover') {
        if (e.key === ' ') {
            // Restart the game
            resetGame();
            gameState = 'playing';
        }
    }
}

// Utility to remove elements from an array
function removeFromArray(array, element) {
    const index = array.indexOf(element);
    if (index > -1) {
        array.splice(index, 1); // Remove the element
    }
}

// Function to detect if a laser has hit an enemy
function detectLaserCollision(laser, enemy) {
    return (
        laser.x < enemy.x + enemy.width &&
        laser.x + laser.width > enemy.x &&
        laser.y < enemy.y + enemy.height &&
        laser.y + laser.height > enemy.y
    );
}

// Detect collisions between lasers and enemies
function detectLaserEnemyCollision(lasers, enemies) {
    lasers.forEach((laser) => {
        enemies.forEach((enemy) => {
            if (detectLaserCollision(laser, enemy)) {
                console.log('Laser hit an enemy!');
                removeFromArray(enemies, enemy); // Remove enemy
                removeFromArray(lasers, laser);  // Remove laser
                score += 10; // Increase score

                // Play a random hit sound with specified volume
                playRandomSound(hitSounds, COLLISION_SOUNDS_VOLUME);
            }
        });
    });
}

// Detect Dino's collision with any obstacles
function detectDinoCollision(dino, obstacles, meteors, pterodactyls) {
    obstacles.forEach((obstacle) => {
        if (detectCollision(dino, obstacle)) {
            console.log('Dino hit a tree!');

            // Play a random hit sound with specified volume
            playRandomSound(hitSounds, COLLISION_SOUNDS_VOLUME);

            endGame();
        }
    });

    meteors.forEach((meteor) => {
        if (detectCollision(dino, meteor)) {
            console.log('Dino hit a meteor!');

            // Play a random hit sound with specified volume
            playRandomSound(hitSounds, COLLISION_SOUNDS_VOLUME);

            endGame();
        }
    });

    pterodactyls.forEach((pterodactyl) => {
        if (detectCollision(dino, pterodactyl)) {
            console.log('Dino hit a pterodactyl!');

            // Play a random hit sound with specified volume
            playRandomSound(hitSounds, COLLISION_SOUNDS_VOLUME);

            endGame();
        }
    });
}

// Function to end the game
function endGame() {
    console.log('Game Over!');
    gameState = 'gameover';

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);  
        console.log('New high score:', highScore);
    }

    // Do NOT pause the background music to keep it playing continuously
}
