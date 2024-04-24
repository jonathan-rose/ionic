import 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, sprite, radius, plasmaField) {
        super(scene, x, y, sprite);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.sprite = sprite;
        this.center = this.getCenter();
        this.shieldRadius = radius;
        this.defaultOrbitHoverDistance = 10;
        this.orbitHoverDistance = 10;
        this.currentAngle = 270;
        this.isLanding = false;
        this.movementSpeed = 2;
        this.plasmaField = plasmaField;
        this.powerbarCurrent = 0;
        this.powerbarMinimum = this.scene.powerbarMinimum;
        this.depleted = false;
        this.cooldownState = false;
        this.cooldownLength = 3000;
        this.flashRunning = false;
        this.flashLength = 200;

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

    update(powerbarCurrent) {
        this.powerbarCurrent = powerbarCurrent;

        if (this.cooldownState == false) {
            if (this.spaceKey.isDown && this.powerbarCurrent > 0 && this.depleted == false) {
                this.isLanding = true;
                this.setHover(0);
                this.plasmaField.startFiring(
                    Phaser.Math.RadToDeg(
                        Phaser.Math.Angle.Between(
                            512,
                            383,
                            this.x,
                            this.y
                        )
                    ));
            } else if (this.spaceKey.isUp || this.powerbarCurrent == 0 || this.powerbarCurrent < 0) {
                this.isLanding = false;
                this.setHover(this.defaultOrbitHoverDistance);
                if (this.plasmaField.isFiring && !this.plasmaField.isFiringFullScreen) {
                    this.plasmaField.stopFiring();
                    this.plasmaField.isFiring = false;
                }
            }
        }

        if (this.depleted == true) {
            this.cooldownState = true;
            this.cooldownTimer = this.scene.time.delayedCall(this.cooldownLength, () => {
                this.cooldownState = false;
            }, [], this);
            this.plasmaField.isDepleted = true;

            // turn off beam sound when running out of energy
            // @NOTE: we're not setting the hacky
            // beamFiringSoundPlaying boolean to false, as we want the
            // player to release space first.
            let s = this.scene.beamFiringSound;
            if (s && s.isPlaying) {
                s.stop();
            }
        }

        if (this.cooldownState == true && this.flashRunning == false) {
            this.flashRunning = true;
            this.flashTimer = this.scene.time.addEvent({
                delay: this.flashLength,
                callback: this.toggleTint,
                callbackScope: this,
                loop: true
            })
        }

        if (this.powerbarCurrent <= 0) {
            this.depleted = true;
        } else if (this.powerbarCurrent >= this.powerbarMinimum) {
            this.depleted = false;
            this.plasmaField.isDepleted = false;
        }

        if (this.cursors.left.isDown) {
            this.currentAngle -= this.movementSpeed;
        } else if (this.cursors.right.isDown) {
            this.currentAngle += this.movementSpeed;
        }

        this.updatePosition();

        this.rotation = Phaser.Math.DegToRad(this.currentAngle) - Math.PI / 2;
    }

    toggleTint() {
        if (this.cooldownState == true && this.powerbarCurrent < this.powerbarMinimum) {
            if (this.scene.powerbarBackground.tintTopLeft === 0xffffff) {
                this.scene.powerbarBackground.setTint(0xff0000);
            } else if (this.scene.powerbarBackground.tintTopLeft === 0xff0000) {
                this.scene.powerbarBackground.setTint(0xffffff);
            }
        } else if (this.cooldownState == false && this.powerbarCurrent >= this.powerbarMinimum) {
            this.flashTimer.remove();
            this.flashRunning = false;
            this.scene.powerbarBackground.clearTint();
        }
    }
}
