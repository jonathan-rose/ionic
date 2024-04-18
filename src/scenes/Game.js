import { Scene } from 'phaser';
import PlasmaField from '../objects/PlasmaField';
import Util from '../util.js';

var keys;
var rectanglePowerbar;
var graphicsPowerbar;
var powerbarCurrent;
var powerbarMax;
var graphicsHealthbar;
var rectangleHealthbar;
var healthbarCurrent;
var healthbarMax;

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    create ()
    {
        //this.cameras.main.setBackgroundColor(0x000000);
        this.add.image(512, 384, 'background');

        this.plasmaField = new PlasmaField(this);
        this.isFiring = false;

        this.input.on('pointerdown', () => {

            if (!this.isFiring) {
                this.plasmaField.startFiring(
                    Phaser.Math.RadToDeg(
                        Phaser.Math.Angle.Between(
                            512,
                            383,
                            this.input.mousePointer.x,
                            this.input.mousePointer.y
                        )
                    )
                );
                this.isFiring = true;
            } else {
                this.plasmaField.stopFiring();
                this.isFiring = false;
            }
        });

        this.core = this.physics.add.staticImage(512, 384, 'station');

        this.powerbarBackground = this.add.image(950, 400, 'powerbar-background');
        this.powerbarForeground = this.add.image(950, 400, 'powerbar-foreground');
        this.powerbarForeground.setDepth(3);

        this.healthbarBackground = this.add.image(75, 400, 'powerbar-background');
        this.healthbarForeground = this.add.image(75, 400, 'powerbar-foreground');
        this.healthbarForeground.setDepth(3);

        keys = this.input.keyboard.addKeys({
            'enter': Phaser.Input.Keyboard.KeyCodes.ENTER,
            'space': Phaser.Input.Keyboard.KeyCodes.SPACE,
        });

        // Add power bar
        graphicsPowerbar = this.add.graphics({ fillStyle: { color: 0xdeb841 }});
        rectanglePowerbar = new Phaser.Geom.Rectangle(
            this.powerbarForeground.getTopLeft().x,
            this.powerbarForeground.getTopLeft().y,
            this.powerbarForeground.width,
            this.powerbarForeground.height
        );
        powerbarCurrent = 600;
        powerbarMax = 600;

        this.makeShapeMask(rectanglePowerbar, graphicsPowerbar);

        // Add Health bar
        graphicsHealthbar = this.add.graphics({ fillStyle: { color: 0xe54489 }});
        rectangleHealthbar = new Phaser.Geom.Rectangle(
            this.healthbarForeground.getTopLeft().x,
            this.healthbarForeground.getTopLeft().y,
            this.healthbarForeground.width,
            this.healthbarForeground.height
        );
        healthbarCurrent = 600;
        healthbarMax = 600;

        this.makeShapeMask(rectangleHealthbar, graphicsHealthbar);

        this.enemies = this.physics.add.group();

        this.shieldSurface = this.physics.add.staticImage(512 - 100, 384 - 100, 'blank200').setCircle(200);

        this.physics.add.overlap(this.shieldSurface, this.enemies, this.hitShield, null, this);
    }

    update () {
        // Currently constantly increases power and health
        if (powerbarCurrent < powerbarMax){
            powerbarCurrent = Math.min(powerbarMax, powerbarCurrent + 5);
        }
        if (healthbarCurrent < healthbarMax){
            healthbarCurrent = Math.min(healthbarMax, healthbarCurrent + 5);
        }

        if (this.isFiring) {
            powerbarCurrent = Math.max(0, powerbarCurrent - 10);
        }

        this.addEnemy();

	    this.plasmaField.update();
        this.plasmaField.draw();

        // update powerbar and healthbar
        graphicsPowerbar.clear();
        rectanglePowerbar.setSize(this.powerbarForeground.width, powerbarCurrent);
        rectanglePowerbar.y = this.powerbarForeground.getBottomLeft().y - powerbarCurrent;
        graphicsPowerbar.fillRectShape(rectanglePowerbar);

        graphicsHealthbar.clear();
        rectangleHealthbar.setSize(this.healthbarForeground.width, healthbarCurrent);
        rectangleHealthbar.y = this.healthbarForeground.getBottomLeft().y - healthbarCurrent;
        graphicsHealthbar.fillRectShape(rectangleHealthbar);
    }

    makeShapeMask(rectangleBarType, graphicsType)
    {
        const shape = this.make.graphics();
        shape.fillStyle(0xffffff);
        shape.beginPath();
        shape.fillRoundedRect(
            rectangleBarType.x,
            rectangleBarType.y,
            rectangleBarType.width,
            rectangleBarType.height,
            this.powerbarForeground.width/2
        );
        const mask = shape.createGeometryMask();
        graphicsType.setMask(mask);
    }

    addEnemy(){
        this.start = new Phaser.Math.Vector2(512, 384);
        this.rotation = Util.randBetween(0, 360);
        this.randomCirclePos = Util.offsetByTrig(this.start, this.rotation, 700); //start, angle, distance
        var enemy = this.physics.add.sprite(
            this.randomCirclePos.x, 
            this.randomCirclePos.y, 
            'enemy'
        );
        enemy.setDepth(1);

        // rotate to face centre
        const angleDeg = Math.atan2(this.randomCirclePos.y - this.core.y, this.randomCirclePos.x - this.core.x) * 180 / Math.PI;
        enemy.angle = angleDeg-90;

        this.enemies.add(enemy);
        this.physics.moveToObject(enemy, this.core, 100);
    }

    hitShield(shield, enemy){
        enemy.destroy();
        healthbarCurrent = Math.max(0, healthbarCurrent - 10);
    }
}
