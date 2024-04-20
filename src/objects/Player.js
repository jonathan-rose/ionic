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
        this.orbitDistance = this.shieldRadius + (this.height / 2) + this.orbitHoverDistance;
        this.currentAngle = 270;
        this.isLanding = false;

        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.spaceKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.scene.physics.add.existing(this);
        this.scene.add.existing(this);
    }

    moveDown() {
        this.scene.tweens.add({
            targets: this,
            y: this.y + 10,
            duration: 500,
            ease: 'Linear',
            onComplete: () => { console.log("Tween complete") }
        });
    }

    moveUp() {
        this.scene.tweens.add({
            targets: this,
            y: this.y - 10,
            duration: 500,
            ease: 'Linear',
        });
    }

    update(time, delta) {
        if (this.spaceKey.isDown) {
            this.isLanding = true;
            this.updatePosition;
        } else if (this.spaceKey.isUp) {
            this.isLanding = false;
            this.updatePosition;
        }

        if (this.cursors.left.isDown) {
            this.currentAngle -= 1;
            this.updatePosition();
        } else if (this.cursors.right.isDown) {
            this.currentAngle += 1;
            this.updatePosition();
        }

        // this.x = this.center.x + this.orbitDistance * Math.cos(Phaser.Math.DegToRad(this.currentAngle));
        // this.y = this.center.y + this.orbitDistance * Math.sin(Phaser.Math.DegToRad(this.currentAngle));
        this.rotation = Phaser.Math.DegToRad(this.currentAngle) - Math.PI / 2;
    }

    updatePosition () {
        if (this.isLanding == false) {
            this.x = this.center.x + this.orbitDistance * Math.cos(Phaser.Math.DegToRad(this.currentAngle));
            this.y = this.center.y + this.orbitDistance * Math.sin(Phaser.Math.DegToRad(this.currentAngle));
        }

        if (this.isLanding == true) {
            this.x = this.center.x + (this.orbitDistance - this.orbitHoverDistance) * Math.cos(Phaser.Math.DegToRad(this.currentAngle));
            this.y = this.center.y + (this.orbitDistance - this.orbitHoverDistance) * Math.sin(Phaser.Math.DegToRad(this.currentAngle));
        }

    }
}