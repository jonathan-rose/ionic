import { Scene } from 'phaser';
import Player from '../objects/Player';
import Shield from '../objects/Shield';
import PlasmaField from '../objects/PlasmaField';
import EnemySpawnManager from '../objects/EnemySpawnManager';
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
        this.gameEnding = false;

        this.add.image(512, 384, 'background');

        this.beamFiringSound = this.sound.add('beamFiring');
        this.beamFiringSoundPlaying = false;

        this.plasmaField = new PlasmaField(this);
        this.plasmaField.isFiring = false;

        this.core = this.physics.add.staticImage(512, 380, 'station');

        this.powerbarBackground = this.add.image(950, 400, 'bar-background');
        this.powerbarForeground = this.add.image(950, 400, 'bar-foreground');
        this.powerText = this.add.image(950, 400, 'powerText').setDepth(5);
        this.powerbarBackground.setDepth(3);
        this.powerbarForeground.setDepth(5);

        this.healthbarBackground = this.add.image(75, 400, 'bar-background');
        this.healthbarForeground = this.add.image(75, 400, 'bar-foreground');
        this.shieldText = this.add.image(75, 400, 'shieldText').setDepth(5);
        this.healthbarBackground.setDepth(3);
        this.healthbarForeground.setDepth(5);

        // Add power bar
        graphicsPowerbar = this.add.graphics({ fillStyle: { color: 0x5557dd }}); // 0xdeb841
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
        this.graphicsPowerbarMinimum = this.add.graphics ({ fillStyle: {color: 0xff0000, alpha: 0.7}});
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
        healthbarCurrent = 546;
        healthbarMax = 546;

        this.makeShapeMask(rectangleHealthbar, graphicsHealthbar);

        this.smallShips = this.physics.add.group();
        this.anims.create({
            key: 'explodeSmall',
            frames: this.anims.generateFrameNumbers('smallShipExplosion', { start: 0, end: 2 }),
            frameRate: 10
        });

        this.shieldSurface = this.physics.add.staticImage(512 - 100, 384 - 100, 'blank200').setCircle(200);
        this.shieldSurface.radius = 200; // I'm so sorry

        this.physics.add.overlap(this.shieldSurface, this.smallShips, this.smallShipHitShield, this.outerShieldCollisionProcessor, this);
        
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

        this.healthShips = this.physics.add.group();
        this.anims.create({
            key: 'explodeHealth',
            frames: this.anims.generateFrameNumbers('healthShipExplosion', { start: 0, end: 7 }),
            frameRate: 10
        });
        this.physics.add.overlap(this.shieldSurface, this.healthShips, this.healthShipHitShield, this.outerShieldCollisionProcessor, this);
        this.physics.add.overlap(this.player, this.healthShips, this.collectHealthShip, null, this);

        this.bigShips = this.physics.add.group();
        this.physics.add.overlap(this.shieldSurface, this.bigShips, this.bigShipHitShield, this.outerShieldCollisionProcessor, this);

        // A group for the tendrils to interact with
        this.destroyableShips = this.physics.add.group();

        // Screen wipe bomb with enter
        this.bomb1 = this.add.image(850, 50, 'bomb').setDepth(10);
        this.bomb2 = this.add.image(900, 50, 'bomb').setDepth(10);
        this.bomb3 = this.add.image(950, 50, 'bomb').setDepth(10);
        this.bombs = [this.bomb1, this.bomb2, this.bomb3];
        
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.enterKey.on('down', ()=> {
            if (this.bombs.length > 0){
                this.useBomb();
                this.bombs.pop().destroy();
            }
        });

        // @NOTE debugging key event to end the game
        // this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        // this.rKey.on('down', ()=> {
        //     this.gameOverTransition();
        // });

        this.tendrilCollider = this.physics.add.overlap(this.plasmaField, this.destroyableShips, this.hitTendril, this.plasmaField.collisionProcessor, this);

        this.coreCollider = this.physics.add.overlap(this.core, this.destroyableShips, this.hitCore, null, this);

        // The score
        this.scoreText = this.add.text(16, 46, 'score: 0', {
            fontFamily: 'nau_searegular',
            fontSize: '32px',
            fill: '#FFF'
        });
        this.scoreText.setDepth(5);
        this.score = 0;

        // Manage ramping difficulty and stuff
        this.spawner = new EnemySpawnManager(this);
    }

    update () {
        this.player.update(powerbarCurrent);

        // Currently constantly increases power and health
        if (powerbarCurrent < powerbarMax && !this.gameEnding) {
            powerbarCurrent = Math.min(powerbarMax, powerbarCurrent + 1);
        }
        if (healthbarCurrent < healthbarMax && !this.gameEnding) {
            healthbarCurrent = Math.min(healthbarMax, healthbarCurrent + 0.3);
        }

        if (this.plasmaField.isFiring && !this.plasmaField.isFiringFullScreen && !this.gameEnding) {
            powerbarCurrent = Math.max(0, powerbarCurrent - plasmaConsumeRate);
        }

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

        // End the game if health bar hits 0
        if (healthbarCurrent <= 5){
            this.registry.set('score', this.score);
            this.gameOverTransition();
        }
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

    addShip(sprite, spawnAngle = null, distance = null) {
        if (spawnAngle == null) {
            spawnAngle = Util.randBetween(0, 360);
        }
        spawnAngle = Util.mod(spawnAngle, 360);

        if (distance == null) {
            distance = 700;
        }

        this.start = new Phaser.Math.Vector2(512, 384);
        this.circlePos = Util.offsetByTrig(this.start, spawnAngle, distance); //start, angle, distance
        var ship = this.physics.add.sprite(
            this.circlePos.x,
            this.circlePos.y,
            sprite
        );
        ship.setDepth(1);
        ship.spawnAngle = spawnAngle;
        ship.isDying = false;

        // rotate to face centre
        const angleDeg = Math.atan2(this.circlePos.y - this.core.y, this.circlePos.x - this.core.x) * 180 / Math.PI;
        ship.angle = angleDeg-90;
        this.destroyableShips.add(ship);
        return ship;
    }

    addSmallShip(spawnAngle = null, distance = null) {
        let smallShip = this.addShip('smallShip', spawnAngle, distance);
        smallShip.shipType = 'small';
        smallShip.scoreValue = 5;
        smallShip.coreDamage = 10;
        smallShip.deathAnim = 'explodeSmall';
        this.smallShips.add(smallShip);
        this.physics.moveToObject(smallShip, this.core, 50);
    }

    smallShipHitShield(shield, ship){
        if (!this.plasmaField.isFiringFullScreen){
            healthbarCurrent = Math.max(0, healthbarCurrent - 1.1);
        }
        ship.isDying = true;
        ship.body.velocity.x = 0;
        ship.body.velocity.y = 0;
        ship.anims.play('explodeSmall', true);
        ship.on(Phaser.Animations.Events.ANIMATION_COMPLETE, function () {
            ship.destroy();
        }, this);
    }

    hitTendril(plasmaField, ship) {
        ship.body.velocity.x = 0;
        ship.body.velocity.y = 0;
        this.increaseScore(ship.scoreValue);
        ship.anims.play(ship.deathAnim, true);
        ship.on(Phaser.Animations.Events.ANIMATION_COMPLETE, function () {
            ship.destroy();
        }, this);
    }

    hitCore(core, ship) {
        healthbarCurrent = Math.max(0, healthbarCurrent - ship.coreDamage);
        switch (ship.shipType) {
            case 'small':
                this.cameras.main.shake(100, 0.005);
                break;
            case 'health':
                this.cameras.main.shake(100, 0.01);
                break;
            case 'big':
                this.cameras.main.shake(200, 0.03);
                break;
        }
        // @TODO: animate ship death?
        ship.destroy();
    }

    addHealthShip() {
        var healthShip = this.addShip('healthShipExplosion');
        healthShip.shipType = 'health';
        healthShip.scoreValue = 0;
        healthShip.coreDamage = 20;
        healthShip.deathAnim = 'explodeHealth'
        this.healthShips.add(healthShip);
        this.physics.moveToObject(healthShip, this.core, 40);
    }

    healthShipHitShield(shield, ship){
        ship.body.velocity.x = 0;
        ship.body.velocity.y = 0;
        ship.isDying = true;

        ship.anims.play('explodeHealth', true);
        ship.on(Phaser.Animations.Events.ANIMATION_COMPLETE, function () {
            ship.destroy();
        }, this);
    }

    collectHealthShip(player, ship){
        if (healthbarCurrent < healthbarMax){
            healthbarCurrent = Math.min(healthbarMax, healthbarCurrent + 300);
        }
        ship.destroy();
        // TODO: Add some nice animation or flurry of green/pink plusses
    }

    addBigShip() {
        var bigShip = this.addShip('bigShip');
        bigShip.shipType = 'big';
        bigShip.scoreValue = 100;
        bigShip.coreDamage = 200;
        bigShip.deathAnim = 'explodeHealth';
        this.bigShips.add(bigShip);
        this.physics.moveToObject(bigShip, this.core, 40);
    }

    bigShipHitShield(shield, ship){
        ship.body.velocity.x = 0;
        ship.body.velocity.y = 0;
        ship.isDying = true;
        if (!this.plasmaField.isFiringFullScreen){
            healthbarCurrent = Math.max(0, healthbarCurrent - 100);
        }

        // UPDATE EXPLOSION SPRITE

        ship.anims.play('explodeHealth', true);
        ship.on(Phaser.Animations.Events.ANIMATION_COMPLETE, function () {
            ship.destroy();
        }, this);
    }

    increaseScore(increase){
        this.score += increase;
        this.scoreText.setText('Score: ' + this.score);
    }

    useBomb() {
        this.sound.play('explosion');
        this.tweens.add({
            targets: this.plasmaField,
            shieldRadius: 800,
            duration: 2000,
            onComplete: (t, targets) => {
                targets[0].shieldRadius = 200;
            }
        });
        
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
            radius: 800,
            duration: 2000,
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

    outerShieldCollisionProcessor(a, b) {
        return !b.isDying && (this.plasmaField.isFiringFullScreen || !(this.plasmaField.isDepleted || this.plasmaField.isFiring));
    }

    gameOverTransition() {

        this.sound.play('coreDeathExplosion');
        this.plasmaField.tendrils.forEach((t) => {
            t.radius = 700;
        });
        this.plasmaField.isFiringFullScreen = true;

        // give the tendrils a sec to be big before freezing them.
        this.time.addEvent({
            delay: 300,
            callback: () => {this.gameEnding = true;},
            callbackScope: this
        });

        // freeze all enemy ships
        this.destroyableShips.children.getArray().forEach((s) => {
            s.body.velocity.x = 0;
            s.body.velocity.y = 0;
        });

        let cam = this.cameras.main;
        let fadeOutTime = 3500;
        cam.fadeOut(fadeOutTime, 255, 255, 255);

        let graphics = this.add.graphics({fillStyle: {color: 0xffffff}}).setDepth(100);
        let explosionDisc = new Phaser.Geom.Ellipse(512, 384, 0, 10);
        let explosionSphere = new Phaser.Geom.Circle(512, 384, 0);

        this.tweens.add({
            targets: explosionDisc,
            width: 5000,
            duration: 500,
            delay: 1000,
            ease: 'Sine.easeInOut',
            onUpdate: () => {
                graphics.clear();
                graphics.fillEllipseShape(explosionDisc);
            }
        });

        this.tweens.add({
            targets: explosionSphere,
            radius: 1000,
            duration: 1000,
            delay: 2000,
            ease: 'Sine.easeInOut',
            onUpdate: () => {
                graphics.clear();
                graphics.fillEllipseShape(explosionDisc);
                graphics.fillCircleShape(explosionSphere);
            }
        });

        this.time.addEvent({
            delay: fadeOutTime,
            callback: () => {this.scene.start('GameOver');},
            callbackScope: this
        });
    }
}
