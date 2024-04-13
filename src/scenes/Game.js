import { Scene } from 'phaser';

var rectangle;
var graphics;
var powerbarCount;
var powerbarMax;

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.cameras.main.setBackgroundColor(0x00ff00);

        this.add.image(512, 384, 'background').setAlpha(0.5);

        this.powerbarBackground = this.add.image(950, 400, 'powerbar-background');
        this.powerbarForeground = this.add.image(950, 400, 'powerbar-foreground');
        this.powerbarForeground.setDepth(3);

        this.addPowerbar();
    }

    update () {
        if (powerbarCount < powerbarMax){
            powerbarCount = Math.min(powerbarMax, powerbarCount + 0.6);
        }
        else if (powerbarCount > 0){
            powerbarCount = Math.max(0, powerbarCount - 3);
        }

         // update coolometer
        graphics.clear();
        rectangle.setSize(this.powerbarForeground.width, powerbarCount);
        rectangle.y = this.powerbarForeground.getBottomLeft().y - powerbarCount;
        graphics.fillRectShape(rectangle);
    }

    addPowerbar() {
        graphics = this.add.graphics({ fillStyle: { color: 0x00ffff }});
        rectangle = new Phaser.Geom.Rectangle(
            this.powerbarForeground.getTopLeft().x,
            this.powerbarForeground.getTopLeft().y,
            this.powerbarForeground.width,
            this.powerbarForeground.height
            );
        powerbarCount = 0;
        powerbarMax = 600;

        const shape = this.make.graphics();
        shape.fillStyle(0xffffff);
        shape.beginPath();
        shape.fillRoundedRect(
            rectangle.x,
            rectangle.y,
            rectangle.width,
            rectangle.height,
            this.powerbarForeground.width/2
        );

        const mask = shape.createGeometryMask();
        graphics.setMask(mask);
    }


}
