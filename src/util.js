import 'phaser';

export default class Util {

    /**
     * Random positive integer less than `max`.
     */
    static randInt(max) {
        return Math.floor(Math.random() * max);
    }

    /**
     * Random float between `min` and `max`.
     */
    static randBetween(min, max) {
        return min + (Math.random() * (max - min));
    }

    /**
     * Random element from an array.
     */
    static randNth (items) {
        return items[this.randInt(items.length)];
    }

    /**
     * Calculate a new point which is `distance` away from `start` at `angle`.
     */
    static offsetByTrig(start, angle, distance) {
        let newX = Math.round(Math.cos(angle * Math.PI / 180) * distance + start.x);
        let newY = Math.round(Math.sin(angle * Math.PI / 180) * distance + start.y);
        return new Phaser.Math.Vector2(newX, newY);
    }

    static mod(n, m) {
        return ((n % m) + m) % m;
    }
}
