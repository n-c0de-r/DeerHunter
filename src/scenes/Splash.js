import Phaser from 'phaser';

import * as Keys from '../data/keys';

export default class extends Phaser.Scene {
  constructor() {
    super({ key: Keys.Scenes.Splash });
  }

  preload() {
    //
    // load your assets
    //
    this.load.image('mushroom', 'assets/images/mushroom2.png');
  }

  create() {
    this.scene.start(Keys.Scenes.Game);
  }

  update() {}
}
