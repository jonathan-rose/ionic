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
        this.cameras.main.setBackgroundColor(0x000000);

        this.player = new Player(this, 200, 200, 'player');
        this.shield = new Shield(this, 300, 300);
    }

    update () {

    }
}
