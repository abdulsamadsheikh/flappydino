const treeImage = new Image();
treeImage.src = 'assets/images/tree.png';

const meteorImage = new Image();
meteorImage.src = 'assets/images/meteor.png';

const pterodactylImage = new Image();
pterodactylImage.src = 'assets/images/pterodactyl.png';

class Tree {
    constructor(speed) {
        this.width = clamp(canvas.width * 0.06, 42, 70);
        this.height = clamp(canvas.height * 0.32, 160, 260);
        this.x = canvas.width + this.width;
        this.y = Math.random() * (canvas.height - this.height - 80) + 40;
        this.speed = speed;
        this.direction = Math.random() > 0.5 ? 1 : -1;
        this.vy = this.direction * (60 + Math.random() * 60);
        this.image = treeImage;
    }

    update(dt) {
        this.x -= this.speed * dt;
        this.y += this.vy * dt;
        if (this.y <= 0) { this.y = 0; this.vy = Math.abs(this.vy); }
        if (this.y + this.height >= canvas.height) {
            this.y = canvas.height - this.height;
            this.vy = -Math.abs(this.vy);
        }
    }

    isOffscreen() { return this.x + this.width < -10; }

    draw(ctx) {
        if (this.image.complete && this.image.naturalWidth > 0) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = '#2e7d32';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

class Pterodactyl {
    constructor(speed) {
        this.width = clamp(canvas.width * 0.06, 44, 70);
        this.height = this.width;
        this.x = canvas.width + this.width;
        this.y = Math.random() * (canvas.height - this.height - 40) + 20;
        this.speed = speed * 1.25;
        this.bobAmp = 18 + Math.random() * 14;
        this.bobFreq = 1.6 + Math.random() * 1.0;
        this.bobBaseY = this.y;
        this.t = Math.random() * Math.PI * 2;
        this.image = pterodactylImage;
    }

    update(dt) {
        this.x -= this.speed * dt;
        this.t += dt * this.bobFreq;
        this.y = this.bobBaseY + Math.sin(this.t) * this.bobAmp;
    }

    isOffscreen() { return this.x + this.width < -10; }

    draw(ctx) {
        if (this.image.complete && this.image.naturalWidth > 0) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = '#b71c1c';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

class Meteor {
    constructor(speed) {
        this.width = clamp(canvas.width * 0.04, 28, 50);
        this.height = this.width;
        this.x = Math.random() * canvas.width * 0.7 + canvas.width * 0.3;
        this.y = -this.height;
        this.speedY = 380 + Math.random() * 160 + speed * 0.2;
        this.speedX = -(420 + speed * 0.6);
        this.image = meteorImage;
        this.rot = 0;
    }

    update(dt) {
        this.x += this.speedX * dt;
        this.y += this.speedY * dt;
        this.rot += dt * 6;
    }

    isOffscreen() {
        return this.y > canvas.height + 40 || this.x + this.width < -20;
    }

    draw(ctx) {
        if (this.image.complete && this.image.naturalWidth > 0) {
            ctx.save();
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(this.rot);
            ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
        } else {
            ctx.fillStyle = '#ff5722';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}
