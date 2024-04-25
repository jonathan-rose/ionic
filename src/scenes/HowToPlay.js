import { Scene } from 'phaser';

export class HowToPlay extends Scene
{
    constructor ()
    {
        super('HowToPlay');
    }

    create ()
    {
        this.add.image(512, 384, 'background');

        // Use arrow keys to move cannon
        // Hold Space to fire

        // Destroy enemy ships before they reach your shield
        // Collect friendly ships with your cannon to restore shield

        // Press Enter to use a mega-bomb
        // Manage your Power usage to avoid temporary outages

        this.text2 = this.add.text(512, 130, 'Use arrow keys to move cannon\nHold Space to fire', {
            fontFamily: 'nau_searegular',
            fontSize: 30,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.player = this.add.image(512, 190, 'player');
        this.player.angle = 180;

        this.text3 = this.add.text(512, 270, 'Destroy enemy ships before they reach your shield', {
            fontFamily: 'nau_searegular',
            fontSize: 30,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.smallShip = this.add.image(462, 320, 'smallShip');
        this.smallShip.angle = 90;
        this.bigShip = this.add.image(562, 320, 'bigShip');
        this.bigShip.angle = 90;

        this.text4 = this.add.text(512, 420, 'Collect friendly ships with your cannon to restore shield', {
            fontFamily: 'nau_searegular',
            fontSize: 30,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.add.image(512, 470, 'healthShip');

        this.text5 = this.add.text(512, 550, 'Press Enter to use a mega-bomb', {
            fontFamily: 'nau_searegular',
            fontSize: 30,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.add.image(512, 600, 'bomb');
        
        this.enterText = this.add.text(512, 680, 'Press Space to start', {
            fontFamily: 'nau_searegular',
            fontSize: 38,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: this.enterText,
            alpha: 0.3,
            yoyo: true,
            repeat: -1
        });

        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start('Game');
        });
    }
}
