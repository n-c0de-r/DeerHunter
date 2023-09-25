import Phaser from 'phaser';
import WebFont from 'webfontloader';

import * as Keys from '../data/keys';

import BackgroundImage from '../../assets/sprites/background.jpg';

import UIAtlas from '../../assets/atlas/UI.png';
import UIJson from '../../assets/atlas/UI.json';
import DeerAtlas from '../../assets/atlas/Deer.png';
import DeerJson from '../../assets/atlas/Deer.json';
import EffectsAtlas from '../../assets/atlas/Effects.png';
import EffectsJson from '../../assets/atlas/Effects.json';
import GunAtlas from '../../assets/atlas/Gun.png';
import GunJson from '../../assets/atlas/Gun.json';

export default class Boots extends Phaser.Scene {
  constructor() {
    super({ key: Keys.Scenes.Boot });
  }

  init() {
    this.fontsReady = false;
    this.fontsLoaded = this.fontsLoaded.bind(this);
    this.add.text(100, 100, 'loading fonts...');

    WebFont.load({
      google: {
        families: [Keys.UI.Font],
      },
      active: this.fontsLoaded,
    });
  }

  preload() {
    this.load.image(Keys.Assets.Background, BackgroundImage);

    // Atlases
    this.load.atlas(Keys.Assets.UI, UIAtlas, UIJson);
    this.load.atlas(Keys.Assets.Deer, DeerAtlas, DeerJson);
    this.load.atlas(Keys.Assets.Effects, EffectsAtlas, EffectsJson);
    this.load.atlas(Keys.Assets.Gun, GunAtlas, GunJson);
  }

  update() {
    if (this.fontsReady) {
      this.scene.start(Keys.Scenes.Load);
    }
  }

  fontsLoaded() {
    this.fontsReady = true;
  }
}
