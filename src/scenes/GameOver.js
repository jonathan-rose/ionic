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

        this.score = this.registry.get('score');

        if (this.score > this.registry.get('highscore')){
            this.registry.set('highscore', this.score);
            this.text1 = this.add.text(512, 200, 'New High Score!', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
            }).setOrigin(0.5);
        }

        this.text2 = this.add.text(512, 300, 'Score:', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.text3 = this.add.text(512, 350, this.score, {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);
        
        this.enterText = this.add.text(512, 460, 'Press Space to Play Again', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
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
