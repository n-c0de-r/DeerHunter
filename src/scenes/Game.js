import Phaser from 'phaser';
import eventManager from '../classes/EventManager';

import * as Keys from '../data/keys';
import Settings from '../data/settings';

import Gun from '../classes/gun';

export default class extends Phaser.Scene {
  constructor() {
    super({ key: Keys.Scenes.Game });

    this.timePassed = 0;
    this.gameOver = false;
  }

  // PHASER BUILT-INS
  init(data) {
    // Only needed once. Loaded separately, before everything else, just in case!
    const background = this.add.image(0, 0, Keys.Assets.Background);
    background.setOrigin(0, 0);
    background.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
    // this.scene.run(Keys.Scenes.UI);

    this.cameras.main.fadeIn(Settings.Cam_FadeTime);
  }

  create(data) {
    // https://blog.ourcade.co/posts/2020/phaser-3-fade-out-scene-transition/ Scene change
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
      this.scene.start(Keys.Scenes.Splash);
    });

    this.gun = new Gun(this, 0, 0);
  }

  update(time, delta) {
    this.timePassed += delta;
    if (!this.gameOver && this.timePassed >= Settings.Game_Time) {
      this.gameOver = true;
      this.cameras.main.fadeOut(Settings.Cam_FadeTime);
    }
  }
}
