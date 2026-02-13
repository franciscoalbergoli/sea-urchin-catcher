// Game configuration and constants
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

// Game variables
let diver;
let seaUrchins;
let score = 0;
let lives = 3;
let scoreText;
let livesText;

function preload() {
    // Load assets
    this.load.image('diver', 'path/to/diver.png');
    this.load.image('seaUrchin', 'path/to/seaUrchin.png');
    this.load.image('kelp', 'path/to/kelp.png');
}

function create() {
    // Create diver
    diver = this.physics.add.sprite(400, 500, 'diver').setCollideWorldBounds(true);

    // Create sea urchins group
    seaUrchins = this.physics.add.group({
        key: 'seaUrchin',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });
    seaUrchins.children.iterate((urchin) => {
        urchin.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    // Scoring system
    scoreText = this.add.text(16, 16, 'Score: 0', { fontsize: '32px', fill: '#fff' });
    livesText = this.add.text(600, 16, 'Lives: 3', { fontsize: '32px', fill: '#fff' });

    // Collision detection
    this.physics.add.collider(diver, seaUrchins, hitUrchin, null, this);

    // Input events
    this.input.keyboard.on('keydown-LEFT', () => { diver.setVelocityX(-160); });
    this.input.keyboard.on('keydown-RIGHT', () => { diver.setVelocityX(160); });
    this.input.keyboard.on('keyup-LEFT', () => { diver.setVelocityX(0); });
    this.input.keyboard.on('keyup-RIGHT', () => { diver.setVelocityX(0); });
}

function update() {
    // Game update logic if needed
}

function hitUrchin(diver, urchin) {
    // Remove sea urchin
    urchin.setAlpha(0);
    score += 10;
    scoreText.setText('Score: ' + score);
    
    // Decrement lives
    lives -= 1;
    livesText.setText('Lives: ' + lives);
    
    if (lives <= 0) {
        // Game Over logic
        this.physics.pause();
        scoreText.setText('Game Over! Final Score: ' + score);
    }
}