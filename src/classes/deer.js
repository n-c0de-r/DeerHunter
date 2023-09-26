import Phaser from 'phaser';
import eventManager from './EventManager';

import * as Keys from '../data/keys';

export default class Deer extends Phaser.Physics.Arcade.Sprite {
  /**
   * Instanciates a a new deer object.
   * @param {Phaser.Scene} scene The phase scene this belongs to.
   * @param {number} x The x position to spawn at.
   * @param {number} y The y position to spawn at.
   */
  constructor(scene, x, y) {
    super(scene, x, y, Keys.Assets.Deer, 'deerJump15.png');
    scene.add.existing(this);
    this.isAlive = true;
  }

  setHitListener(event) {
    this.setInteractive();
    this.on(event, () => console.log('hey'), this.scene);
  }

  hit(kill) {
    console.log(kill);
    // TODO: kill animation
  }
}
