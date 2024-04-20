import 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, sprite, radius) {
        super(scene, x, y, sprite);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.sprite = sprite;
        this.center = this.getCenter();
        this.shieldRadius = radius;
        this.orbitHoverDistance = 10;
        this.currentAngle = 270;
        this.isLanding = false;

        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.spaceKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.calculateOrbit();

        this.scene.physics.add.existing(this);
        this.scene.add.existing(this);
    }

    setHover(distance) {
        this.orbitHoverDistance = distance;
        this.calculateOrbit();
    }

    calculateOrbit() {
        this.orbitDistance = this.shieldRadius + (this.height / 2) + this.orbitHoverDistance;
    }

    updatePosition() {
        this.x = this.center.x + this.orbitDistance * Math.cos(Phaser.Math.DegToRad(this.currentAngle));
        this.y = this.center.y + this.orbitDistance * Math.sin(Phaser.Math.DegToRad(this.currentAngle));
    }

    update(time, delta) {
        if (this.spaceKey.isDown) {
            this.isLanding = true;
            this.setHover(0);
        } else if (this.spaceKey.isUp) {
            this.isLanding = false;
            this.setHover(10);
        }

        if (this.cursors.left.isDown) {
            this.currentAngle -= 1;
        } else if (this.cursors.right.isDown) {
            this.currentAngle += 1;
        }

        this.updatePosition();

        this.rotation = Phaser.Math.DegToRad(this.currentAngle) - Math.PI / 2;
    }
}