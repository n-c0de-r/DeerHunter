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
  { x: 1273, y: 546 },
  { x: 1275, y: 647 },
  { x: 0, y: 647 },
];

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
    this.dirtANDdeerZone = this.setDirtZone(0xff0000, 0.2, this); // TODO: fix dirt animation
    this.deer = this.spawnDeer();

    // this.scene.run(Keys.Scenes.UI, { x: this.deer.x, y: this.deer.y, size: this.deer.body.width * 2 });
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
   * @param {number} color The nuber value of the color to set.
   * @param {number} alpha The value of level of transparency.
   * @param {Phaser.Scene} scene
   * @returns {Phaser.Geom.Polygon}
   */
  setDirtZone(target, color, alpha, scene) {
    // https://phaser.discourse.group/t/how-to-create-a-polygon-dropzone/9846
    const polygon = new Phaser.Geom.Polygon(DEER_AREA);
    this.background.setInteractive();
    // const shape = scene.add.polygon(0, 0, polygon.points, color, alpha);
    // shape.setOrigin(0, 0);

    // shape.setInteractive(polygon, Phaser.Geom.Polygon.ContainsPoint);
    this.background.on(
      Phaser.Input.Events.POINTER_UP,
      (pointer) => {
        // TODO: Fix shape behavior

        // Check if the pointer is inside the polygon
        if (Phaser.Geom.Polygon.ContainsPoint(polygon, pointer)) {
          console.log('Pointer up event on the shape');
          this.playAnim(pointer.x, pointer.y, Keys.Animations.DirtBurts);
        }
      },
      scene
    );

    // https://labs.phaser.io/edit.html?src=src/input\mouse\polygon%20hit%20area.js
    //  Draw the polygon
    const graphics = this.add.graphics({ x: this.background.x - this.background.displayOriginX, y: this.background.y - this.background.displayOriginY });

    graphics.lineStyle(2, 0x00aa00);

    graphics.beginPath();

    graphics.moveTo(polygon.points[0].x, polygon.points[0].y);

    for (let i = 1; i < polygon.points.length; i++) {
      graphics.lineTo(polygon.points[i].x, polygon.points[i].y);
    }

    graphics.closePath();
    graphics.strokePath();
    return polygon;
  }

  /**
   * Creates a deer instance at a random point.
   * @returns {Deer} A deer instance
   */
  spawnDeer() {
    if (Settings.Count_Of_Deer >= 3) return;

    // https://phaser.io/examples/v3/view/geom/rectangle/get-random-point - not a zone... ok
    const spawnPoint = this.physics.world.bounds.getRandomPoint(); // TODO: fix spawn position
    return new Deer(this, spawnPoint.x, spawnPoint.y, this.dirtANDdeerZone);
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
      this.scene.start(nextScene);
    });
  }
}
