import Phaser from 'phaser';
// import eventManager from '../classes/EventManager';
import * as Keys from '../data/keys';

// const DIRECTIONS = { left: -1, right: 1, none: 0 }; // possible move directions, abstracted
// const SCORE = {
//   count: 0,
//   text: 'Score: ',
//   size: 32,
//   color: '#000',
// };

// const TIME = {
//   count: 0,
//   exact: 0,
//   text: 'Time: ',
//   size: 32,
//   color: '#000',
// };

export default class UI extends Phaser.Scene {
  constructor() {
    super({ key: Keys.Scenes.UI });
  }

  init(data) {
    //   SCORE.count = 0;
    //   TIME.count = 0;
    //   TIME.exact = 0;
    //   this.cursors = this.input.keyboard.createCursorKeys();
    //   // according to https://newdocs.phaser.io/docs/3.52.0/focus/Phaser.Input.Keyboard.KeyboardPlugin-addKeys
    //   this.wsad = this.input.keyboard.addKeys("W, S, A, D, SPACE");
    //   this.scoreDisplay = this.add.text(16, 16, SCORE.text + SCORE.count, {
    //     fontFamily: Keys.UI.Font,
    //     fontSize: `${SCORE.size}px`,
    //     color: SCORE.color,
    //   });
    //   this.SecondText = this.add.text(
    //     this.sys.game.config.width - 16,
    //     16,
    //     TIME.text + TIME.count,
    //     {
    //       fontFamily: Keys.UI.Font,
    //       fontSize: `${TIME.size}px`,
    //       color: TIME.color,
    //       align: "right",
    //     }
    //   );
    //   this.SecondText.setOrigin(1, 0);
    //   // Following https://blog.ourcade.co/posts/2020/phaser3-how-to-communicate-between-scenes/
    //   // listen to 'update-score' event and call `updateScore()` when it fires
    //   eventManager.on(Keys.Events.updateScore, this.updateScore, this);
    //   // clean up when Scene is shutdown
    //   this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
    //     eventManager.off(Keys.Events.updateScore);
    //   });
    //   eventManager.on(Keys.Events.playerHurt, this.updateHealth, this);
    //   this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
    //     eventManager.off(Keys.Events.playerHurt);
    //   });
    //   eventManager.on(Keys.Events.gameOver, this.runGameOver, this);
    //   this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
    //     eventManager.off(Keys.Events.gameOver);
    //   });
    //   eventManager.on(
    //     Keys.Events.spawnBomb,
    //     (scene) => {
    //       const x =
    //         scene.player.x < this.sys.game.config.width / 2
    //           ? Phaser.Math.Between(
    //               this.sys.game.config.width / 2,
    //               this.sys.game.config.width
    //             )
    //           : Phaser.Math.Between(0, this.sys.game.config.width / 2);
    //       this.spawn(Bomb, scene, x, 16);
    //     },
    //     this
    //   );
    //   this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
    //     eventManager.off(Keys.Events.spawnBomb);
    //   });
    //   eventManager.on(
    //     Keys.Events.spawnBigBomb,
    //     (scene) => {
    //       const x =
    //         scene.player.x < this.sys.game.config.width / 2
    //           ? Phaser.Math.Between(0, this.sys.game.config.width / 2)
    //           : Phaser.Math.Between(
    //               this.sys.game.config.width / 2,
    //               this.sys.game.config.width
    //             );
    //       const y =
    //         scene.player.y < this.sys.game.config.height / 2
    //           ? Phaser.Math.Between(0, this.sys.game.config.height / 2)
    //           : Phaser.Math.Between(
    //               this.sys.game.config.height / 2,
    //               this.sys.game.config.height
    //             );
    //       this.spawn(BigBomb, scene, x, y);
    //     },
    //     this
    //   );
    //   this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
    //     eventManager.off(Keys.Events.spawnBigBomb);
    //   });
  }

  create() {
    const huntBack = this.add.nineslice(0, 0, Keys.Assets.UI, Keys.UI.CountContainer, 400, 200, 16, 16, 16, 16);

    const huntEmpty = this.add.group({
      key: Keys.Assets.UI,
      frame: Keys.UI.CountNegative,
      repeat: 2,
      setXY: { x: 48, y: 72, stepX: 72 },
    });

    this.huntFull = this.add.group({
      key: Keys.Assets.UI,
      frame: Keys.UI.CountPositive,
      repeat: 2,
      setXY: { x: 48, y: 72, stepX: 72 },
    });

    this.huntContainer = this.add.container(0, 0, [huntBack, huntEmpty, this.huntFull]);
  }

  //   this.anims.create({
  //     key: Keys.Assets.Explosion,
  //     frames: this.anims.generateFrameNumbers(Keys.Assets.Explosion, {
  //       start: 0,
  //       end: 5,
  //     }),
  //   });

  //   this.anims.create({
  //     key: Keys.Assets.BigBomb,
  //     frames: this.anims.generateFrameNames(Keys.Assets.BigBomb, {
  //       prefix: "Cosmic_2",
  //       start: 1,
  //       end: 5,
  //       suffix: ".png",
  //     }),
  //     frameRate: 1,
  //   });

  //   this.anims.create({
  //     key: Keys.Assets.BigBang,
  //     frames: this.anims.generateFrameNames(Keys.Assets.BigBang, {
  //       prefix: "Cosmic_",
  //       start: 16,
  //       end: 20,
  //       suffix: ".png",
  //     }),
  //     frameRate: 10,
  //   });
  // }

  // /**
  //  * The actual game loop, handling all the updates.
  //  */
  // update(time, delta) {
  //   TIME.exact += delta;
  //   TIME.count = Math.round(TIME.exact / 1000);
  //   this.SecondText.setText(TIME.text + TIME.count);

  //   if (this.cursors.left.isDown || this.wsad.A.isDown) {
  //     eventManager.emit(Keys.Events.movePlayer, DIRECTIONS.left);
  //   } else if (this.cursors.right.isDown || this.wsad.D.isDown) {
  //     eventManager.emit(Keys.Events.movePlayer, DIRECTIONS.right);
  //   } else {
  //     eventManager.emit(Keys.Events.movePlayer, DIRECTIONS.none);
  //   }

  //   if (
  //     this.cursors.up.isDown ||
  //     this.wsad.W.isDown ||
  //     this.wsad.SPACE.isDown /* && this.player.sprite.body.touching.down */
  //   ) {
  //     eventManager.emit(Keys.Events.jumpPlayer);
  //   }
  // }

  // /**
  //  * Updates the score counter by given value.
  //  * @param {number} points
  //  */
  // updateScore(points) {
  //   SCORE.count += points;
  //   this.scoreDisplay.setText(SCORE.text + SCORE.count);
  // }

  // /**
  //  * Updates the health as messaged by the player
  //  * @param {number} amount Number of hearts to change
  //  */
  // updateHealth(amount) {
  //   for (let index = Math.abs(amount); index > 0; index--) {
  //     if (amount > 0) {
  //       const child = this.hearts.getFirstDead();
  //       this.tweens.add({
  //         targets: child,
  //         alpha: 100,
  //         scale: 1,
  //         duration: 500,
  //         ease: "Quad.easeIn",
  //       });
  //       child.setActive(true);
  //     } else {
  //       const child = this.hearts.getLast(true);
  //       if (!child) return;
  //       this.tweens.add({
  //         targets: child,
  //         alpha: 0,
  //         scale: 0,
  //         duration: 500,
  //         ease: "Quad.easeOut",
  //       });
  //       child.setActive(false);
  //     }
  //   }
  // }

  // /**
  //  * Stops all other scenes and runs Game Over
  //  */
  // runGameOver() {
  //   // Stop all scenes!
  //   this.scene.manager.scenes.forEach((scene) => {
  //     scene.scene.stop();
  //   });
  //   this.sound.stopAll();
  //   // Carry values over as data in init()
  //   this.scene.run(Keys.Scenes.Over, {
  //     finalScore: SCORE.count,
  //     finalTime: TIME.count,
  //   });
  // }

  // /**
  //  * Spawns a phaser arcade object to the scene
  //  * @param {Phaser.Physics.Arcade.Sprite} Item The Item to spawn
  //  * @param {Phaser.Scene} scene The scene to spawn at
  //  */
  // spawn(Item, scene, x, y) {
  //   new Item(scene, x, y);
  // }
}
