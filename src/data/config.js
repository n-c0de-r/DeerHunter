import Phaser from 'phaser';

import Boot from '../scenes/Boot';
import Game from '../scenes/Game';
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
    localStorageName: 'pictureHunter',
  },
  // physics: {
  //   default: 'arcade',
  //   arcade: {
  //     gravity: { y: 200 },
  //     // debug: true,
  //   },
  // }, // Probably not needed here
  scene: [Boot, Game, Splash, UI],
};

export default gameConfig;
