// Contents of src/pipes.js

class Tree {
    constructor() {
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - 200) + 100; // Random vertical position
        this.width = 50;
        this.height = 200;
        this.speed = 5;
        this.direction = Math.random() > 0.5 ? 1 : -1; // Random up or down movement
        this.image = new Image();
        this.image.src = 'assets/images/tree.png'; // Tree image
    }

    update() {
        // Move tree to the left
        this.x -= this.speed;

        // Move up and down
        this.y += this.direction * 2;

        // Reverse direction if it hits the top or bottom of the canvas
        if (this.y <= 0 || this.y + this.height >= canvas.height) {
            this.direction *= -1;
        }

        // Remove tree if it moves off-screen
        if (this.x + this.width < 0) {
            removeFromArray(obstacles, this);
        }
    }

    draw() {
        // Draw tree image
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

class Pterodactyl {
    constructor() {
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - 100); // Random vertical position
        this.width = 50;
        this.height = 50;
        this.speed = 8;
        this.image = new Image();
        this.image.src = 'assets/images/pterodactyl.png'; // Pterodactyl image
    }

    update() {
        // Move pterodactyl to the left
        this.x -= this.speed;

        // Remove pterodactyl if it moves off-screen
        if (this.x + this.width < 0) {
            removeFromArray(pterodactyls, this);
        }
    }

    draw() {
        // Draw pterodactyl image
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

class Meteor {
    constructor() {
        this.x = Math.random() * (canvas.width - 50); // Random horizontal position
        this.y = -50; // Start above the canvas
        this.width = 30;
        this.height = 30;
        this.speed = 7;
        this.image = new Image();
        this.image.src = 'assets/images/meteor.png'; // Meteor image
    }

    update() {
        // Meteor falls from the top of the canvas
        this.y += this.speed;

        // Remove meteor if it moves off-screen
        if (this.y > canvas.height) {
            removeFromArray(meteors, this);
        }
    }

    draw() {
        // Draw meteor image
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}
