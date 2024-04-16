import 'phaser';

export default class Shield extends Phaser.GameObjects.Arc {
    constructor(scene, x, y) {
        super(scene, x, y);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.center = this.getCenter();

        this.setStrokeStyle(1, 0xff0000);
        this.setX(this.x);
        this.setY(this.y);

        this.scene.add.existing(this);
    }
}