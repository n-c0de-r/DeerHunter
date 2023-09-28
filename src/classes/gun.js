import Phaser from 'phaser';
import eventManager from './EventManager';

import * as Keys from '../data/keys';

const MIDPOINT = { x: 0, y: 0 };
const MOVE_RANGE = 50;

export default class Gun extends Phaser.Physics.Arcade.Sprite {
  /**
   * Instanciates a a new gun object.
   * @param {Phaser.Scene} scene The phase scene this belongs to.
   */
  constructor(scene) {
    super(scene, scene.sys.game.config.width / 2, scene.sys.game.config.height - MOVE_RANGE, Keys.Assets.Gun, 'Gun1.png');
    scene.add.existing(this);

    MIDPOINT.x = this.x; //scene.sys.game.config.width / 2;
    MIDPOINT.y = this.y; //scene.sys.game.config.height - MOVE_RANGE;
    this.isReloading = false;
  }

  /**
   * Toggles if the gun is interactable
   * @param {boolean} state Sets the interactivity on or off.
   */
  toggleEnabled(state) {
    this.isEnabled = state;
  }

  /**
   * Sets the number of available shots
   * @param {number} amount The number of bullets you can shoot
   */
  setBullets(amount) {
    this.bullets = amount;
  }

  /**
   * Moves the gun in a given direction within a range.
   * If a certain threshold (mid screen) is stepped over,
   * also flips the image by negative scaling.
   * @param {number} x The mouse's x position on screen
   * @param {number} y The mouse's y position on screen
   */
  move(x, y) {
    if (!this.isEnabled) return;

    // Power of Math :P
    const xPercent = (x - MIDPOINT.x) / MIDPOINT.x;
    const yPercent = (y - MIDPOINT.y) / MIDPOINT.y;
    const xScale = -Math.sign(xPercent); // Gets the reversed direction

    this.x = xPercent * MOVE_RANGE * 4 + MIDPOINT.x;
    this.y = yPercent * MOVE_RANGE + MIDPOINT.y;

    this.setScale(xScale, 1); // Flips the image with math :P
  }

  /**
   * Makes the gun knockback on shot.
   */

  /**
   * Executes a shot at a clicked point and messages
   * this to all affected classes and scenes.
   * @param {number} x Target point's x coordinate
   * @param {number} y Target point's y coordinate
   */
  shoot(x, y) {
    if (!this.isEnabled) return;

    if (!this.isReloading && this.bullets > 0) {
      this.bullets -= 1;
      this.play(Keys.Animations.KnockBack);
      this.isReloading = true;

      eventManager.emit(Keys.Events.shootGun, x, y);
      // https://blog.ourcade.co/posts/2020/phaser-3-fade-out-scene-transition/ DELAY
      this.scene.time.delayedCall(1000, () => {
        if (this.bullets <= 0) eventManager.emit(Keys.Events.emptyGun);
        this.isReloading = false;
      });
    }
  }
}
