import Phaser from 'phaser';
import eventManager from '../classes/EventManager';

import * as Keys from '../data/keys';
import Settings from '../data/settings';

import Deer from '../classes/deer';

export default class extends Phaser.Scene {
  constructor() {
    super({ key: Keys.Scenes.Game });

    this.timePassed = 0;
    this.isTimerRunning = false;
    this.poly = [];
  }

  // PHASER BUILT-INS
  init(data) {
    // Only needed once. Loaded separately, before everything else, just in case!
    const background = this.add.image(0, 0, Keys.Assets.Background);
    background.setOrigin(0, 0);
    background.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    // const zone = this.setDirtZone(0xff0000, 0.2, this); // TODO: fix dirt animation

    this.scene.run(Keys.Scenes.UI);

    this.cameras.main.fadeIn(Settings.Cam_FadeTime);
    this.time.delayedCall(Settings.Cam_FadeTime, () => {
      this.isTimerRunning = true;
    });

    eventManager.on(Keys.Events.emptyGun, this.transitionScenes, this);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      eventManager.off(Keys.Events.emptyGun, this.transitionScenes, this);
    });

    eventManager.on(Keys.Events.timeoutGame, this.transitionScenes, this);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      eventManager.off(Keys.Events.timeoutGame, this.transitionScenes, this);
    });

    eventManager.on(Keys.Events.killHattrick, this.playBonus, this);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      eventManager.off(Keys.Events.killHattrick, this.playBonus, this);
    });
  }

  create(data) {
    this.deer = new Deer(this, 400, 300);
  }

  update(time, delta) {
    if (!this.isTimerRunning) return;
    this.timePassed += delta;

    if (this.timePassed < Settings.Game_Time) return;
    eventManager.emit(Keys.Events.timeoutGame);
  }

  // SCENE FUNCTIONS

  /**
   * Sets up zone where the dirt animation is played
   * when hitting the ground instead of a deer.
   */
  setDirtZone(color, alpha, scene) {
    // https://phaser.discourse.group/t/how-to-create-a-polygon-dropzone/9846

    const earthShape = [
      // Predefined by script
      { x: 0, y: 368.8798370672098 },
      { x: 52.13849287169043, y: 371.4867617107943 },
      { x: 46.924643584521384, y: 475.7637474541752 },
      { x: 91.24236252545825, y: 475.7637474541752 },
      { x: 95.15274949083503, y: 376.70061099796334 },
      { x: 205.9470468431772, y: 354.5417515274949 },
      { x: 325.8655804480652, y: 312.8309572301426 },
      { x: 383.2179226069247, y: 298.4928716904277 },
      { x: 384.52138492871694, y: 370.18329938900206 },
      { x: 448.3910386965377, y: 388.4317718940937 },
      { x: 471.8533604887984, y: 295.88594704684317 },
      { x: 577.4338085539715, y: 294.5824847250509 },
      { x: 570.9164969450102, y: 423.62525458248473 },
      { x: 620.4480651731161, y: 424.928716904277 },
      { x: 624.3584521384929, y: 464.03258655804484 },
      { x: 692.1384928716905, y: 474.4602851323829 },
      { x: 707.7800407331976, y: 525.2953156822811 },
      { x: 757.3116089613035, y: 552.6680244399186 },
      { x: 842.0366598778004, y: 534.4195519348269 },
      { x: 921.5478615071283, y: 537.0264765784115 },
      { x: 951.5274949083504, y: 470.5498981670061 },
      { x: 911.1201629327902, y: 327.16904276985747 },
      { x: 965.8655804480652, y: 361.05906313645625 },
      { x: 999.755600814664, y: 461.4256619144603 },
      { x: 1053.1975560081466, y: 457.5152749490835 },
      { x: 1058.4114052953157, y: 384.52138492871694 },
      { x: 1131.4052953156822, y: 392.3421588594705 },
      { x: 1140.529531568228, y: 419.714867617108 },
      { x: 1192.6680244399186, y: 419.714867617108 },
      { x: 1276.0896130346232, y: 374.0936863543788 },
      { x: 1277.3930753564155, y: 712.9938900203666 },
      { x: 1.3034623217922607, y: 712.9938900203666 },
    ];

    const shape = scene.add.polygon(0, 0, earthShape, color, alpha);
    shape.setOrigin(0, 0);
    shape.setInteractive();
    shape.on(
      Phaser.Input.Events.POINTER_UP,
      (pointer) => {
        console.log('Pointer up event on the shape');

        // Check if the pointer is inside the polygon
        if (Phaser.Geom.Polygon.Contains(shape.geom, pointer.x, pointer.y)) {
          scene.playAnim(pointer.x, pointer.y, Keys.Animations.DirtBurts);
        }
      },
      scene
    );
    // TODO: Fix shape behavior
    return shape;
  }

  /**
   * Plays a given animation in the scene at a certain clicked position
   * @param {number} x The clicked x position.
   * @param {number} y The clicked y position.
   * @param {string} key The name of the animation to play
   */
  playAnim(x, y, key) {
    const yOffset = 100;
    const invisibleSprite = this.add.sprite(x, y - yOffset, Keys.Assets.Deer, 'deerJump15.png');
    invisibleSprite.setOrigin(0.5, 1);
    invisibleSprite.play(key);

    invisibleSprite.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      invisibleSprite.destroy();
    });
  }

  playBonus() {
    console.log('play bonus round');
    // TODO: implement this and stop time
  }

  /**
   * Transitions to next scene and fades out the camera.
   * @param {Phaser.Scene} nextScene The scene to transition to.
   * @param {boolean} success Determinates if the overall result will be good.
   */
  transitionScenes(success) {
    // https://blog.ourcade.co/posts/2020/phaser-3-fade-out-scene-transition/ Scene change
    this.cameras.main.fadeOut(Settings.Cam_FadeTime);
    this.time.delayedCall(Settings.Cam_FadeTime, () => {
      this.scene.manager.scenes.forEach((scene) => scene.scene.stop());
      this.scene.start(Keys.Scenes.Results, { success });
    });
  }
}
