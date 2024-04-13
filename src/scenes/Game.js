import { Scene } from 'phaser';

var keys;
var rectangle;
var graphics;
var coolometerCount;
var coolometerMax;

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

        this.coolometerBackground = this.add.image(725, 300, 'powerbar-background');
        this.coolometerForeground = this.add.image(725, 300, 'powerbar-foreground');
        this.coolometerForeground.setDepth(3);

        this.addCoolometer();
    }

    update () {
        if (coolometerCount < coolometerMax){
            coolometerCount = Math.min(coolometerMax, coolometerCount + 0.6);
        }
        else if (coolometerCount > 0){
            coolometerCount = Math.max(0, coolometerCount - 3);
        }

         // update coolometer
        graphics.clear();
        rectangle.setSize(100, coolometerCount);
        rectangle.y = 600 - coolometerCount;
        graphics.fillRectShape(rectangle);
    }

    addCoolometer() {
        graphics = this.add.graphics({ fillStyle: { color: 0x00ffff }});
        rectangle = new Phaser.Geom.Rectangle(
            this.coolometerForeground.getTopLeft().x,
            this.coolometerForeground.getTopLeft().y,
            this.coolometerForeground.width,
            this.coolometerForeground.height
            );
        coolometerCount = 0;
        coolometerMax = 600;

        const shape = this.make.graphics();
        shape.fillStyle(0xffffff);
        shape.beginPath();
        shape.fillRoundedRect(
            rectangle.x + 2,
            rectangle.y + 8,
            rectangle.width - 4,
            rectangle.height - 16,
            45
        );

        const mask = shape.createGeometryMask();
        graphics.setMask(mask);
    }


}
