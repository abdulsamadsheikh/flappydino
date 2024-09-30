// Initialize game elements like Dino, Obstacles, and Meteors
let canvas = document.getElementById('gameCanvas');
let context = canvas.getContext('2d');

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

// Variables to control the scrolling speed of each layer (slowed down by 3x)
let backgroundLayer1X = 0;
let backgroundLayer2X = 0;
let backgroundLayer3X = 0;

let backgroundSpeed1 = 0.5 / 3;  // Slow down background movement
let backgroundSpeed2 = 1 / 3;
let backgroundSpeed3 = 2.5 / 3;

// Create the Dino and obstacles
let dino;
let obstacles = [];
let meteors = [];
let pterodactyls = [];

// Flag to check if the game is over
let isGameOver = false;

function startGame() {
    // Initialize Dino
    dino = new Dino();
    
    // Initialize obstacles (trees)
    obstacles.push(new Tree());

    // Initialize meteors and pterodactyls
    meteors.push(new Meteor());
    pterodactyls.push(new Pterodactyl());

    // Start game loop
    requestAnimationFrame(gameLoop);
}

function updateBackground() {
    // Update background positions (slowed down by the speed variables)
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
    // Draw the distant background (Layer 1)
    context.drawImage(backgroundLayer1, backgroundLayer1X, 0, canvas.width, canvas.height);
    context.drawImage(backgroundLayer1, backgroundLayer1X + canvas.width, 0, canvas.width, canvas.height); // Loop

    // Draw the midground background (Layer 2)
    context.drawImage(backgroundLayer2, backgroundLayer2X, 0, canvas.width, canvas.height);
    context.drawImage(backgroundLayer2, backgroundLayer2X + canvas.width, 0, canvas.width, canvas.height); // Loop

    // Draw the foreground background (Layer 3)
    context.drawImage(backgroundLayer3, backgroundLayer3X, 0, canvas.width, canvas.height);
    context.drawImage(backgroundLayer3, backgroundLayer3X + canvas.width, 0, canvas.width, canvas.height); // Loop
}

function gameLoop() {
    // Stop the game loop if game is over
    if (isGameOver) {
        return;
    }

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Update background
    updateBackground();

    // Draw background
    drawBackground();

    // Update and draw dino
    dino.update();
    dino.draw();

    // Update and draw obstacles (trees)
    obstacles.forEach(tree => {
        tree.update();
        tree.draw();
    });

    // Update and draw meteors
    meteors.forEach(meteor => {
        meteor.update();
        meteor.draw();
    });

    // Update and draw pterodactyls
    pterodactyls.forEach(pterodactyl => {
        pterodactyl.update();
        pterodactyl.draw();
    });

    // Check for collisions
    checkCollisions();

    // Request the next frame
    requestAnimationFrame(gameLoop);
}

function checkCollisions() {
    // Check collisions between Dino and obstacles (trees, meteors, pterodactyls)
    detectDinoCollision(dino, obstacles, meteors, pterodactyls);

    // Check if lasers hit meteors or pterodactyls
    detectLaserEnemyCollision(dino.lasers, meteors);
    detectLaserEnemyCollision(dino.lasers, pterodactyls);
}

function endGame() {
    console.log('Game Over');
    isGameOver = true; // Stop the game loop
    // Additional logic for game over (e.g., showing Game Over screen) can be added here
}

// Start the game
startGame();
