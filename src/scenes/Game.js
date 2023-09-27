import Phaser from 'phaser';
import eventManager from '../classes/EventManager';

import * as Keys from '../data/keys';
import Settings from '../data/settings';

import Gun from '../classes/gun';
import Deer from '../classes/deer';

export default class extends Phaser.Scene {
  constructor() {
    super({ key: Keys.Scenes.Game });

    this.timePassed = 0;
  }

  // PHASER BUILT-INS
  init(data) {
    // Only needed once. Loaded separately, before everything else, just in case!
    const background = this.add.image(0, 0, Keys.Assets.Background);
    background.setOrigin(0, 0);
    background.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    // Enables different move behavior depending on device
    // https://phaser.discourse.group/t/check-if-mobile/305/5¡
    this.setInputs(this.sys.game.device.os.desktop, this);

    this.leftZone = this.setDirtZone(0, 310);
    this.rightZone = this.setDirtZone(this.sys.game.config.width / 2, 410);
    this.scene.run(Keys.Scenes.UI);

    this.cameras.main.fadeIn(Settings.Cam_FadeTime);
    // https://blog.ourcade.co/posts/2020/phaser-3-fade-out-scene-transition/ Scene change
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
      this.scene.manager.scenes.forEach((scene) => scene.scene.stop());
      this.scene.start(Keys.Scenes.Splash);
    });

    eventManager.on(Keys.Events.shootGun, (fired) => {
      // TODO: needs fix
      this.deer.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => this.deer.hit, this);
    });
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      eventManager.off(Keys.Events.shootGun);
    });

    eventManager.on(Keys.Events.emptyGun, () => this.cameras.main.fadeOut(Settings.Cam_FadeTime / 2), this);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      eventManager.off(Keys.Events.emptyGun);
    });
  }

  create(data) {
    this.gun = new Gun(this, Settings.Amount_Of_Bullets);

    this.deer = new Deer(this, 400, 300);
    this.deer.setInteractive();
  }

  update(time, delta) {
    this.timePassed += delta;
    if (this.timePassed >= Settings.Game_Time) {
    }
  }

  // SCENE FUNCTIONS

  /**
   * Sets up zones where the dirt animation is played
   * when hitting the ground instead of a deer.
   */
  setDirtZone(x, y) {
    const zone = this.add.zone(x, y, this.sys.game.config.width / 2, this.sys.game.config.height - y);
    zone.setOrigin(0, 0);
    this.physics.add.existing(zone, false);
    zone.body.moves = false;
    zone.setInteractive();
    zone.on(Phaser.Input.Events.POINTER_UP, (pointer) => this.playAnim(pointer.x, pointer.y, Keys.Animations.DirtBurts, this), this);
    //TODO: dirt animation
    return zone;
  }

  /**
   * Sets input handling for the scene.
   * @param {boolean} isDesktop Checked if the machine is a desktop
   * @param {Phaser.Scene} scene The scene context
   */
  setInputs(isDesktop, scene) {
    // https://photonstorm.github.io/phaser3-docs/Phaser.Input.Events.html
    // Desktops don't need drag wrapped around
    if (isDesktop) {
      this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer) => this.gun.move(pointer.x, pointer.y), scene);
      this.input.on(Phaser.Input.Events.POINTER_UP, (pointer) => this.gun.shoot(pointer.x, pointer.y), scene);
    } else {
      // On mobiles, "tap" and drag to move
      this.input.on(
        Phaser.Input.Events.POINTER_DOWN,
        () => {
          this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer) => this.gun.move(pointer.x, pointer.y));
          // Shoot on release
          this.input.on(
            Phaser.Input.Events.POINTER_UP,
            (pointer) => {
              this.gun.shoot(pointer.x, pointer.y);
            },
            scene
          );
        },
        scene
      );
    }
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
