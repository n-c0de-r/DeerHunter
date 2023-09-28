import Phaser from 'phaser';
import eventManager from './EventManager';

import * as Keys from '../data/keys';

const MIDPOINT = { x: 0, y: 0 };
const KNOCKBACK_DELAY = 500;

export default class Scope extends Phaser.Physics.Arcade.Sprite {
  /**
   * Instanciates a a new gun object.
   * @param {Phaser.Scene} scene The phase scene this belongs to.
   */
  constructor(scene, x, y) {
    super(scene, x, y, Keys.Assets.UI, Keys.UI.Scope);
    scene.add.existing(this);

    MIDPOINT.x = this.x;
    MIDPOINT.y = this.y;
    this.name = Keys.UI.Scope;
  }

  /**
   * Toggles if the scope is interactable
   * @param {boolean} state Sets the interactivity on or off.
   */
  toggleEnabled(state) {
    this.isEnabled = state;
  }

  /**
   * Moves the scope in a given direction.
   * @param {number} x The mouse's x position on screen
   * @param {number} y The mouse's y position on screen
   */
  move(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Executes a shot at a clicked point and messages
   * this to all affected classes and scenes.
   * @param {number} x Target point's x coordinate
   * @param {number} y Target point's y coordinate
   */
  shoot(x, y) {
    if (!this.isEnabled) return;

    eventManager.emit(Keys.Events.shootGun, x, y);
  }
}
