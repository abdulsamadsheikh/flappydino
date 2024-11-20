class Dino {
    constructor() {
        this.x = 50;  
        this.y = canvas.height / 2; 
        this.width = 50;
        this.height = 50;
        this.gravity = 0.5;
        this.jumpStrength = -10;
        this.velocity = 0;
        this.lasers = [];  
        this.image = new Image(); 
        this.image.src = 'assets/images/dino.png'; 
    }

    jump() {
        this.velocity = this.jumpStrength;

        playRandomSound(jumpSounds, JUMPING_SOUNDS_VOLUME);
    }

    shootLaser() {
        const randomLaserImage = `assets/images/lasers/${this.getRandomLaserImage()}`;
        this.lasers.push(new Laser(this.x, this.y, randomLaserImage));

        playRandomSound(shootSounds, SHOOTING_SOUNDS_VOLUME);
    }

    getRandomLaserImage() {
        const laserIndex = Math.floor(Math.random() * 66) + 1; 
        return laserIndex < 10 ? `0${laserIndex}.png` : `${laserIndex}.png`;
    }

    update() {
        this.velocity += this.gravity;
        this.y += this.velocity;
    
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.velocity = 0;
            endGame(); 
        }
    
        if (this.y < 0) {
            this.y = 0; 
            this.velocity = 0; 
        }
    
        this.lasers.forEach(laser => laser.update());
    }
    


    draw() {
        // Draw the Dino using the sprite image
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
        this.x += this.speed;

        if (this.x > canvas.width) {
            removeFromArray(dino.lasers, this);
        }
    }

    draw() {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}
