import Phaser from 'phaser';
import eventManager from './EventManager';

import * as Keys from '../data/keys';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  /**
   * Instanciates a a new player object.
   * @param {Phaser.Scene} scene The phase scene this belongs to.
   * @param {number} x The x position to spawn at.
   * @param {number} y The y position to spawn at.
   */
  constructor(scene, x, y) {
    super(scene, (x = scene.sys.game.config.width / 2), (y = scene.sys.game.config.height - 100), Keys.Assets.Gun);
    scene.add.existing(this);

    eventManager.on(Keys.Events.moveGun, this.move, this);
    scene.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      eventManager.off(Keys.Events.moveGun, this.move, this);
    });

    eventManager.on(Keys.Events.shootGun, this.shoot, this);
    scene.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      eventManager.off(Keys.Events.shootGun, this.shoot, this);
    });

    this.setAnims(scene.anims);
  }

  update(time, delta) {}

  /**
   * Moves the gun in a given direction
   * @param {object} direction The direction vector
   */
  move(direction) {
    // TODO: Move implementation
  }

  /**
   * Makes the gun knockback on shot.
   */
  shoot() {
    // TODO: Shoot animation
  }

  /**
   * Sets up all animations of the player
   * @param {Phaser.Animations.AnimationManager} animManager A reference to the global Animation Manager.
   */
  setAnims(animManager) {
    animManager.create({
      key: Keys.Animations.KnockBack,
      frames: animManager.generateFrameNames(Keys.Assets.Gun, {
        prefix: 'Gun',
        start: 1,
        end: 2,
        suffix: '.png',
      }),
      frameRate: 5,
    });

    animManager.create({
      key: Keys.Animations.MuzzleFlash,
      frames: animManager.generateFrameNames(Keys.Assets.Effects, {
        prefix: 'Flash',
        start: 1,
        end: 3,
        suffix: '.png',
      }),
      frameRate: 5,
    });
  }
}
