import 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, sprite) {
        super(scene, x, y, sprite);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.sprite = sprite;

        this.scene.add.existing(this);
    }

        setLocation(x, y) {
        this.x = x;
        this.y = y;
    }
}