import Phaser from 'phaser';

import * as Keys from '../data/keys';
// import Settings from '../data/settings';

export default class extends Phaser.Scene {
  constructor() {
    super({ key: Keys.Scenes.Game });
  }

  create() {
    this.add.text(100, 100, Keys.Names.Game, {
      font: `64px ${Keys.UI.Font}`,
      fill: '#7744ff',
    });

    // Only needed once.
    const background = this.add.image(0, 0, Keys.Assets.Background);
    background.setOrigin(0, 0);
    background.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
  }
}
