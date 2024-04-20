import { Scene } from 'phaser';
import Player from '../objects/Player';
import Shield from '../objects/Shield';
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

create () {
        this.shield = new Shield(
            this, 
            this.game.config.width / 2, 
            this.game.config.height / 2,
            250
        );

        this.player = new Player(
            this, 
            this.shield.x,
            this.shield.y, 
            'player',
            this.shield.height / 2
        );
      
        //this.cameras.main.setBackgroundColor(0x000000);
        this.add.image(512, 384, 'background');

        this.plasmaField = new PlasmaField(this);
        this.plasmaIsFiring = false;

        this.input.on('pointerdown', () => {
            if (!this.plasmaIsFiring) {
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
                this.plasmaIsFiring = true;
            } else {
                this.plasmaField.stopFiring();
                this.plasmaIsFiring = false;
            }
        });

        this.core = this.physics.add.staticImage(512, 380, 'station');

        this.powerbarBackground = this.add.image(950, 400, 'bar-background');
        this.powerbarForeground = this.add.image(950, 400, 'bar-foreground');
        this.powerbarBackground.setDepth(3);
        this.powerbarForeground.setDepth(5);

        this.healthbarBackground = this.add.image(75, 400, 'bar-background');
        this.healthbarForeground = this.add.image(75, 400, 'bar-foreground');
        this.healthbarBackground.setDepth(3);
        this.healthbarForeground.setDepth(5);

        keys = this.input.keyboard.addKeys({
            'enter': Phaser.Input.Keyboard.KeyCodes.ENTER,
            'space': Phaser.Input.Keyboard.KeyCodes.SPACE,
        });

        // Add power bar
        graphicsPowerbar = this.add.graphics({ fillStyle: { color: 0xdeb841 }});
        graphicsPowerbar.setDepth(4);
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
        graphicsHealthbar.setDepth(4);
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

        // The shield disappears when firing allowing ships to get
        // close to the station.
        this.physics.add.overlap(this.shieldSurface, this.enemies, this.hitShield, (s, e) => {return !this.plasmaField.isFiring;}, this);

        this.tendrilCollider = this.physics.add.overlap(this.plasmaField, this.enemies, this.hitTendril, this.plasmaField.collisionProcessor, this);
    }

    update () {
        this.player.update();
      
        // Currently constantly increases power and health
        if (powerbarCurrent < powerbarMax){
            powerbarCurrent = Math.min(powerbarMax, powerbarCurrent + 5);
        }
        if (healthbarCurrent < healthbarMax){
            healthbarCurrent = Math.min(healthbarMax, healthbarCurrent + 5);
        }

        if (this.plasmaIsFiring) {
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
        const shape = this.make.graphics({ fillStyle: { color: 0xffffff }});
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
        let spawnAngle = Util.randBetween(0, 360);
        this.randomCirclePos = Util.offsetByTrig(this.start, spawnAngle, 700); //start, angle, distance
        var enemy = this.physics.add.sprite(
            this.randomCirclePos.x, 
            this.randomCirclePos.y, 
            'enemy'
        );
        enemy.setDepth(1);
        enemy.spawnAngle = spawnAngle;

        // rotate to face centre
        const angleDeg = Math.atan2(this.randomCirclePos.y - this.core.y, this.randomCirclePos.x - this.core.x) * 180 / Math.PI;
        enemy.angle = angleDeg-90;

        this.enemies.add(enemy);
        this.physics.moveToObject(enemy, this.core, 50);
    }

    hitShield(shield, enemy){
        enemy.destroy();
        healthbarCurrent = Math.max(0, healthbarCurrent - 10);
    }

    hitTendril(plasmaField, enemy) {
        enemy.destroy();
    }
}
