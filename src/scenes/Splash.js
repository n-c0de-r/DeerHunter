import Phaser from 'phaser';

import * as Keys from '../data/keys';

export default class extends Phaser.Scene {
  constructor() {
    super({ key: Keys.Scenes.Splash });
  }

  preload(data) {}

  create(data) {
    this.test = this.add.text(100, 100, 'Splash ', {
      font: `64px ${Keys.UI.Font}`,
      fill: '#7744ff',
    });
  }

  update(time, delta) {}
}
