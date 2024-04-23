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
var plasmaConsumeRate = 4;

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    create () {    
        this.add.image(512, 384, 'background');

        this.plasmaField = new PlasmaField(this);
        this.plasmaField.isFiring = false;

        this.core = this.physics.add.staticImage(512, 380, 'station');

        this.powerbarBackground = this.add.image(950, 400, 'bar-background');
        this.powerbarForeground = this.add.image(950, 400, 'bar-foreground');
        this.powerbarBackground.setDepth(3);
        this.powerbarForeground.setDepth(5);

        this.healthbarBackground = this.add.image(75, 400, 'bar-background');
        this.healthbarForeground = this.add.image(75, 400, 'bar-foreground');
        this.healthbarBackground.setDepth(3);
        this.healthbarForeground.setDepth(5);

        // keys = this.input.keyboard.addKeys({
        //     'enter': Phaser.Input.Keyboard.KeyCodes.ENTER,
        //     'space': Phaser.Input.Keyboard.KeyCodes.SPACE,
        // });

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

        this.powerbarMinimum = 100;
        this.graphicsPowerbarMinimum = this.add.graphics ({ fillStyle: {color: 0xff0000, alpha: 0.5}});
        this.graphicsPowerbarMinimum.fillRect(
            this.powerbarForeground.getBottomLeft().x,
            this.powerbarForeground.getBottomLeft().y - this.powerbarMinimum,
            this.powerbarForeground.width,
            this.powerbarMinimum
        );
        this.graphicsPowerbarMinimum.setDepth(4);

        this.makeShapeMask(rectanglePowerbar, this.graphicsPowerbarMinimum);

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

        this.smallShips = this.physics.add.group();

        this.shieldSurface = this.physics.add.staticImage(512 - 100, 384 - 100, 'blank200').setCircle(200);
        this.shieldSurface.radius = 200; // I'm so sorry

        // The shield disappears when firing allowing ships to get
        // close to the station.
        this.physics.add.overlap(this.shieldSurface, this.smallShips, this.smallShipHitShield, null, this);
        // (s, e) => {return !this.plasmaField.isFiring;}
        
        this.shield = new Shield(
            this, 
            this.game.config.width / 2, 
            this.game.config.height / 2,
            this.plasmaField.shieldRadius - 5
        );

        this.player = new Player(
            this, 
            this.shield.x,
            this.shield.y, 
            'player',
            this.shield.height / 2,
            this.plasmaField,
            graphicsPowerbar
        );
        this.player.setDepth(5);

	    var healthShiptimer = this.time.addEvent({
            delay: 5000,
            callback: this.addHealthShip,
            callbackScope: this,
            loop: true
        });

        this.healthShips = this.physics.add.group();
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('healthShipExplosion', { start: 0, end: 7 }),
            frameRate: 10
        });
        this.physics.add.overlap(this.shieldSurface, this.healthShips, this.healthShipHitShield, null, this);
        this.physics.add.overlap(this.player, this.healthShips, this.collectHealthShip, null, this);

        var bigShiptimer = this.time.addEvent({
            delay: 4000,
            callback: this.addBigShip,
            callbackScope: this,
            loop: true
        });
        this.bigShips = this.physics.add.group();
        this.physics.add.overlap(this.shieldSurface, this.bigShips, this.bigShipHitShield, null, this);

        // A group for the tendrils to interact with
        this.destroyableShips = this.physics.add.group();

        // Set off screen wipe bomb with enter
        this.bomb1 = this.add.image(500, 50, 'smallShip');
        this.bomb2 = this.add.image(550, 50, 'smallShip');
        this.bomb3 = this.add.image(600, 50, 'smallShip');
        this.bombs = [this.bomb1, this.bomb2, this.bomb3];
        // this.bombCircle = new Phaser.Geom.Circle(
        //     512,
        //     380,
        //     100
        // );
        //this.bombCollider = this.physics.add.overlap(this.shieldSurface, this.destroyableShips, (circle, ship) => {ship.destroy();}, null, this);
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.enterKey.on('down', ()=> {
            if (this.bombs.length > 0){
                this.useBomb();
                this.bombs.pop().destroy();
            }
            
        });

        this.tendrilCollider = this.physics.add.overlap(this.plasmaField, this.destroyableShips, this.hitTendril, this.plasmaField.collisionProcessor, this);

        //  The score
        this.scoreText = this.add.text(16, 46, 'score: 0', { fontSize: '32px', fill: '#FFF' });
        this.scoreText.setDepth(5);
        this.score = 0;
    }

    update () {
        this.player.update(powerbarCurrent);
        console.log(this.shieldSurface.body.radius);
      
        // Currently constantly increases power and health
        if (powerbarCurrent < powerbarMax){
            powerbarCurrent = Math.min(powerbarMax, powerbarCurrent + 1);
        }

        if (this.plasmaField.isFiring) {
            powerbarCurrent = Math.max(0, powerbarCurrent - plasmaConsumeRate);
        }

        this.addSmallShip();

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

    addShip(sprite){
        this.start = new Phaser.Math.Vector2(512, 384);
        let spawnAngle = Util.randBetween(0, 360);
        this.randomCirclePos = Util.offsetByTrig(this.start, spawnAngle, 700); //start, angle, distance
        var ship = this.physics.add.sprite(
            this.randomCirclePos.x, 
            this.randomCirclePos.y, 
            sprite
        );
        ship.setDepth(1);
        ship.spawnAngle = spawnAngle;

        // rotate to face centre
        const angleDeg = Math.atan2(this.randomCirclePos.y - this.core.y, this.randomCirclePos.x - this.core.x) * 180 / Math.PI;
        ship.angle = angleDeg-90;
        this.destroyableShips.add(ship);
        return ship;
    }

    addSmallShip(){
        var smallShip = this.addShip('smallShip');
        smallShip.scoreValue = 5;
        this.smallShips.add(smallShip);
        this.physics.moveToObject(smallShip, this.core, 50);
    }

    smallShipHitShield(shield, ship){
        ship.destroy();
        //healthbarCurrent = Math.max(0, healthbarCurrent - 10);
    }

    hitTendril(plasmaField, ship) {
        ship.destroy();
        this.increaseScore(ship.scoreValue);
    }

    addHealthShip(){
        var healthShip = this.addShip('healthShipExplosion');
        healthShip.scoreValue = 0;
        this.healthShips.add(healthShip);
        this.physics.moveToObject(healthShip, this.core, 40);
    }

    healthShipHitShield(shield, ship){
        ship.body.velocity.x = 0;
        ship.body.velocity.y = 0;

        ship.anims.play('explode', true);

        ship.on(Phaser.Animations.Events.ANIMATION_COMPLETE, function () {
            ship.destroy();
        }, this);
    }

    collectHealthShip(player, ship){
        if (healthbarCurrent < healthbarMax){
            healthbarCurrent = Math.min(healthbarMax, healthbarCurrent + 100);
        }
        ship.destroy();
        // TODO: Add some nice animation or flurry of green plusses
    }

    addBigShip(){
        var bigShip = this.addShip('bigShip');
        bigShip.scoreValue = 100;
        this.bigShips.add(bigShip);
        this.physics.moveToObject(bigShip, this.core, 40);
    }

    bigShipHitShield(shield, ship){
        ship.body.velocity.x = 0;
        ship.body.velocity.y = 0;
        healthbarCurrent = Math.max(0, healthbarCurrent - 100);

        ship.destroy();
    }

    increaseScore(increase){
        this.score += increase;
        this.scoreText.setText('Score: ' + this.score);
    }

    useBomb(){
        this.plasmaField.fullScreenTendrilsOn();
        var screenWipeTimer = this.time.addEvent({
            delay: 2000,
            callback: this.plasmaField.fullScreenTendrilsOff,
            callbackScope: this.plasmaField,
            loop: false
        });

        // DO NOT TOUCH
        // ONLY WORKS EXCATLY AS IS
        // I am sorry

        this.tweens.add({
            targets: this.shieldSurface,
            radius: 1000,
            duration: 1000,
            onComplete: (tween, targets) => {                
                targets[0].body.x = 512-(200);
                targets[0].body.y = 384-(200);
                targets[0].body.setCircle(200);
                targets[0].radius = 200;
            },
            onUpdate: (tween, target, key, current) => {
                target.body.setCircle(current);
                target.body.x = 512-(current);
                target.body.y = 384-(current);
            }
        });
    }
}
