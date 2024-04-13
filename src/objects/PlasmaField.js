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
        this.isFiring = false;

        this.tendrils = [];
        for (let i = 0; i < 30; i++) {
            this.tendrils.push(new Tendril(this.scene));
        }
    }

    update() {
        this.tendrils.forEach((t) => {
            t.update();
        });
    }

    draw() {
        this.graphics.clear();

        if (this.isFiring) {
            this.drawShield();
            this.drawTendrils();
        } else {
            this.drawTendrils();
            this.drawShield();
        }
    }

    drawTendrils() {
        this.tendrils.forEach((t) => {
            this.drawGradientCurve(t.curve, 0xE54489, 20);
            this.drawGradientCurve(t.curve, 0xE54489, 20, true);

            this.graphics.lineStyle(10, 0x3335D7, 1);
            t.curve.draw(this.graphics);

            this.graphics.lineStyle(2, 0xffffff, 1);
            t.curve.draw(this.graphics);
        });
    }

    drawShield() {
        // black ring to cut off the end of the tendrils
        this.graphics.lineStyle(20, 0x0, 1);
        this.graphics.beginPath();
        this.graphics.arc(512, 383, 302, 0, Phaser.Math.DegToRad(360));
        this.graphics.closePath();
        this.graphics.strokePath();

        // draw the shield as a pink ring
        this.graphics.lineStyle(2, 0xE54489, 1);
        this.graphics.beginPath();
        this.graphics.arc(512, 383, 293, 0, Phaser.Math.DegToRad(360));
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

    // @TODO: when we do this we should check which direction the tendril should travel
    // @TODO: we should make the wiggles straighter when firing so the tendrils will easily fit through our cannon aperture.
    startFiring(angle) {
        this.tendrils.forEach((t) => {
            t.previousRotation = t.rotation;
            t.previousRotationSpeed = t.rotationSpeed;
            t.rotationSpeed = 0;
            t.rotationSpeedTween.pause();
            this.scene.tweens.add({
                targets: t,
                rotation: angle,
                duration: 300,
                onComplete: (tween, targets, field) => {
                    field.isFiring = true;
                    targets[0].radius = 700;
                },
                onCompleteParams: [this]
            });
        });
    }

    // @TODO: when we do this we should check which direction the tendril should travel
    stopFiring() {
        this.isFiring = false;
        this.tendrils.forEach((t) => {
            t.radius = 300;
            this.scene.tweens.add({
                targets: t,
                rotation: t.previousRotation,
                duration: 300,
                onComplete: (tween, targets) => {
                    targets[0].rotationSpeed = targets[0].previousRotationSpeed;
                    targets[0].rotationSpeedTween.resume();
                }
            });
        });
    }
}