const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 400,
        height: 600,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false,
        },
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
    },
};

const game = new Phaser.Game(config);

let diver;
let urchins;
let lives = 3;
let score = 0;
let kelpGroup;
let livesDisplay;
let scoreDisplay;
let gameOverText;
let isGameOver = false;
let gameScene;

function preload() {
    // Graphics will be created dynamically
}

function create() {
    gameScene = this;
    
    // Create beautiful Tasmanian ocean background
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Sky reflection (upper part - lighter)
    graphics.fillStyle(0x87ceeb, 1);
    graphics.fillRect(0, 0, 400, 80);
    
    // Ocean surface
    graphics.fillStyle(0x1b5e90, 1);
    graphics.fillRect(0, 80, 400, 520);
    
    // Darker deep ocean
    graphics.fillStyle(0x0a3d62, 1);
    graphics.fillRect(0, 350, 400, 250);
    
    // Add some reef/rock texture for Tasmanian feel
    graphics.fillStyle(0x8b7355, 0.4);
    for (let i = 0; i < 12; i++) {
        graphics.fillRect(
            Phaser.Math.Between(0, 400),
            Phaser.Math.Between(420, 600),
            Phaser.Math.Between(30, 80),
            Phaser.Math.Between(15, 40)
        );
    }
    
    // Bubbles
    graphics.fillStyle(0xffffff, 0.2);
    for (let i = 0; i < 20; i++) {
        graphics.fillCircle(
            Phaser.Math.Between(0, 400),
            Phaser.Math.Between(100, 600),
            Phaser.Math.Between(1, 3)
        );
    }
    
    graphics.generateTexture('ocean-bg', 400, 600);
    graphics.destroy();
    
    this.add.image(200, 300, 'ocean-bg');
    
    // Create diver sprite
    createDiver(this);
    
    // Create urchin sprite
    createUrchin(this);
    
    // Create handfish sprite
    createHandfish(this);
    
    // Create kelp sprite
    createKelp(this);
    
    // Create diver (player)
    diver = this.physics.add.sprite(200, 500, 'diver');
    diver.setBounce(0.1);
    diver.setCollideWorldBounds(true);
    diver.setDrag(0.95);
    diver.setDepth(10);
    
    // Create urchins group
    urchins = this.physics.add.group();
    
    // Create kelp group (visual only)
    kelpGroup = this.add.group();
    
    // Add initial kelp
    addKelpToScene(this);
    
    // Setup input - touch and mouse
    this.input.on('pointermove', (pointer) => {
        if (!isGameOver && diver) {
            const distance = pointer.x - diver.x;
            diver.setVelocityX(distance * 0.4);
        }
    });
    
    // Spawn urchins periodically
    this.time.addEvent({
        delay: 700,
        callback: () => {
            if (!isGameOver) {
                spawnUrchin(this);
            }
        },
        loop: true,
    });
    
    // Setup collisions
    this.physics.add.overlap(diver, urchins, catchUrchin, null, this);
    
    // UI Display
    scoreDisplay = this.add.text(20, 20, `Score: ${score}`, {
        fontSize: '28px',
        fill: '#ffffff',
        fontFamily: 'Arial Bold',
        stroke: '#000000',
        strokeThickness: 3,
    });
    scoreDisplay.setDepth(100);
    
    livesDisplay = this.add.text(200, 20, '', {
        fontSize: '20px',
        fill: '#ffffff',
        fontFamily: 'Arial',
        align: 'center',
    });
    livesDisplay.setOrigin(0.5, 0);
    livesDisplay.setDepth(100);
    
    updateLivesDisplay(this);
}

function update() {
    // Remove off-screen urchins that weren't caught
    urchins.children.entries.forEach((urchin) => {
        if (urchin && urchin.y > 620) {
            if (urchin.active) {
                urchin.destroy();
                loseLife(gameScene);
            }
        }
    });
}

function createDiver(scene) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    
    // Head
    graphics.fillStyle(0xf4a460, 1);
    graphics.fillCircle(15, 12, 7);
    
    // Body/Wetsuit
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.fillRect(12, 20, 6, 12);
    
    // Arms
    graphics.fillStyle(0xf4a460, 1);
    graphics.fillRect(6, 22, 5, 10);
    graphics.fillRect(19, 22, 5, 10);
    
    // Fins (feet)
    graphics.fillStyle(0xff9500, 1);
    graphics.fillTriangle(10, 33, 8, 38, 12, 38);
    graphics.fillTriangle(20, 33, 18, 38, 22, 38);
    
    // Catching bag (net) - large red circle below
    graphics.fillStyle(0xff4444, 0.9);
    graphics.fillCircle(15, 45, 12);
    graphics.fillStyle(0xff6666, 0.7);
    graphics.fillRect(10, 45, 10, 12);
    
    graphics.generateTexture('diver', 30, 57);
    graphics.destroy();
}

function createUrchin(scene) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    
    // Main body
    graphics.fillStyle(0x8b008b, 1);
    graphics.fillCircle(10, 10, 8);
    
    // Spines around the urchin
    graphics.fillStyle(0x4b0082, 1);
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const x = 10 + Math.cos(angle) * 10;
        const y = 10 + Math.sin(angle) * 10;
        graphics.fillTriangle(10, 10, x - 1, y - 1, x + 1, y + 1);
    }
    
    graphics.generateTexture('urchin', 20, 20);
    graphics.destroy();
}

function createHandfish(scene) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    
    // Red handfish body
    graphics.fillStyle(0xff4444, 1);
    graphics.fillEllipse(8, 6, 10, 7);
    
    // Eye
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(12, 5, 2);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(12, 5, 1);
    
    // Fins
    graphics.fillStyle(0xff6666, 1);
    graphics.fillTriangle(4, 6, 1, 4, 2, 9);
    graphics.fillTriangle(12, 6, 12, 2, 15, 4);
    
    graphics.generateTexture('handfish', 16, 12);
    graphics.destroy();
}

function createKelp(scene) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    
    // Kelp strand - wavy
    graphics.fillStyle(0x2d5016, 0.9);
    graphics.fillRect(6, 0, 8, 40);
    
    // Some texture
    graphics.fillStyle(0x1a3009, 0.7);
    graphics.fillRect(7, 5, 6, 3);
    graphics.fillRect(7, 15, 6, 3);
    graphics.fillRect(7, 25, 6, 3);
    graphics.fillRect(7, 35, 6, 3);
    
    graphics.generateTexture('kelp-segment', 20, 40);
    graphics.destroy();
}

function spawnUrchin(scene) {
    const x = Phaser.Math.Between(40, 360);
    const urchin = urchins.create(x, -15, 'urchin');
    
    // Increase speed as score increases
    const speed = 150 + (score / 10) * 20;
    urchin.setVelocityY(speed);
    urchin.setBounce(0.1);
    urchin.setDrag(0.01);
}

function catchUrchin(diver, urchin) {
    urchin.destroy();
    score += 10;
    scoreDisplay.setText(`Score: ${score}`);
    
    // Visual feedback - flash
    diver.setTint(0x44ff44);
    gameScene.time.delayedCall(100, () => {
        if (diver) diver.clearTint();
    });
    
    // Grow kelp every 30 points
    if (score > 0 && score % 30 === 0) {
        addKelpToScene(gameScene);
    }
}

function addKelpToScene(scene) {
    const x = Phaser.Math.Between(50, 350);
    let y = 580;
    let segmentCount = 3 + Math.floor(score / 60);
    
    for (let i = 0; i < segmentCount; i++) {
        const kelpSegment = scene.add.sprite(x, y, 'kelp-segment');
        kelpSegment.setDepth(1);
        kelpGroup.add(kelpSegment);
        y -= 38;
    }
}

function loseLife(scene) {
    lives--;
    updateLivesDisplay(scene);
    
    // Visual feedback
    diver.setTint(0xff0000);
    scene.time.delayedCall(300, () => {
        if (diver) diver.clearTint();
    });
    
    if (lives <= 0) {
        endGame(scene);
    }
}

function updateLivesDisplay(scene) {
    let livesText = '';
    for (let i = 0; i < lives; i++) {
        livesText += '❤ ';
    }
    livesDisplay.setText(livesText);
}

function endGame(scene) {
    isGameOver = true;
    urchins.clear(true, true);
    diver.setActive(false);
    diver.setVisible(false);
    
    // Game over screen
    const gameOverBg = scene.add.rectangle(200, 300, 400, 200, 0x000000, 0.8);
    gameOverBg.setDepth(200);
    
    gameOverText = scene.add.text(200, 250, 'GAME OVER', {
        fontSize: '48px',
        fill: '#ff0000',
        fontFamily: 'Arial Bold',
        align: 'center',
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setDepth(201);
    
    const finalScore = scene.add.text(200, 330, `Final Score: ${score}`, {
        fontSize: '32px',
        fill: '#ffffff',
        fontFamily: 'Arial',
        align: 'center',
    });
    finalScore.setOrigin(0.5);
    finalScore.setDepth(201);
    
    const restartText = scene.add.text(200, 390, 'Restarting in 3 seconds...', {
        fontSize: '16px',
        fill: '#ffff00',
        fontFamily: 'Arial',
        align: 'center',
    });
    restartText.setOrigin(0.5);
    restartText.setDepth(201);
    
    scene.time.delayedCall(3000, () => {
        scene.scene.restart();
    });
}