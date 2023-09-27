import Phaser from 'phaser';

import * as Keys from '../data/keys';

export default class extends Phaser.Scene {
  constructor() {
    super({ key: Keys.Scenes.Results });
  }

  preload(data) {}

  create(data) {
    this.test = this.add.text(100, 100, 'Results ', {
      font: `64px ${Keys.UI.Font}`,
      fill: '#7744ff',
    });
  }

  update(time, delta) {}
}
