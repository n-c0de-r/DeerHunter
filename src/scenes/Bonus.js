import Phaser from 'phaser';
import eventManager from '../classes/EventManager';

import * as Keys from '../data/keys';
import Settings from '../data/settings';

import Deer from '../classes/deer';
import Scope from '../classes/scope';

const LEFT_AREA = new Phaser.Geom.Rectangle(100, 500, 540, 150);
const RIGHT_AREA = new Phaser.Geom.Rectangle(540, 500, 540, 150);
const SPAWN_POINTS = { left: { x: -200, y: 600, flip: -1 }, right: { x: 1480, y: 600, flip: 1 } };
const CAMERA_ZOOM = 1;

export default class extends Phaser.Scene {
  constructor() {
    super({ key: Keys.Scenes.Bonus });

    this.isTimeout = false;
  }

  // PHASER BUILT-INS
  init(data) {
    this.dirtANDdeerZone = data.dirtANDdeerZone;

    const background = this.add.image(0, 0, Keys.Assets.Background);
    background.setOrigin(0, 0);
    background.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    this.cameras.main.zoom = CAMERA_ZOOM; // TODO: Fix Camera Zoom

    this.setEvents();
  }

  create(data) {
    this.deer;
    console.log('create ~ this.deer;:', this.deer);
    this.spawnDeer();
    console.log('create ~ this.deer;:', this.deer);

    this.setBonus();
  }

  update(time, delta) {
    Settings.Game_Time -= delta;

    if (Settings.Game_Time > 0) return;
    if (this.isTimeout) return;
    this.transitionScenes();
    this.isTimeout = true;
  }

  // SCENE FUNCTIONS

  setEvents() {
    eventManager.on(
      Keys.Events.hitDeer,
      () => {
        Settings.Count_Of_Deer += 1;
        this.transitionScenes();
      },
      this
    );
  }

  /**
   * Sets input handling for the scene.
   * @param {boolean} isDesktop Checked if the machine is a desktop
   * @param {Phaser.Scene} scene The scene context
   */
  setInputs(isDesktop, scene) {
    if (isDesktop) {
      this.input.on(
        Phaser.Input.Events.POINTER_MOVE,
        (pointer) => {
          this.gun.move(pointer.x / CAMERA_ZOOM, pointer.y / CAMERA_ZOOM);
          this.maskGraphics.x = (pointer.x - this.sys.game.config.width / 2) / CAMERA_ZOOM;
          this.maskGraphics.y = (pointer.y - this.sys.game.config.height / 2) / CAMERA_ZOOM;
        },
        scene
      );

      this.input.on(
        Phaser.Input.Events.POINTER_UP,
        (pointer) => {
          if (Math.abs(pointer.downX - pointer.upX) <= 10 && Math.abs(pointer.downY - pointer.upY) <= 10) {
            this.gun.shoot(pointer.x, pointer.y);
          }
        },
        scene
      );
    } else {
      // On mobiles, "tap" and drag to move
      this.input.on(
        Phaser.Input.Events.POINTER_DOWN,
        () => {
          this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer) => {
            this.gun.move(pointer.x, pointer.y);
            this.maskGraphics.x = (pointer.x - this.sys.game.config.width / 2) / CAMERA_ZOOM;
            this.maskGraphics.y = (pointer.y - this.sys.game.config.height / 2) / CAMERA_ZOOM;
          });
          // Shoot on release
          this.input.on(
            Phaser.Input.Events.POINTER_UP,
            (pointer) => {
              if (Math.abs(pointer.downX - pointer.upX) <= 10 && Math.abs(pointer.downY - pointer.upY) <= 10) {
                this.gun.shoot(pointer.x, pointer.y);
              }
            },
            scene
          );
        },
        scene
      );
    }
  }

  /**
   * Sets up the bonus view
   */
  setBonus() {
    const x = this.sys.game.config.width / 2;
    const y = this.sys.game.config.height / 2;
    this.gun = new Scope(this, x, y);
    // this.gun.setScale(0.5);

    this.mask = this.makeMask(x, y);
    this.overlay = this.makeOverlay(this.mask);
    this.cameras.main.fadeIn(Settings.Cam_FadeTime);
    this.time.delayedCall(Settings.Cam_FadeTime, this.gun.toggleEnabled(true));

    this.setInputs(this.sys.game.device.os.desktop, this);
  }

  /**
   * Sets up an overlay and masks a cutout
   * @param {Phaser.Display.Masks.BitmapMask} mask The mask for the overlay.
   */
  makeOverlay(mask) {
    // https://phaser.io/examples/v3/view/display/masks/graphics-bitmap-mask
    this.overlay = this.add.graphics();

    this.overlay.fillStyle(0x000000).fillRect(0, 0, this.sys.game.config.width, this.sys.game.config.height);

    this.overlay.setMask(mask);
  }

  /**
   * Creates a bitmap mask.
   * @param {number} x X position of the mask.
   * @param {number} y Y position of the mask.
   * @returns {Phaser.Display.Masks.BitmapMask} A phaser bitmap mask
   */
  makeMask(x, y) {
    this.maskGraphics = this.make.graphics();

    this.maskGraphics.fillStyle(0xffffff);
    this.maskGraphics.fillCircle(x, y, this.gun.getBounds().width / 2);

    const mask = new Phaser.Display.Masks.BitmapMask(this, this.maskGraphics);

    mask.invertAlpha = true;
    return mask;
  }

  /**
   * Creates a deer instance at a random point.
   * @returns {Deer} A deer instance
   */
  spawnDeer() {
    const direction = Math.round(Math.random());
    console.log('spawnDeer ~ direction:', direction);
    const spawnPoint = Object.values(SPAWN_POINTS).slice(direction)[0];
    console.log('spawnDeer ~ spawnPoint:', spawnPoint);

    let movePoint;

    if (direction === 1) movePoint = RIGHT_AREA.getRandomPoint();
    if (direction === 0) movePoint = LEFT_AREA.getRandomPoint();
    while (!Phaser.Geom.Polygon.ContainsPoint(this.dirtANDdeerZone, movePoint)) {
      if (direction === 1) movePoint = RIGHT_AREA.getRandomPoint();
      if (direction === 0) movePoint = LEFT_AREA.getRandomPoint();
    }

    this.deer = new Deer(this, spawnPoint.x, spawnPoint.y, spawnPoint.flip, movePoint);
  }

  /**
   * Transitions to next scene and fades out the camera.
   */
  transitionScenes() {
    this.cameras.main.fadeOut(Settings.Cam_FadeTime);
    this.time.delayedCall(Settings.Cam_FadeTime, () => {
      this.scene.manager.stop(Keys.Scenes.Bonus);
      this.scene.start(Keys.Scenes.Results);
    });
  }
}
