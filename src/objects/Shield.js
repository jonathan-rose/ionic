import 'phaser';

export default class Shield extends Phaser.GameObjects.Arc {
    constructor(scene, x, y) {
        super(scene, x, y);
        this.scene = scene;
        this.x = x;
        this.y = y;

        this.setStrokeStyle(1, 0xff0000);
        this.setOrigin(0.5, 1);

        this.scene.add.existing(this);
    }
}