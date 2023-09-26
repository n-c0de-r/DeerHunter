import Phaser from 'phaser';
import eventManager from './EventManager';

import * as Keys from '../data/keys';
import Settings from '../data/settings';

const MIDPOINT = { x: 0, y: 0 };
const MOVE_RANGE = 50;

export default class GUN extends Phaser.Physics.Arcade.Sprite {
  /**
   * Instanciates a a new player object.
   * @param {Phaser.Scene} scene The phase scene this belongs to.
   * @param {number} x The x position to spawn at.
   * @param {number} y The y position to spawn at.
   */
  constructor(scene, x, y) {
    super(scene, (x = scene.sys.game.config.width / 2), (y = scene.sys.game.config.height - MOVE_RANGE), Keys.Assets.Gun, 'Gun1.png');
    scene.add.existing(this);

    MIDPOINT.x = scene.sys.game.config.width / 2;
    MIDPOINT.y = scene.sys.game.config.height - MOVE_RANGE;
    this.bullets = Settings.Amount_Of_Bullets;
    this.isReloading = false;
  }

  /**
   * Moves the gun in a given direction within a range.
   * If a certain threshold (mid screen) is stepped over,
   * also flips the image by negative scaling.
   * @param {number} x The mouse's x position on screen
   * @param {number} y The mouse's y position on screen
   */
  move(x, y) {
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
    if (!this.isReloading && this.bullets > 0) {
      // this.bullets -= 1;
      this.play(Keys.Animations.KnockBack);
      this.isReloading = true;
      console.log('bang');
      // https://blog.ourcade.co/posts/2020/phaser-3-fade-out-scene-transition/ DELAY
      this.scene.time.delayedCall(1000, () => {
        this.isReloading = false;
      });
    }
  }
}
