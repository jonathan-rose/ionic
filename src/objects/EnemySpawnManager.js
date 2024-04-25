import 'phaser';
import Util from '../util.js';

export default class EnemySpawnManager {
    constructor(scene) {
        this.scene = scene;

        this.spawnRates = [
            {name: "small",
             timer: null,
             cb: this.scene.addSmallShip,
             dt: 55},
            {name: "health",
             timer: null,
             cb: this.scene.addHealthShip,
             dt: 5000},
            {name: "big",
             timer: null,
             cb: this.scene.addBigShip,
             dt: 4000}
        ];

        this.updateSpawnTimers();

        // this feels good, our music is ~3:20, which is 200 seconds,
        // so 10 ramps 20 seconds apart?
        this.maxRamps = 10;
        this.rampDelay = 20000;
        
        this.rampTimer = this.scene.time.addEvent({
            delay: this.rampDelay,
            repeat: this.maxRamps,
            callback: () => {
                this.rampUp();
            },
            callbackScopr: this
        });

        this.patterns = new Map();
        this.patterns.set('circle', {spawn: this.spawnCircle});
        this.patterns.set('spiral', {spawn: this.spawnSpiral});
        this.patterns.set('doubleCircle', {spawn: this.spawnDoubleCircle});
        this.patterns.set('doubleSpiral', {spawn: this.spawnDoubleSpiral});
        this.patternCount = 0;

        this.patternTimer = this.scene.time.addEvent({
            delay: this.rampDelay,
            callback: (scene) => {
                let pattern = Util.randNth(Array.from(this.patterns.keys()));
                if (this.patternCount < 4) {
                    pattern = ['circle', 'spiral', 'doubleCircle', 'doubleSpiral'][this.patternCount];
                }
                this.spawnPattern(
                    scene,
                    pattern
                );
                this.patternCount++;
            },
            callbackScope: this,
            args: [this.scene],
            loop: true
        });
    }

    /**
     * Remove the old timers and create new ones based on (presumably)
     * updated spawnRates.
     */
    updateSpawnTimers() {
        this.spawnRates.forEach(({timer, cb, dt, n}, i, spawnRates) => {
            if (timer !== null) {
                spawnRates[i].timer.remove();
            }
            spawnRates[i].timer = this.scene.time.addEvent({
                delay: Math.floor(dt),
                callback: cb,
                callbackScope: this.scene,
                loop: true
            });
        });
    }

    /**
     * Make the delays between spawns shorter and make the number of
     * entities spawned larger.
     * 
     * The timers use Math.floor on `dt` and `n`, so they wont
     * necessarily change every time.
     */
    rampUp() {
        this.spawnRates.forEach((rate) => {
            rate.dt *= 0.9;
            rate.n *= 1.1;
        });
        this.updateSpawnTimers();
    }

    spawnPattern(scene, name) {
        this.patterns.get(name).spawn(scene);
    }

    spawnCircle(scene) {
        for (let i = 0; i < 360; i++) {
            scene.addSmallShip(i);
        }
    }

    spawnSpiral(scene) {
        for (let i = 0; i < 360; i++) {
            scene.addSmallShip((i * 2), 700 + i * 2);
        }
    }

    spawnDoubleCircle(scene) {
        for (let i = 0; i < 360; i++) {
            scene.addSmallShip(i);
            scene.addSmallShip(i, 740);
        }
    }

    spawnDoubleSpiral(scene) {
        for (let i = 0; i < 360; i++) {
            scene.addSmallShip((i * 2), 700 + i);
            scene.addSmallShip((i * 2) + 180, 700 + i * 2);
        }
    }
}
