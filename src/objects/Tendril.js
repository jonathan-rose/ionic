import 'phaser';
import Util from '../util';

/**
 * This class simulates a single tendril of plasma energy.
 * 
 * A tendril is a Bezier curve, starting at the center of the screen
 * and going outward to it's `radius` in the direction defined by it's
 * `rotation`.
 *
 * This class basically just managed the curve, the rendering of the
 * tendrils is done by the PlasmaField class.
 */

export default class Tendril {

    constructor (scene, radius) {
        this.scene = scene;
        this.curve = [];
        this.radius = radius;
        this.innerRadius = 65;
        this.rotation = Util.randBetween(0, 360);
        this.rotationSpeed = Util.randNth([-0.5, 0.5]);
        this.p1rotationOffset = -20;
        this.p2rotationOffset = 20;
        this.p1radiusMultiplier = 0.8;
        this.p2radiusMultiplier = 0.6;

        this.recalculateCurve();
        this.addTweens();
    }

    update() {
        this.rotation = (this.rotation + this.rotationSpeed) % 360;
        this.recalculateCurve();
    }

    recalculateCurve() {
        this.start = Util.offsetByTrig(new Phaser.Math.Vector2(512, 384), this.rotation, this.innerRadius);
        this.end = Util.offsetByTrig(this.start, this.rotation, (this.radius - this.innerRadius));
        this.p1rotation = this.rotation + this.p1rotationOffset;
        this.p2rotation = this.rotation + this.p2rotationOffset;
        this.p1radius = (this.radius - this.innerRadius) * this.p1radiusMultiplier;
        this.p2radius = (this.radius - this.innerRadius) * this.p2radiusMultiplier;
        
        this.curve = new Phaser.Curves.CubicBezier(
            this.start,
            Util.offsetByTrig(this.start, this.p1rotation, this.p1radius),
            Util.offsetByTrig(this.start, this.p2rotation, this.p2radius),
            this.end
        );
    }

    // @TODO: make these more dynamic and random
    addTweens() {
        this.scene.tweens.add({
            targets: this,
            p1rotationOffset: "+=40",
            yoyo: true,
            repeat: -1,
            duration: Util.randBetween(500, 600)
        });

        this.scene.tweens.add({
            targets: this,
            p2rotationOffset: "-=40",
            yoyo: true,
            repeat: -1,
            duration: Util.randBetween(500, 600)
        });

        this.scene.tweens.add({
            targets: this,
            p1radiusMultiplier: "-=0.6",
            yoyo: true,
            repeat: -1,
            duration: Util.randBetween(700, 800)
        });

        this.scene.tweens.add({
            targets: this,
            p2radiusMultiplier: "+=0.4",
            yoyo: true,
            repeat: -1,
            duration: Util.randBetween(700, 800)
        });

        this.rotationSpeedTween = this.scene.tweens.add({
            targets: this,
            rotationSpeed: "-=" + (this.rotationSpeed * Util.randBetween(0.3, 0.8)),
            yoyo: true,
            repeat: -1,
            duration: Util.randBetween(800, 900),
            delay: Util.randBetween(0, 400)
        });        
    }
}
