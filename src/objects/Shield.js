import 'phaser';

export default class Shield extends Phaser.GameObjects.Arc {
    constructor(scene, x, y, radius) {
        super(scene, x, y);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.center = this.getCenter();

        // this.setStrokeStyle(1, 0xff0000);
        this.isStroked = false;

        this.scene.add.existing(this);
    }
}