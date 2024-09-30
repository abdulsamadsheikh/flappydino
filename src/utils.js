// Detect collision between Dino and an obstacle (tree, pterodactyl, or meteor)
function detectCollision(dino, obstacle) {
    return (
        dino.x < obstacle.x + obstacle.width &&
        dino.x + dino.width > obstacle.x &&
        dino.y < obstacle.y + obstacle.height &&
        dino.y + dino.height > obstacle.y
    );
}

// Handle user input for jumping and shooting
function handleInput(e) {
    if (e.key === ' ') {
        // Spacebar pressed for jumping
        dino.jump();
    }
    if (e.key === 'ArrowRight') {
        // Right arrow pressed for shooting lasers
        dino.shootLaser();
    }
}

// Utility to remove elements from an array
function removeFromArray(array, element) {
    const index = array.indexOf(element);
    if (index > -1) {
        array.splice(index, 1); // Remove the element
    }
}

// Function to detect if a laser has hit an enemy (pterodactyl or meteor)
function detectLaserCollision(laser, enemy) {
    return (
        laser.x < enemy.x + enemy.width &&
        laser.x + laser.width > enemy.x &&
        laser.y < enemy.y + enemy.height &&
        laser.y + laser.height > enemy.y
    );
}

// Detect multiple collisions between lasers and enemies
function detectLaserEnemyCollision(lasers, enemies) {
    lasers.forEach((laser) => {
        enemies.forEach((enemy) => {
            if (detectLaserCollision(laser, enemy)) {
                console.log('Laser hit an enemy!');
                removeFromArray(enemies, enemy); // Remove enemy
                removeFromArray(lasers, laser);  // Remove laser
            }
        });
    });
}

// Detect Dino's collision with any obstacles (trees, meteors, pterodactyls)
function detectDinoCollision(dino, obstacles, meteors, pterodactyls) {
    obstacles.forEach((obstacle) => {
        if (detectCollision(dino, obstacle)) {
            console.log('Dino hit a tree!');
            endGame();
        }
    });

    meteors.forEach((meteor) => {
        if (detectCollision(dino, meteor)) {
            console.log('Dino hit a meteor!');
            endGame();
        }
    });

    pterodactyls.forEach((pterodactyl) => {
        if (detectCollision(dino, pterodactyl)) {
            console.log('Dino hit a pterodactyl!');
            endGame();
        }
    });
}

// Utility to end the game when Dino hits an obstacle
function endGame() {
    console.log('Game Over!');
    isGameOver = true;  // Set a flag to stop the game loop
    // Additional logic for game over can be added here (e.g., show a "Game Over" screen)
}

// Event listener for keyboard input (jump and shoot)
window.addEventListener('keydown', handleInput);