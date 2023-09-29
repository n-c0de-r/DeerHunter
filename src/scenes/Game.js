import Phaser from 'phaser';
import eventManager from '../classes/EventManager';

import * as Keys from '../data/keys';
import Settings from '../data/settings';

import Deer from '../classes/deer';

// Predefined by script
const DEER_AREA = [
  { x: 0, y: 517 },
  { x: 269, y: 523 },
  { x: 468, y: 411 },
  { x: 763, y: 579 },
  { x: 940, y: 581 },
  { x: 1027, y: 501 },
  { x: 1275, y: 547 },
  { x: 0, y: 547 },
];

const SPAWN_POINTS = { left: { x: -200, y: 600, flip: -1 }, right: { x: 1480, y: 600, flip: 1 } };
const LEFT_AREA = new Phaser.Geom.Rectangle(100, 500, 540, 150);
const RIGHT_AREA = new Phaser.Geom.Rectangle(540, 500, 540, 150);
const FIRST_POSITION = new Phaser.Geom.Point({ x: 624, y: 534 });

export default class extends Phaser.Scene {
  constructor() {
    super({ key: Keys.Scenes.Game });

    this.isTimeout = false;
  }

  // PHASER BUILT-INS
  init(data) {
    // Only needed once. Loaded separately, before everything else, just in case!
    this.background = this.add.image(0, 0, Keys.Assets.Background);
    this.background.setOrigin(0, 0);
    this.background.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
  }

  create(data) {
    this.dirtANDdeerZone = this.setDirtZone(0xff0000, 0.2, this);
    this.deer = undefined;
    this.spawnDeer(FIRST_POSITION);
    this.deer.isTutorialDeer = true;

    this.cameras.main.fadeIn(Settings.Cam_FadeTime);

    this.setEvents();
  }

  update(time, delta) {
    Settings.Game_Time -= delta;

    if (Settings.Game_Time > 0) return;
    if (this.isTimeout) return;
    eventManager.emit(Keys.Events.emptyGun);
    this.transitionScenes();
    this.isTimeout = true;
  }

  // SCENE FUNCTIONS

  setEvents() {
    // For making the spawn shape
    // this.input.on(
    //   Phaser.Input.Events.POINTER_UP,
    //   (pointer) => {
    //     this.poly.push({ x: Math.round(pointer.x), y: Math.round(pointer.y) });
    //     console.log('setEvents ~ this.poly:', this.poly);
    //   },
    //   this
    // );

    eventManager.on(Keys.Events.hitDeer, this.spawnDeer, this);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      eventManager.off(Keys.Events.hitDeer, this.spawnDeer, this);
    });

    eventManager.on(Keys.Events.runDeer, this.spawnDeer, this);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      eventManager.off(Keys.Events.runDeer, this.spawnDeer, this);
    });

    eventManager.on(
      Keys.Events.firstDeer,
      () => {
        this.scene.run(Keys.Scenes.UI, { target: this.deer });
      },
      this
    );
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      eventManager.off(Keys.Events.firstDeer, () => {}, this);
    });

    eventManager.on(Keys.Events.emptyGun, this.transitionScenes, this);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      eventManager.off(Keys.Events.emptyGun, this.transitionScenes, this);
    });

    eventManager.on(
      Keys.Events.playBonus,
      () => {
        eventManager.off(Keys.Events.hitDeer, this.spawnDeer, this);
        this.transitionScenes(Keys.Scenes.Bonus);
      },
      this
    );
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      eventManager.off(Keys.Events.playBonus, this.playBonus, this);
    });
  }

  /**
   * Sets up zone where the dirt animation is played
   * when hitting the ground instead of a deer.
   * @param {Phaser.Scene} scene
   * @returns {Phaser.Geom.Polygon}
   */
  setDirtZone(scene) {
    // https://phaser.discourse.group/t/how-to-create-a-polygon-dropzone/9846
    // https://labs.phaser.io/edit.html?src=src/input\mouse\polygon%20hit%20area.js
    const polygon = new Phaser.Geom.Polygon(DEER_AREA);
    this.background.setInteractive();
    this.background.on(
      Phaser.Input.Events.POINTER_UP,
      (pointer) => {
        // Check if the pointer is inside the polygon
        if (Phaser.Geom.Polygon.ContainsPoint(polygon, pointer)) {
          this.playAnim(pointer.x, pointer.y, Keys.Animations.DirtBurts);
        }
      },
      scene
    );

    return polygon;
  }

  /**
   * Creates a deer instance at a random point.
   * @param {Phaser.Geom.Point} moveTo The point to move to, otherwise random.
   * @returns {Deer} A deer instance
   */
  spawnDeer(moveTo) {
    if (Settings.Count_Of_Deer >= 3) return;

    const direction = Math.round(Math.random());
    const spawnPoint = Object.values(SPAWN_POINTS).slice(direction)[0];
    // https://phaser.io/examples/v3/view/geom/rectangle/get-random-point - not a zone... ok
    if (direction === 1) moveTo = RIGHT_AREA.getRandomPoint();
    if (direction === 0) moveTo = LEFT_AREA.getRandomPoint();
    while (!Phaser.Geom.Polygon.ContainsPoint(this.dirtANDdeerZone, moveTo)) {
      if (direction === 1) moveTo = RIGHT_AREA.getRandomPoint();
      if (direction === 0) moveTo = LEFT_AREA.getRandomPoint();
    }

    this.deer = new Deer(this, spawnPoint.x, spawnPoint.y, spawnPoint.flip, moveTo);
  }

  /**
   * Plays a given animation in the scene at a certain clicked position
   * @param {number} x The clicked x position.
   * @param {number} y The clicked y position.
   * @param {string} key The name of the animation to play
   */
  playAnim(x, y, key) {
    const yOffset = 100;
    const invisibleSprite = this.add.sprite(x, y - yOffset, Keys.Assets.Deer, 'Deer15.png');
    invisibleSprite.setOrigin(0.5, 1);
    invisibleSprite.play(key);

    invisibleSprite.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      invisibleSprite.destroy();
    });
  }

  /**
   * Transitions to next scene and fades out the camera.
   * @param {Phaser.Scene} nextScene The scene to transition to..
   */
  transitionScenes(nextScene = Keys.Scenes.Results) {
    // https://blog.ourcade.co/posts/2020/phaser-3-fade-out-scene-transition/ Scene change
    this.cameras.main.fadeOut(Settings.Cam_FadeTime);
    this.time.delayedCall(Settings.Cam_FadeTime, () => {
      this.scene.manager.stop(Keys.Scenes.Game);
      this.scene.manager.stop(Keys.Scenes.UI);
      this.scene.start(nextScene, { dirtANDdeerZone: this.dirtANDdeerZone });
    });
  }
}
