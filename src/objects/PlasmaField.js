import 'phaser';
import Tendril from './Tendril';
import Util from '../util';

/**
 * This class contains the plasma tendrils and is responsible for
 * managing them.
 *
 * Each tendril is a Bezier curve that starts in the middle of the 
 * screen and projects outward at some angle.
 */
export default class PlasmaField extends Phaser.GameObjects.Container {

    constructor(scene) {
        super(scene);
        this.scene = scene;
        this.graphics = this.scene.add.graphics();
        this.shieldRadius = 200;
        this.isFiring = false;
        this.isDepleted = false;
        this.isFiringFullScreen = false;

        this.body = new Phaser.Physics.Arcade.StaticBody(this.scene.physics.world, this);
        this.body.x = 0;
        this.body.y = 0;
        this.body.width = 1024;
        this.body.height = 768;

        this.tendrils = [];
        for (let i = 0; i < 30; i++) {
            this.tendrils.push(new Tendril(this.scene, this.shieldRadius));
        }
    }

    update() {
        if (!this.scene.gameEnding) {
            this.tendrils.forEach((t) => {
                t.update();
            });
        }
    }

    draw() {
        this.graphics.clear();

        if (this.isFiringFullScreen || this.bigTendrilOverShieldHack) {
            this.drawShieldOuter();
            this.drawShieldInner();
            this.drawTendrils();
        } else if (this.isFiring) {
            this.drawShieldInner();
            this.drawTendrils();
        } else {
            this.drawTendrils();
            this.drawShieldOuter();
            this.drawShieldInner();
        }
    }

    drawTendrils() {
        if (this.isFiringFullScreen || !this.isDepleted) {
            this.tendrils.forEach((t) => {
                this.drawGradientCurve(t.curve, 0xE54489, 18);
                this.drawGradientCurve(t.curve, 0xE54489, 18, true);

                this.graphics.lineStyle(8, 0x3335D7, 1);
                t.curve.draw(this.graphics);

                this.graphics.lineStyle(2, 0xffffff, 1);
                t.curve.draw(this.graphics);
            });
        }
    }

    drawShieldOuter() {
        if (!this.isFiringFullScreen) {
            // black ring to cut off the end of the tendrils
            this.graphics.lineStyle(20, 0x0, 1);
            this.graphics.beginPath();
            this.graphics.arc(512, 383, this.shieldRadius * 1.007, 0, Phaser.Math.DegToRad(360));
            this.graphics.closePath();
            this.graphics.strokePath();
        }

        if (this.isFiringFullScreen || !this.isDepleted) {
            // draw the shield as a pink ring
            this.graphics.lineStyle(3, 0xE54489, 1);
            this.graphics.beginPath();
            this.graphics.arc(512, 383, this.shieldRadius * 0.96, 0, Phaser.Math.DegToRad(360));
            this.graphics.closePath();
            this.graphics.strokePath();

            // inner ring
            this.graphics.lineStyle(3, 0xE54489, 1);
            this.graphics.beginPath();
            this.graphics.arc(512, 383, 40, 0, Phaser.Math.DegToRad(360));
            this.graphics.closePath();
            this.graphics.strokePath();
        }
    }

    drawShieldInner() {
        this.graphics.lineStyle(3, 0xE54489, 1);
        this.graphics.beginPath();
        this.graphics.arc(512, 383, 40, 0, Phaser.Math.DegToRad(360));
        this.graphics.closePath();
        this.graphics.strokePath();
    }

    drawGradientCurve(curve, color, thickness, reversed = false) {
        let n = 100;
        let points = curve.getPoints(n);

        for (let i = 0; i < n / 5; i++) {
            let alpha = 1 - i / (n / 5);
            this.graphics.lineStyle(thickness, color, alpha);
            this.graphics.beginPath();
            if (reversed) {
                this.graphics.moveTo(points[n - i].x, points[n - i].y);
                this.graphics.lineTo(points[n - (i + 1)].x, points[n - (i + 1)].y);
            } else {
                this.graphics.moveTo(points[i].x, points[i].y);
                this.graphics.lineTo(points[i + 1].x, points[i + 1].y);
            }
            this.graphics.closePath();
            this.graphics.strokePath();
        }
    }

    startFiring(angle) {
        if (angle < 0) {
            this.firingAngle = angle + 360;
        } else {
            this.firingAngle = angle;
        }

        this.tendrils.forEach((t) => {
            t.previousRotationSpeed = t.rotationSpeed;
            t.rotationSpeed = 0;
            t.rotationSpeedTween.pause();

            // find the shortest distance between the two angles
            let delta = Util.mod((this.firingAngle - t.rotation + 180), 360) - 180;
            if (delta < -180) {
                delta += 360;
            }

            // make the delta into a relative tween value string
            let tweenDelta = "+=" + delta;
            if (delta < 0) {
                tweenDelta = "-=" + (0 - delta);
            }

            this.scene.tweens.add({
                targets: t,
                rotation: tweenDelta,
                duration: 100,
                onComplete: (tween, targets, field) => {
                    targets[0].radius = 700;
                    // only need one tendril to do this bit
                    if (!field.isFiring) {
                        field.isFiring = true;
                        if (!field.scene.beamFiringSoundPlaying) {
                            field.scene.beamFiringSound.play();
                            field.scene.beamFiringSoundPlaying = true;
                        }
                    }
                },
                onCompleteParams: [this]
            });
        });
    }

    stopFiring() {
        // turn off beamFiring sound
        let s = this.scene.beamFiringSound;
        if (s && s.isPlaying) {
            s.stop();
        }
        this.scene.beamFiringSoundPlaying = false;
        this.isFiring = false;
        this.bigTendrilOverShieldHack = true;

        this.scene.time.addEvent({
            delay: 10,
            callback: () => {
                this.bigTendrilOverShieldHack = false;
                this.tendrils.forEach((t) => {
                    t.radius = this.shieldRadius;
                });
            },
            callbackScope: this,
        });

        this.tendrils.forEach((t) => {
            this.scene.tweens.add({
                targets: t,
                rotation: "+=" + Util.randBetween(-180, 180),
                duration: 300,
                onComplete: (tween, targets) => {
                    targets[0].rotationSpeed = targets[0].previousRotationSpeed;
                    targets[0].rotationSpeedTween.resume();
                }
            });
        });
    }

    /**
     * Collision detection function between the plasma field and
     * enemies.
     *
     * All the tendrils are at the same angle while firing, and
     * all the enemies move from their starting position directly
     * inwards, so we only need to check that the enemy started
     * withing a few degrees of the first tendrils `rotation`.
     */
    collisionProcessor(plasmaField, enemy) {
        if (!plasmaField.isFiring) {
            return false;
        }

        // sometimes when firing to the right (firingAngle ~= 0), some
        // ships we want to destroy might be in the range 0-15 and some
        // might be 345-360.
        if (plasmaField.firingAngle < 15) {
            // also get stuff below 360
            return (enemy.spawnAngle < plasmaField.firingAngle + 15
                || enemy.spawnAngle > 360 - (15 - plasmaField.firingAngle));
        } else if (plasmaField.firingAngle >= 345) {
            // also get stuff above 0
            return (enemy.spawnAngle > plasmaField.firingAngle - 15
                || enemy.spawnAngle < 15 - (360 - plasmaField.firingAngle));
        } else {
            // normal cone which doesn't cross 0 degrees
            return (enemy.spawnAngle > plasmaField.firingAngle - 15
                && enemy.spawnAngle < plasmaField.firingAngle + 15);
        }
    }

    fullScreenTendrilsOn(){
        this.isFiringFullScreen = true;
        this.tendrils.forEach((t) => {
            this.scene.tweens.add({
                targets: t,
                duration: 1800,
                radius: 700
            });
        });
    }

    fullScreenTendrilsOff(){
        this.isFiring = false;
        this.isFiringFullScreen = false;
        this.tendrils.forEach((t) => {
            t.radius = 200;
        });
    }
}
