import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });

        // Create style rules to let us use a custom font.
        const element = document.createElement('style');
        document.head.appendChild(element);
        const sheet = element.sheet;
        let styles = '@font-face { font-family: "nau_searegular"; src: url("fonts/nausea-yemm-webfont.woff2") format("woff2"), url("fonts/nausea-yemm-webfont.woff") format("woff"); }\n';
        sheet.insertRule(styles, 0);
    }

    preload ()
    {
        // webfont script
        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');

        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        this.load.audio('music', 'planet-power.mp3');
        this.load.audio('beamFiring', 'beam-firing.ogg');
        this.load.audio('explosion', 'explosion.wav');
        this.load.audio('coreDeathExplosion', 'core-death-explosion.wav');

        this.load.image('logo', 'logo.png');
        this.load.image('player', 'player.png');
        this.load.image('bar-background', 'barBackground.png');
        this.load.image('bar-foreground', 'barForeground.png');
        this.load.image('powerText', 'powerText.png');
        this.load.image('shieldText', 'shieldText.png');
        
        this.load.image('smallShip', 'enemy.png');
        this.load.spritesheet('smallShipExplosion', 'smallShipExplosion.png', { frameWidth: 16, frameHeight: 16 });
        this.load.image('station', 'spaceStation.png');
        this.load.image('blank200', 'empty200x200.png');
        this.load.image('healthShip', 'healthShip.png');
        this.load.image('healthSign', 'healthSign.png');
        this.load.spritesheet('healthShipExplosion', 'healthShipExplosion.png', { frameWidth: 40, frameHeight: 40 });
        this.load.image('bigShip', 'bigShip.png');
        this.load.spritesheet('bigShipExplosion', 'bigShipExplosion.png', { frameWidth: 60, frameHeight: 100 });
        this.load.image('bomb', 'bomb.png');
        this.load.image('healthSign', 'healthSign.png');
    }

    create ()
    {
        // Ensure the custom font is available everywhere.
        const add = this.add;
        WebFont.load({
            custom: {
                families: ['nau_searegular']
            },
            active: () => {
                this.scene.start('MainMenu');
            }
        });
    }
}
