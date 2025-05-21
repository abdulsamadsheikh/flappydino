let canvas = document.getElementById('gameCanvas');
let context = canvas.getContext('2d');
let highScore = localStorage.getItem('highScore') || 0;  

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); 

let backgroundLayer1 = new Image();
backgroundLayer1.src = 'assets/images/background_layer_1.png';

let backgroundLayer2 = new Image();
backgroundLayer2.src = 'assets/images/background_layer_2.png';

let backgroundLayer3 = new Image();
backgroundLayer3.src = 'assets/images/background_layer_3.png'; 

let backgroundLayer1X = 0;
let backgroundLayer2X = 0;
let backgroundLayer3X = 0;

let backgroundSpeed1 = 0.5 / 3;  
let backgroundSpeed2 = 1 / 3;
let backgroundSpeed3 = 2.5 / 3;

let gameState = 'start'; 
let score = 0;
let isPaused = false;

const BACKGROUND_MUSIC_VOLUME = 0.8; // Background music volume (0.0 to 1.0)
const COLLISION_SOUNDS_VOLUME = 0.2;  // Collision sounds volume
const SHOOTING_SOUNDS_VOLUME = 0.2;   // Shooting sounds volume
const JUMPING_SOUNDS_VOLUME = 0.1;    // Jumping sounds volume

const backgroundMusic = new Audio('assets/sounds/background_music.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = BACKGROUND_MUSIC_VOLUME; 
backgroundMusic.preload = 'auto'; 

const hitSounds = [
    new Audio('assets/sounds/Hit_00.mp3'),
    new Audio('assets/sounds/Hit_01.mp3'),
    new Audio('assets/sounds/Hit_02.mp3'),
    new Audio('assets/sounds/Hit_03.mp3')
];

const jumpSounds = [
    new Audio('assets/sounds/Jump_00.mp3'),
    new Audio('assets/sounds/Jump_01.mp3'),
    new Audio('assets/sounds/Jump_02.mp3'),
    new Audio('assets/sounds/Jump_03.mp3')
];

const shootSounds = [
    new Audio('assets/sounds/Shoot_00.mp3'),
    new Audio('assets/sounds/Shoot_01.mp3'),
    new Audio('assets/sounds/Shoot_02.mp3'),
    new Audio('assets/sounds/Shoot_03.mp3')
];

function playRandomSound(soundArray, volume) {
    const randomIndex = Math.floor(Math.random() * soundArray.length);
    const sound = soundArray[randomIndex].cloneNode();
    sound.volume = volume; 
    sound.play().catch(error => {
        console.error('Sound play failed:', error);
    });
}

hitSounds.forEach(sound => {
    sound.preload = 'auto';
});

jumpSounds.forEach(sound => {
    sound.preload = 'auto';
});

shootSounds.forEach(sound => {
    sound.preload = 'auto';
});

let isBackgroundMusicPlaying = false;

let topScores = JSON.parse(localStorage.getItem('topScores')) || [0, 0, 0];

function updateTopScores(newScore) {
    topScores.push(newScore);
    topScores.sort((a, b) => b - a);
    topScores = topScores.slice(0, 3);
    localStorage.setItem('topScores', JSON.stringify(topScores));
}

requestAnimationFrame(gameLoop);

function startGame() {
    dino = new Dino();
    obstacles = [new Tree()];
    meteors = [new Meteor()];
    pterodactyls = [new Pterodactyl()];

    score = 0;
    obstacleSpawnTimer = 0;
    meteorSpawnTimer = 0;
    pterodactylSpawnTimer = 0;
    
    gameState = 'playing'; 

    if (!isBackgroundMusicPlaying) {
        backgroundMusic.play().then(() => {
            isBackgroundMusicPlaying = true;
            console.log('Background music started.');
        }).catch(error => {
            console.error('Background music play failed:', error);
        });
    } else {
        console.log('Background music is already playing.');
    }
}

function resetGame() {
    startGame(); 
}

function updateBackground() {
    backgroundLayer1X -= backgroundSpeed1;
    backgroundLayer2X -= backgroundSpeed2;
    backgroundLayer3X -= backgroundSpeed3;

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
    context.drawImage(backgroundLayer1, backgroundLayer1X, 0, canvas.width, canvas.height);
    context.drawImage(backgroundLayer1, backgroundLayer1X + canvas.width, 0, canvas.width, canvas.height);

    context.drawImage(backgroundLayer2, backgroundLayer2X, 0, canvas.width, canvas.height);
    context.drawImage(backgroundLayer2, backgroundLayer2X + canvas.width, 0, canvas.width, canvas.height);

    context.drawImage(backgroundLayer3, backgroundLayer3X, 0, canvas.width, canvas.height);
    context.drawImage(backgroundLayer3, backgroundLayer3X + canvas.width, 0, canvas.width, canvas.height);
}

function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        backgroundMusic.pause();
    } else {
        backgroundMusic.play();
    }
}

function gameLoop() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'start') {
        drawStartScreen();
    } else if (gameState === 'playing') {
        if (!isPaused) {
            updateBackground();
            drawBackground();

            dino.update();
            dino.draw();

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

            spawnObstacles();
            checkCollisions();

            if (gameState === 'playing') {
                score++;
            }
        }
        drawScore();
        if (isPaused) {
            drawPauseScreen();
        }
    } else if (gameState === 'gameover') {
        drawGameOverScreen();
    }

    requestAnimationFrame(gameLoop);
}

function drawStartScreen() {
    // Draw background
    updateBackground();
    drawBackground();

    // Draw title
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(canvas.width / 2 - 200, canvas.height / 2 - 200, 400, 400);
    
    context.fillStyle = 'white';
    context.font = `bold ${Math.min(48, canvas.width / 20)}px Arial`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('Flappy Dino', canvas.width / 2, canvas.height / 2 - 120);
    
    // Draw top scores
    context.font = `bold ${Math.min(24, canvas.width / 40)}px Arial`;
    context.fillText('Top Scores:', canvas.width / 2, canvas.height / 2 - 60);
    
    topScores.forEach((score, index) => {
        context.fillText(`${index + 1}. ${score}`, canvas.width / 2, canvas.height / 2 - 20 + (index * 30));
    });
    
    // Draw instructions
    context.font = `${Math.min(20, canvas.width / 48)}px Arial`;
    context.fillText('Press SPACE or tap to start', canvas.width / 2, canvas.height / 2 + 100);
    context.fillText('SPACE to jump, RIGHT ARROW to shoot', canvas.width / 2, canvas.height / 2 + 130);
    context.fillText('P to pause', canvas.width / 2, canvas.height / 2 + 160);
}

function drawGameOverScreen() {
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.fillStyle = 'white';
    context.font = `bold ${Math.min(48, canvas.width / 20)}px Arial`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 50);
    
    context.font = `${Math.min(24, canvas.width / 40)}px Arial`;
    context.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2);
    context.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 50); 
    context.fillText('Press Space to Restart', canvas.width / 2, canvas.height / 2 + 100);
}

function drawScore() {
    context.fillStyle = 'white';               
    context.font = `bold ${Math.min(36, canvas.width / 27)}px Arial`;               
    context.textAlign = 'center';
    context.textBaseline = 'middle';             
    context.fillText(`Score: ${score}`, canvas.width / 2, 50); 
}

function drawPauseScreen() {
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.fillStyle = 'white';
    context.font = `bold ${Math.min(48, canvas.width / 20)}px Arial`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    
    context.font = `${Math.min(24, canvas.width / 40)}px Arial`;
    context.fillText('Press P to Resume', canvas.width / 2, canvas.height / 2 + 50);
}

function spawnObstacles() {
    obstacleSpawnTimer++;
    meteorSpawnTimer++;
    pterodactylSpawnTimer++;

    if (obstacleSpawnTimer > 200) {
        obstacles.push(new Tree());
        obstacleSpawnTimer = 0;
    }

    if (meteorSpawnTimer > 150) {
        meteors.push(new Meteor());
        meteorSpawnTimer = 0;
    }

    if (pterodactylSpawnTimer > 250) {
        pterodactyls.push(new Pterodactyl());
        pterodactylSpawnTimer = 0;
    }
}

function checkCollisions() {
    detectDinoCollision(dino, obstacles, meteors, pterodactyls);

    detectLaserEnemyCollision(dino.lasers, meteors);
    detectLaserEnemyCollision(dino.lasers, pterodactyls);
}

function endGame() {
    console.log('Game Over!');
    gameState = 'gameover';
    updateTopScores(score);

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);  
        console.log('New high score:', highScore);
    }

    // Stop the background music
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    isBackgroundMusicPlaying = false;
}

window.addEventListener('keydown', handleInput);
