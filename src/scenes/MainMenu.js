import { Scene } from 'phaser';
import LogoEffects from '../objects/LogoEffects';

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.add.image(512, 384, 'background');

        this.logoContainer = new LogoEffects(this);
        this.add.container(this.logoContainer);

        this.text = this.add.text(512, 460, 'Press Space to start', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setVisible(false);

        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start('Game');
        });
    }

    update() {
        this.logoContainer.draw();

        if (this.logoContainer.state === 'done') {
            this.text.setVisible(true);
        }
    }
}
