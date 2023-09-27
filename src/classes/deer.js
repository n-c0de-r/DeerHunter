import Phaser from 'phaser';
import eventManager from './EventManager';

import * as Keys from '../data/keys';

const HIT_BOX_SIZE = 128;

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
    scene.physics.world.enable(this);
    this.isAlive = true;
    this.resetHitBounds();
    this.setHitListener();
  }

  resetHitBounds() {
    // https://www.html5gamedevs.com/topic/4227-decrease-collision-box-size/
    this.body.setSize(HIT_BOX_SIZE, HIT_BOX_SIZE);
  }

  setHitListener() {
    this.setInteractive();
    eventManager.on(Keys.Events.shootGun, this.hit, this);
    this.scene.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      eventManager.off(Keys.Events.shootGun, this.hit, this);
    });
  }

  hit(x, y) {
    if (!Phaser.Geom.Rectangle.Contains(this.body, x, y)) return;

    this.play(Keys.Animations.BloodSplash);
    eventManager.emit(Keys.Events.hitDeer);
    this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      eventManager.off(Keys.Events.shootGun, this.hit, this);
      this.destroy();
    });
  }
}
