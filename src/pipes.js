class Tree {
    constructor() {
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - 200) + 100; 
        this.width = 50;
        this.height = 200;
        this.speed = 5;
        this.direction = Math.random() > 0.5 ? 1 : -1; 
        this.image = new Image();
        this.image.src = 'assets/images/tree.png'; 
    }

    update() {
        this.x -= this.speed;

        this.y += this.direction * 2;

        if (this.y <= 0 || this.y + this.height >= canvas.height) {
            this.direction *= -1;
        }

        if (this.x + this.width < 0) {
            removeFromArray(obstacles, this);
        }
    }

    draw() {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

class Pterodactyl {
    constructor() {
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - 100);
        this.width = 50;
        this.height = 50;
        this.speed = 8;
        this.image = new Image();
        this.image.src = 'assets/images/pterodactyl.png'; 
    }

    update() {
        this.x -= this.speed;

        if (this.x + this.width < 0) {
            removeFromArray(pterodactyls, this);
        }
    }

    draw() {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

class Meteor {
    constructor() {
        this.x = canvas.width;                 
        this.y = -50;                          
        this.width = 30;
        this.height = 30;
        this.speedY = 7;                        
        this.speedX = -10;                     
        this.image = new Image();
        this.image.src = 'assets/images/meteor.png'; 
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX;

        if (this.y > canvas.height || this.x + this.width < 0) {
            removeFromArray(meteors, this);     
        }
    }

    draw() {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}