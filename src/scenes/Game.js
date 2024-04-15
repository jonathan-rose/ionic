import { Scene } from 'phaser';

var rectanglePowerbar;
var graphicsPowerbar;
var powerbarCount;
var powerbarMax;
var graphicshealthbar;
var rectanglehealthbar;
var healthbarCount;
var healthbarMax;

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

        this.healthbarBackground = this.add.image(850, 400, 'powerbar-background');
        this.healthbarForeground = this.add.image(850, 400, 'powerbar-foreground');
        this.healthbarForeground.setDepth(3);

        // Add power bar
        graphicsPowerbar = this.add.graphics({ fillStyle: { color: 0x00ffff }});
        rectanglePowerbar = new Phaser.Geom.Rectangle(
            this.powerbarForeground.getTopLeft().x,
            this.powerbarForeground.getTopLeft().y,
            this.powerbarForeground.width,
            this.powerbarForeground.height
            );
        powerbarCount = 0;
        powerbarMax = 600;

        const shape1 = this.make.graphics();
        shape1.fillStyle(0xffffff);
        shape1.beginPath();
        shape1.fillRoundedRect(
            rectanglePowerbar.x,
            rectanglePowerbar.y,
            rectanglePowerbar.width,
            rectanglePowerbar.height,
            this.powerbarForeground.width/2
        );

        const mask1 = shape1.createGeometryMask();
        graphicsPowerbar.setMask(mask1);

        // Add Health bar
        graphicshealthbar = this.add.graphics({ fillStyle: { color: 0xff00ff }});
        rectanglehealthbar = new Phaser.Geom.Rectangle(
            this.healthbarForeground.getTopLeft().x,
            this.healthbarForeground.getTopLeft().y,
            this.healthbarForeground.width,
            this.healthbarForeground.height
            );
        healthbarCount = 0;
        healthbarMax = 600;

        const shape2 = this.make.graphics();
        shape2.fillStyle(0xffffff);
        shape2.beginPath();
        shape2.fillRoundedRect(
            rectanglehealthbar.x,
            rectanglehealthbar.y,
            rectanglehealthbar.width,
            rectanglehealthbar.height,
            this.healthbarForeground.width/2
        );

        const mask2 = shape2.createGeometryMask();
        graphicshealthbar.setMask(mask2);

    }

    update () {
        if (powerbarCount < powerbarMax){
            powerbarCount = Math.min(powerbarMax, powerbarCount + 0.6);
        }
        else if (powerbarCount > 0){
            powerbarCount = Math.max(0, powerbarCount - 3);
        }

        if (healthbarCount < healthbarMax){
            healthbarCount = Math.min(healthbarMax, healthbarCount + 0.6);
        }
        else if (healthbarCount > 0){
            healthbarCount = Math.max(0, healthbarCount - 3);
        }

         // update powerbar and healthbar
        graphicsPowerbar.clear();
        rectanglePowerbar.setSize(this.powerbarForeground.width, powerbarCount);
        rectanglePowerbar.y = this.powerbarForeground.getBottomLeft().y - powerbarCount;
        graphicsPowerbar.fillRectShape(rectanglePowerbar);

        graphicshealthbar.clear();
        rectanglehealthbar.setSize(this.healthbarForeground.width, healthbarCount);
        rectanglehealthbar.y = this.healthbarForeground.getBottomLeft().y - healthbarCount;
        graphicshealthbar.fillRectShape(rectanglehealthbar);
    }
}
