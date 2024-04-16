import 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, sprite, radius) {
        super(scene, x, y, sprite);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.sprite = sprite;
        this.center = this.getCenter();
        this.radius = radius + (this.height / 2);
        this.currentAngle = 0;

        this.scene.physics.add.existing(this);
        this.scene.add.existing(this);        
    }

    update (time, delta) {
        this.x = this.center.x + this.radius * Math.cos(Phaser.Math.DegToRad(this.currentAngle));
        this.y = this.center.y + this.radius * Math.sin(Phaser.Math.DegToRad(this.currentAngle));
    }

        setLocation(x, y) {
        this.x = x;
        this.y = y;
    }
}