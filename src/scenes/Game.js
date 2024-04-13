import { Scene } from 'phaser';
import Player from '../objects/Player';
import Shield from '../objects/Shield';

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.cameras.main.setBackgroundColor(0xffffff);
        this.shield = new Shield(this, this.game.config.width / 2, this.game.config.width / 2);
        this.player = new Player(this, this.shield.x, this.shield.y - this.shield.height, 'player');
    }

    update () {

    }
}
