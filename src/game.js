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

function gameLoop() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'start') {
        drawStartScreen();
    } else if (gameState === 'playing') {
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

        drawScore();
    } else if (gameState === 'gameover') {
        drawGameOverScreen();
    }

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
    context.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 50); 
    context.fillText('Press Space to Restart', canvas.width / 2, canvas.height / 2 + 100);
}

function drawScore() {
    context.fillStyle = 'white';               
    context.font = '36px Arial';               
    context.textAlign = 'center';             
    context.fillText(`Score: ${score}`, canvas.width / 2, 50); 
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

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);  
        console.log('New high score:', highScore);
    }

}

window.addEventListener('keydown', handleInput);
