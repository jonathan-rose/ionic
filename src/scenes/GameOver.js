import { Scene } from 'phaser';

export class GameOver extends Scene
{
    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        this.add.image(512, 384, 'background');

        let score = this.registry.get('score');
        let highscore = this.registry.get('highscore');
        if (score > highscore){
            this.registry.set('highscore', score);
            this.text1 = this.add.text(512, 200, 'New High Score!', {
                fontFamily: 'nau_searegular',
                fontSize: 38,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 8,
                align: 'center'
            }).setOrigin(0.5);
        }

        this.text2 = this.add.text(512, 300, 'Score:', {
            fontFamily: 'nau_searegular',
            fontSize: 38,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.text3 = this.add.text(512, 350, score, {
            fontFamily: 'nau_searegular',
            fontSize: 38,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);
        
        this.enterText = this.add.text(512, 460, 'Press Space to Play Again', {
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
