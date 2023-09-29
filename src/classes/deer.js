import Phaser from 'phaser';
import eventManager from './EventManager';

import * as Keys from '../data/keys';
import Settings from '../data/settings';

const HIT_BOX_SIZE = 128;
const JUMP_DISTANCE = 200;

export default class Deer extends Phaser.Physics.Arcade.Sprite {
  /**
   * Instanciates a a new deer object.
   * @param {Phaser.Scene} scene The phase scene this belongs to.
   * @param {number} x The x position to spawn at.
   * @param {number} y The y position to spawn at.
   * @param {Phaser.Geom.Point} movePoint The point the deer will move to.
   */
  constructor(scene, x, y, direction, movePoint) {
    super(scene, x, y, Keys.Assets.Deer, 'Deer15.png');
    scene.add.existing(this);
    scene.physics.world.enable(this);

    this.spawnPoint = { x, y };
    this.movePoint = movePoint;
    this.scaleX = direction;

    this.isTutorialDeer = false;
    this.movedDistance = 0;
    this.totalDistance = Phaser.Math.Distance.BetweenPoints(this.movePoint, this);

    this.resetHitBounds();
    this.setHitListener();
    this.jump();
  }

  resetHitBounds() {
    // https://www.html5gamedevs.com/topic/4227-decrease-collision-box-size/
    this.body.setSize(HIT_BOX_SIZE, HIT_BOX_SIZE);
    if (this.scaleX === -1) this.body.offset.x *= 2;
  }

  setHitListener() {
    this.setInteractive();
    eventManager.on(Keys.Events.shootGun, this.hit, this);
    this.scene.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      eventManager.off(Keys.Events.shootGun, this.hit, this);
    });

    eventManager.on(Keys.Events.shootScope, this.hit, this);
    this.scene.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      eventManager.off(Keys.Events.shootScope, this.hit, this);
    });
  }

  jump() {
    const distanceRemaining = this.totalDistance - this.movedDistance;
    let newX = 0;
    let newY = 0;

    if (distanceRemaining > JUMP_DISTANCE) {
      // Calculate the ratio of how far the object should move
      const ratio = JUMP_DISTANCE / this.totalDistance;

      // Calculate the new position based on the ratio
      newX = this.x + (this.movePoint.x - this.x) * ratio;
      newY = this.y + (this.movePoint.y - this.y) * ratio;
      this.movedDistance += JUMP_DISTANCE;
    } else {
      newX = this.movePoint.x;
      newY = this.movePoint.y;
    }

    this.play(Keys.Animations.DeerJump);
    this.scene.tweens.add({
      targets: this,
      x: newX,
      y: newY,
      duration: 800,
      onComplete: () => {
        if (distanceRemaining > JUMP_DISTANCE) {
          this.jump();
        } else if (this.isTutorialDeer) {
          eventManager.emit(Keys.Events.firstDeer);
        }
      },
    });
  }

  hit(x, y) {
    if (!Phaser.Geom.Rectangle.Contains(this.body, x, y)) {
      if (this.isTutorialDeer) return;
      this.scaleX *= -1; // Rotate
      // Set target point to start point and recalculate distance
      this.movePoint = this.spawnPoint;
      this.movedDistance = 0;
      this.totalDistance = Phaser.Math.Distance.BetweenPoints(this.movePoint, this);

      this.jump();
      this.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + Keys.Animations.DeerJump, () => {
        eventManager.emit(Keys.Events.runDeer);
        this.remove();
      });
    } else {
      eventManager.emit(Keys.Events.hitDeer);
      this.remove();
    }
    eventManager.off(Keys.Events.shootGun, this.hit, this);
  }

  remove() {
    if (Settings.Blood) {
      this.play(Keys.Animations.BloodSplash);
      this.on(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + Keys.Animations.BloodSplash, this.destroy);
    } else {
      this.scene.tweens.add({
        targets: this,
        tint: 0xff0000,
        alpha: 0,
        duration: 1000,
        ease: 'Quad.easeOut',
        onComplete: () => {
          this.destroy();
        },
      });
    }
  }
}
