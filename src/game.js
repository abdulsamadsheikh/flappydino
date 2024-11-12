// Initialize canvas and context
let canvas = document.getElementById('gameCanvas');
let context = canvas.getContext('2d');
let highScore = localStorage.getItem('highScore') || 0;  // Load high score from localStorage or default to 0

// Function to make canvas full screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Call resizeCanvas on window resize
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial call to set the canvas size

// Load background images
let backgroundLayer1 = new Image();
backgroundLayer1.src = 'assets/images/background_layer_1.png';

let backgroundLayer2 = new Image();
backgroundLayer2.src = 'assets/images/background_layer_2.png';

let backgroundLayer3 = new Image();
backgroundLayer3.src = 'assets/images/background_layer_3.png'; // Optional, third layer

// Variables to control the scrolling speed of each layer
let backgroundLayer1X = 0;
let backgroundLayer2X = 0;
let backgroundLayer3X = 0;

let backgroundSpeed1 = 0.5 / 3;  // Slow down background movement
let backgroundSpeed2 = 1 / 3;
let backgroundSpeed3 = 2.5 / 3;

// Game state variables
let gameState = 'start'; // Possible states: 'start', 'playing', 'gameover'
let score = 0;

// Initialize game elements
let dino;
let obstacles = [];
let meteors = [];
let pterodactyls = [];

// Timers for spawning obstacles
let obstacleSpawnTimer = 0;
let meteorSpawnTimer = 0;
let pterodactylSpawnTimer = 0;

// Start the game loop
requestAnimationFrame(gameLoop);

function startGame() {
    // Initialize game elements
    dino = new Dino();
    obstacles = [new Tree()];
    meteors = [new Meteor()];
    pterodactyls = [new Pterodactyl()];

    // Reset score and timers
    score = 0;
    obstacleSpawnTimer = 0;
    meteorSpawnTimer = 0;
    pterodactylSpawnTimer = 0;
    
    gameState = 'playing'; // Set game state to playing
}

function resetGame() {
    startGame(); // Reuse startGame to reset
}

function updateBackground() {
    // Update background positions
    backgroundLayer1X -= backgroundSpeed1;
    backgroundLayer2X -= backgroundSpeed2;
    backgroundLayer3X -= backgroundSpeed3;

    // Reset positions for seamless looping
    if (backgroundLayer1X <= -canvas.width) {
        backgroundLayer1X = 0;
    }
    if (backgroundLayer2X <= -canvas.width) {
        backgroundLayer2X = 0;
    }
    if (backgroundLayer3X <= -canvas.width) {
        backgroundLayer3X = 0;
    }
}

function drawBackground() {
    // Draw background layers
    context.drawImage(backgroundLayer1, backgroundLayer1X, 0, canvas.width, canvas.height);
    context.drawImage(backgroundLayer1, backgroundLayer1X + canvas.width, 0, canvas.width, canvas.height);

    context.drawImage(backgroundLayer2, backgroundLayer2X, 0, canvas.width, canvas.height);
    context.drawImage(backgroundLayer2, backgroundLayer2X + canvas.width, 0, canvas.width, canvas.height);

    context.drawImage(backgroundLayer3, backgroundLayer3X, 0, canvas.width, canvas.height);
    context.drawImage(backgroundLayer3, backgroundLayer3X + canvas.width, 0, canvas.width, canvas.height);
}

function gameLoop() {
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'start') {
        drawStartScreen();
    } else if (gameState === 'playing') {
        // Update game elements
        updateBackground();
        drawBackground();

        dino.update();
        dino.draw();

        // Update and draw obstacles
        obstacles.forEach(tree => {
            tree.update();
            tree.draw();
        });

        meteors.forEach(meteor => {
            meteor.update();
            meteor.draw();
        });

        pterodactyls.forEach(pterodactyl => {
            pterodactyl.update();
            pterodactyl.draw();
        });

        // Spawn new obstacles
        spawnObstacles();

        // Check for collisions
        checkCollisions();

        // Increment score only if game is still in 'playing' state
        if (gameState === 'playing') {
            score++;
        }

        // Draw live score
        drawScore();
    } else if (gameState === 'gameover') {
        drawGameOverScreen(); // Show game over screen with high score
    }

    // Request the next frame
    requestAnimationFrame(gameLoop);
}

function drawStartScreen() {
    context.fillStyle = 'black';
    context.font = '48px Arial';
    context.textAlign = 'center';
    context.fillText('Flappy Dino', canvas.width / 2, canvas.height / 2 - 50);
    context.font = '24px Arial';
    context.fillText('Press Space to Start', canvas.width / 2, canvas.height / 2);
}

function drawGameOverScreen() {
    context.fillStyle = 'black';
    context.font = '48px Arial';
    context.textAlign = 'center';
    context.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 50);
    context.font = '24px Arial';
    context.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2);
    context.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 50); // Display high score
    context.fillText('Press Space to Restart', canvas.width / 2, canvas.height / 2 + 100);
}

function drawScore() {
    context.fillStyle = 'white';               
    context.font = '36px Arial';               
    context.textAlign = 'center';             
    context.fillText(`Score: ${score}`, canvas.width / 2, 50); 
}

function spawnObstacles() {
    // Increase timers
    obstacleSpawnTimer++;
    meteorSpawnTimer++;
    pterodactylSpawnTimer++;

    // Spawn new tree every 200 frames (~every 3 seconds at 60fps)
    if (obstacleSpawnTimer > 200) {
        obstacles.push(new Tree());
        obstacleSpawnTimer = 0;
    }

    // Spawn new meteor every 150 frames
    if (meteorSpawnTimer > 150) {
        meteors.push(new Meteor());
        meteorSpawnTimer = 0;
    }

    // Spawn new pterodactyl every 250 frames
    if (pterodactylSpawnTimer > 250) {
        pterodactyls.push(new Pterodactyl());
        pterodactylSpawnTimer = 0;
    }
}

function checkCollisions() {
    // Check collisions between Dino and obstacles
    detectDinoCollision(dino, obstacles, meteors, pterodactyls);

    // Check if lasers hit meteors or pterodactyls
    detectLaserEnemyCollision(dino.lasers, meteors);
    detectLaserEnemyCollision(dino.lasers, pterodactyls);
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

// Event listener for handling user input
window.addEventListener('keydown', handleInput);

function handleInput(e) {
    if (gameState === 'start') {
        if (e.key === ' ') {
            startGame();
        }
    } else if (gameState === 'playing') {
        if (e.key === ' ') {
            dino.jump();       // Make the Dino jump
        }
    } else if (gameState === 'gameover') {
        if (e.key === ' ') {
            startGame();       // Restart the game
        }
    }
}