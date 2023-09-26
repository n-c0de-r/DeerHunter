import Phaser from 'phaser';
import eventManager from '../classes/EventManager';

import * as Keys from '../data/keys';
import Settings from '../data/settings';

import Gun from '../classes/gun';

export default class extends Phaser.Scene {
  constructor() {
    super({ key: Keys.Scenes.Game });

    this.timePassed = 0;
    this.gameOver = false;
  }

  // PHASER BUILT-INS
  init(data) {
    // Only needed once. Loaded separately, before everything else, just in case!
    const background = this.add.image(0, 0, Keys.Assets.Background);
    background.setOrigin(0, 0);
    background.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    this.setDirtZones();
    this.scene.run(Keys.Scenes.UI);

    this.cameras.main.fadeIn(Settings.Cam_FadeTime);
  }

  create(data) {
    this.gun = new Gun(this);

    // https://blog.ourcade.co/posts/2020/phaser-3-fade-out-scene-transition/ Scene change
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
      this.scene.start(Keys.Scenes.Splash);
    });

    // https://photonstorm.github.io/phaser3-docs/Phaser.Input.Events.html
    // Desktops don't need drag wrapped around
    if (Settings.Is_Desktop) {
      this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer) => this.gun.move(pointer.x, pointer.y));
      this.input.on(Phaser.Input.Events.POINTER_UP, (pointer) => this.gun.shoot(pointer.x, pointer.y));
    } else {
      // On mobiles, "tap" and drag to move
      this.input.on(Phaser.Input.Events.POINTER_DOWN, () => {
        this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer) => this.gun.move(pointer.x, pointer.y));
      });
      this.input.on(Phaser.Input.Events.POINTER_UP, (pointer) => {
        this.gun.move(pointer.x, pointer.y);
        this.gun.shoot(pointer.x, pointer.y);
      });
    }
  }

  update(time, delta) {
    this.timePassed += delta;
    if (!this.gameOver && this.timePassed >= Settings.Game_Time) {
      this.gameOver = true;
      // this.cameras.main.fadeOut(Settings.Cam_FadeTime); // TODO: activate when finished
    }
  }

  // SCENE FUNCTIONS

  /**
   * Sets up two zones, where the dirt animation is played
   * when hitting the ground instead of a deer.
   */
  setDirtZones() {
    const leftOffset = 310;
    const rightOffset = 410;

    this.leftZone = this.add.zone(0, leftOffset, this.sys.game.config.width / 2, this.sys.game.config.height - leftOffset);
    this.leftZone.setOrigin(0, 0);
    this.physics.add.existing(this.leftZone, false);
    this.leftZone.body.moves = false;

    this.rightZone = this.add.zone(this.sys.game.config.width / 2, rightOffset, this.sys.game.config.width / 2, this.sys.game.config.height - rightOffset);
    this.rightZone.setOrigin(0, 0);
    this.physics.add.existing(this.rightZone, false);
    this.rightZone.body.moves = false;
  }
}
