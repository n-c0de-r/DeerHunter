import Phaser from 'phaser';

import gameConfig from './data/config';

class Game extends Phaser.Game {
  constructor() {
    super(gameConfig);
  }
}

window.game = new Game();
