const LASER_COUNT = 66;
const laserImages = [];

const dinoImage = new Image();
dinoImage.src = 'assets/images/dino.png';

class Dino {
    constructor() {
        this.width = 56;
        this.height = 56;
        this.x = Math.max(40, canvas.width * 0.12);
        this.y = canvas.height / 2 - this.height / 2;
        this.gravity = 1500;          // px/s^2
        this.jumpStrength = -520;     // px/s
        this.velocity = 0;
        this.maxVelocity = 900;
        this.lasers = [];
        this.shootCooldown = 0;
        this.shootInterval = 0.22;    // seconds between shots
        this.image = dinoImage;
        this.alive = true;
        this.tilt = 0;
    }

    jump() {
        if (!this.alive) return;
        this.velocity = this.jumpStrength;
        Game.playRandomSound('jump');
    }

    shootLaser() {
        if (!this.alive || this.shootCooldown > 0) return;
        const imgIndex = Math.floor(Math.random() * laserImages.length);
        const img = laserImages[imgIndex] || null;
        this.lasers.push(new Laser(this.x + this.width * 0.6, this.y + this.height * 0.3, img));
        this.shootCooldown = this.shootInterval;
        Game.playRandomSound('shoot');
    }

    update(dt) {
        if (this.shootCooldown > 0) this.shootCooldown -= dt;

        this.velocity += this.gravity * dt;
        if (this.velocity > this.maxVelocity) this.velocity = this.maxVelocity;
        this.y += this.velocity * dt;

        const targetTilt = clamp(this.velocity / 600, -0.5, 1.0);
        this.tilt += (targetTilt - this.tilt) * Math.min(1, dt * 8);

        if (this.y + this.height >= canvas.height) {
            this.y = canvas.height - this.height;
            this.velocity = 0;
            if (this.alive) {
                this.alive = false;
                Game.endGame();
            }
        }
        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }

        for (let i = this.lasers.length - 1; i >= 0; i--) {
            this.lasers[i].update(dt);
            if (this.lasers[i].x > canvas.width + 80) this.lasers.splice(i, 1);
        }
    }

    draw(ctx) {
        for (const laser of this.lasers) laser.draw(ctx);

        ctx.save();
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        ctx.translate(cx, cy);
        ctx.rotate(this.tilt * 0.4);
        if (this.image.complete && this.image.naturalWidth > 0) {
            ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
        } else {
            ctx.fillStyle = '#3ddc84';
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }
        ctx.restore();
    }
}

class Laser {
    constructor(x, y, image) {
        this.width = 88;
        this.height = 88;
        this.x = x;
        this.y = y - this.height / 2;
        this.speed = 780;
        this.image = image;
    }

    update(dt) {
        this.x += this.speed * dt;
    }

    draw(ctx) {
        if (this.image && this.image.complete && this.image.naturalWidth > 0) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = '#ffeb3b';
            ctx.fillRect(this.x + 20, this.y + 38, this.width - 40, 12);
        }
    }
}
