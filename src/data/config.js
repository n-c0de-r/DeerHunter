import Phaser from 'phaser';

import Boot from '../scenes/Boot';
import Game from '../scenes/Game';
import Bonus from '../scenes/Bonus';
import Results from '../scenes/Results';
import Splash from '../scenes/Splash';
import UI from '../scenes/UI';

const gameConfig = {
  type: Phaser.AUTO,
  parent: 'content',
  scale: {
    width: 1280,
    height: 720,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    localStorageName: 'deerHunter',
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: true,
    },
  }, // Probably not needed here
  scene: [Boot, Game, Bonus, Results, Splash, UI],
};

export default gameConfig;
