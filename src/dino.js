// Contents of src/dino.js

class Dino {
    constructor() {
        this.x = 50;  // Position on canvas
        this.y = canvas.height / 2; // Start in middle
        this.width = 50; // Dino size
        this.height = 50;
        this.gravity = 0.5;
        this.jumpStrength = -10;
        this.velocity = 0;
        this.lasers = [];  // Store active lasers
        this.image = new Image(); // Create a new Image object
        this.image.src = 'assets/images/dino.png'; // Make sure the path is correct
    }

    jump() {
        this.velocity = this.jumpStrength; // Makes the dino jump

        // Play a random jump sound with specified volume
        playRandomSound(jumpSounds, JUMPING_SOUNDS_VOLUME);
    }

    shootLaser() {
        const randomLaserImage = `assets/images/lasers/${this.getRandomLaserImage()}`;
        this.lasers.push(new Laser(this.x, this.y, randomLaserImage));

        // Play a random shoot sound with specified volume
        playRandomSound(shootSounds, SHOOTING_SOUNDS_VOLUME);
    }

    getRandomLaserImage() {
        const laserIndex = Math.floor(Math.random() * 66) + 1; 
        return laserIndex < 10 ? `0${laserIndex}.png` : `${laserIndex}.png`;
    }

    update() {
        // Apply gravity
        this.velocity += this.gravity;
        this.y += this.velocity;
    
        // Ensure Dino stays within canvas bounds
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.velocity = 0;
            endGame();  // Trigger game over if the Dino hits the ground
        }
    
        // Update lasers
        this.lasers.forEach(laser => laser.update());
    }


    draw() {
        // Draw the Dino using the sprite image instead of a block
        context.drawImage(this.image, this.x, this.y, this.width, this.height);

        // Draw lasers
        this.lasers.forEach(laser => laser.draw());
    }
}

class Laser {
    constructor(x, y, imageSrc) {
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 100;
        this.speed = 10;
        this.image = new Image();
        this.image.src = imageSrc;
    }

    update() {
        // Move the laser to the right
        this.x += this.speed;

        // Remove laser if it moves off-screen
        if (this.x > canvas.width) {
            removeFromArray(dino.lasers, this);
        }
    }

    draw() {
        // Draw the laser image on the canvas
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}
