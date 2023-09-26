import Phaser from 'phaser';
import WebFont from 'webfontloader';

import * as Keys from '../data/keys';
import Settings from '../data/settings';

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

  init(data) {
    // Enables different move behavior depending on device
    // https://phaser.discourse.group/t/check-if-mobile/305/5
    if (this.sys.game.device.os.desktop) {
      Settings.Is_Desktop = true;
    } else {
      Settings.Is_Desktop = false;
    }

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

  preload(data) {
    this.load.image(Keys.Assets.Background, BackgroundImage);

    // Atlases
    this.load.atlas(Keys.Assets.UI, UIAtlas, UIJson);
    this.load.atlas(Keys.Assets.Deer, DeerAtlas, DeerJson);
    this.load.atlas(Keys.Assets.Effects, EffectsAtlas, EffectsJson);
    this.load.atlas(Keys.Assets.Gun, GunAtlas, GunJson);
  }

  create(data) {
    this.setAnims(this.anims);
  }

  update(time, delta) {
    if (this.fontsReady) {
      this.scene.start(Keys.Scenes.Game);
    }
  }

  fontsLoaded() {
    this.fontsReady = true;
  }

  /**
   * Sets up all animations as they are global anyway.
   * @param {Phaser.Animations.AnimationManager} animManager A reference to the global Animation Manager.
   */
  setAnims(animManager) {
    animManager.create({
      key: Keys.Animations.KnockBack,
      frames: animManager.generateFrameNames(Keys.Assets.Gun, {
        prefix: 'Gun',
        start: 2,
        end: 1,
        suffix: '.png',
      }),
      frameRate: 3,
    });

    animManager.create({
      key: Keys.Animations.MuzzleFlash,
      frames: animManager.generateFrameNames(Keys.Assets.Effects, {
        prefix: 'Flash',
        start: 1,
        end: 3,
        suffix: '.png',
      }),
      frameRate: 5,
    });
  }
}
