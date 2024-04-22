import 'phaser';

export default class LogoEffects extends Phaser.GameObjects.Container {

    constructor(scene) {
        super(scene);
        this.scene = scene;

        this.logoX = 512;
        this.logoY = 300;
        this.logo = this.scene.add.image(this.logoX, this.logoY, 'logo');
        this.logo.setVisible(false);

        this.left = this.logoX - (this.logo.width / 2);
        this.right = this.logoX + (this.logo.width / 2);
        this.top = this.logoY - (this.logo.height / 2);
        this.bottom = this.logoY + (this.logo.height / 2);
        this.width = this.right - this.left;
        this.height = this.bottom - this.top;

        this.maskGraphics = this.scene.make.graphics();

        this.state = 'spawning';

        this.lineGraphics = this.scene.add.graphics();
        this.lines = [];

        for (let i = 0; i < 10; i++) {
            this.lines.push({x1: this.left,
                             y1: this.top,
                             x2: this.left,
                             y2: this.top});
        }

        this.shineGraphics = this.scene.add.graphics();
        this.shines = {
            initialX: this.left + (this.width / 2),
            initialY: this.top,
            parentAlpha: 0,
            backdraft: 100,
            sections: [
                {x: this.left + (this.width / 2),
                 w: 70,
                 a: 0.4},
                {x: this.left + (this.width / 2) + 70,
                 w: 50,
                 a: 0.8},
                {x: this.left + (this.width / 2) + 120,
                 w: 75,
                 a: 0.4}
            ]
        };

        this.addSpawnTweens();
    }

    addSpawnTweens() {
        this.state = 'spawning';

        let easeFn = 'Sine.easeInOut';
        let duration = 100;
        let delay = 500;

        this.scene.tweens.add({
            targets: this.lines,
            y2: this.bottom,
            ease: easeFn,
            duration: duration,
            delay: delay,
            onComplete: () => this.addSwipeTweens(),
            onCompleteScope: this
        });
    }

    addSwipeTweens() {
        this.state = 'swiping';
        this.logo.setVisible(true);

        let easeFn = 'Sine.easeInOut';
        let duration = 300;
        let staggerValue = 50;
        let initialDelay = 500;
        let staggerEaseFn = 'Cubic.easeOut';

        this.scene.tweens.add({
            targets: this.lines,
            x1: this.right,
            ease: easeFn,
            duration: duration,
            delay: this.scene.tweens.stagger(
                staggerValue,
                {start: initialDelay,
                 ease: staggerEaseFn}
            )
        });

        this.scene.tweens.add({
            targets: this.lines,
            x2: this.right,
            ease: easeFn,
            duration: duration,
            delay: this.scene.tweens.stagger(
                staggerValue,
                {start: initialDelay + 100,
                 ease: staggerEaseFn}
            ),
            onComplete: () => this.addHideTweens(),
            onCompleteScope: this
        });
    }

    addHideTweens() {
        this.state = 'hiding';
        this.logo.setMask(null);

        let easeFn = 'Sine.easeInOut';
        let duration = 300;
        let delay = 500;

        this.scene.tweens.add({
            targets: this.lines,
            y1: this.bottom,
            ease: easeFn,
            duration: duration,
            delay: delay,
            onComplete: () => {
                this.lines = [];
                this.addShineTweens();
            },
            onCompleteScope: this
        });

        this.scene.tweens.add({
            targets: this.shines,
            parentAlpha: 1,
            ease: easeFn,
            duration: duration,
            delay: delay
        });
    }

    addShineTweens() {
        this.state = 'shining';

        let duration = 600;
        let delay = 0;

        this.scene.tweens.add({
            targets: this.shines,
            initialX: "+=" + this.width,
            ease: 'Sine.easeIn',
            duration: duration,
            delay: delay
        });

        this.scene.tweens.add({
            targets: this.shines,
            initialX: "+=" + (this.width * 1),
            onStart: (t, targets) => {targets[0].initialX = this.left - (this.width / 2);},
            onstartScope: this,
            ease: 'Sine.easeOut',
            duration: duration,
            delay: delay + duration + 100,
            onComplete: () => {
                this.state = 'done';
            },
            onCompleteScope: this
        });
    }

    draw() {
        this.maskGraphics.clear();
        this.lineGraphics.clear();
        this.shineGraphics.clear();

        if (this.state === 'spawning') {
            this.maskGraphics.fillStyle(0xffffff, 1);
            this.maskGraphics.beginPath();
            this.maskGraphics.fillRect(this.left, this.top, this.width, this.height);
            this.maskGraphics.closePath();
            this.logo.setMask(this.maskGraphics.createGeometryMask());
        }

        if (this.state === 'swiping') {
            let last = this.lines[this.lines.length - 1];
            this.maskGraphics.fillStyle(0xffffff, 1);
            this.maskGraphics.beginPath();
            this.maskGraphics.fillPoints(
                [
                    new Phaser.Geom.Point(last.x2, last.y2),
                    new Phaser.Geom.Point(this.left, this.bottom),
                    new Phaser.Geom.Point(this.left, this.top),
                    new Phaser.Geom.Point(last.x1, last.y1)
                ],
                true
            );
            this.maskGraphics.closePath();
            this.logo.setMask(this.maskGraphics.createGeometryMask());
        }

        this.lineGraphics.lineStyle(5, 0xE54489, 1);
        this.lines.forEach((l) => {
            this.lineGraphics.lineBetween(l.x1, l.y1, l.x2, l.y2);
        });

        if (this.state === 'hiding' || this.state === 'shining' || this.state === 'done') {
            let x = this.shines.initialX;
            let y = this.shines.initialY;
            let bd = this.shines.backdraft;
            let pa = this.shines.parentAlpha;

            this.shines.sections.forEach((s) => {
                this.shineGraphics.fillStyle(0xffffff, s.a * pa);
                this.shineGraphics.beginPath();
                this.shineGraphics.fillPoints(
                    [
                        new Phaser.Geom.Point(x, y),
                        new Phaser.Geom.Point(x + s.w, y),
                        new Phaser.Geom.Point((x + s.w) - bd, this.bottom),
                        new Phaser.Geom.Point(x - bd, this.bottom)
                    ],
                    true
                );
                this.shineGraphics.closePath();
                x += s.w;
            });


            // Only show the shines on the non-transparent parts of the logo image
            let mask = this.shineGraphics.createBitmapMask(this.logo);
            this.shineGraphics.setMask(mask);
        }

        if (this.state === 'done') {
            
        }
    }
}
