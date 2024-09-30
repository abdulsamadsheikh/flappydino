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
    }

    jump() {
        this.velocity = this.jumpStrength; // Makes the dino jump
    }

    shootLaser() {
        // Get a random laser image from the 66 available options
        const randomLaserImage = `assets/images/lasers/${this.getRandomLaserImage()}`;
        
        // Add new laser to the lasers array
        this.lasers.push(new Laser(this.x, this.y, randomLaserImage));
    }

    getRandomLaserImage() {
        // Generate a random number between 1 and 66 for the laser image
        const laserIndex = Math.floor(Math.random() * 66) + 1; // Range: 1 to 66
        return laserIndex < 10 ? `0${laserIndex}.png` : `${laserIndex}.png`;
    }

    update() {
        // Apply gravity
        this.velocity += this.gravity;
        this.y += this.velocity;

        // Ensure Dino stays within canvas bounds
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.velocity = 0; // Stop falling once it hits the ground
        }

        // Update lasers
        this.lasers.forEach(laser => laser.update());
    }

    draw() {
        // Draw dino on canvas (Replace this with image drawing logic if needed)
        context.fillRect(this.x, this.y, this.width, this.height);

        // Draw lasers
        this.lasers.forEach(laser => laser.draw());
    }
}

class Laser {
    constructor(x, y, imageSrc) {
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 5;
        this.speed = 10;
        this.image = new Image();
        this.image.src = imageSrc;
    }

    update() {
        // Move the laser to the right
        this.x += this.speed;
    }

    draw() {
        // Draw the laser image on the canvas
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}