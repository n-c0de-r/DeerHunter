import Phaser from 'phaser';

import * as Keys from '../data/keys';
import Settings from '../data/settings';

const URL = 'https://play.google.com/store/apps/details?id=com.glu.deerhunt16&pli=1';

export default class extends Phaser.Scene {
  constructor() {
    super({ key: Keys.Scenes.Splash });
  }

  init(data) {
    const background = this.add.image(0, 0, Keys.Assets.Background);
    background.setOrigin(0, 0);
    background.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
    this.logo = this.add.image(this.sys.game.config.width / 2, this.sys.game.config.height / 2, Keys.Assets.UI, Keys.UI.Logo);
    this.logo.setScale(0);

    this.dog = this.add.image(-300, this.sys.game.config.height / 2, Keys.Assets.UI, Keys.UI.Dog);
    this.deer = this.add.image(this.sys.game.config.width + 300, this.sys.game.config.height / 2, Keys.Assets.UI, Keys.UI.Deer);

    this.button = this.add.image(0, 0, Keys.Assets.UI, Keys.UI.ButtonAgain);
    this.button.scaleX = 1.5;
    // https://phaser.io/examples/v3/view/input/pointer/external-link
    this.button.setInteractive();
    this.button.on(Phaser.Input.Events.POINTER_UP, () => window.open(URL, '_blank'), this);
    this.buttonText = this.add.text(0, 0, 'Play NOW ', {
      font: `48px ${Keys.UI.Font}`,
      fill: '#000000',
    });
    this.buttonText.setOrigin(0.5);

    this.buttonContainer = this.add.container(this.sys.game.config.width / 2, (this.sys.game.config.height * 3) / 4, [this.button, this.buttonText]);
    this.buttonContainer.setSize(400, 100);
    this.buttonContainer.setScale(0);
  }

  create(data) {
    this.cameras.main.fadeIn(Settings.Cam_FadeTime);
    this.time.delayedCall(Settings.Cam_FadeTime, () => this.displayElements());
  }

  /**
   * Displays the elements on the final page, one by one with tweens.
   */
  displayElements() {
    this.tweens.chain({
      tweens: [
        {
          targets: this.logo,
          alpha: { from: 0, to: 1 },
          scale: 1,
          duration: 500,
        },
        {
          targets: this.buttonContainer,
          alpha: { from: 0, to: 1 },
          scale: 1.5,
          duration: 500,
        },
        {
          targets: this.buttonContainer,
          scale: 1,
          duration: 1000,
          yoyo: true,
          repeat: -1,
        },
      ],
    });
    this.tweens.add({
      targets: this.dog,
      x: 150,
      duration: 500,
    });
    this.tweens.add({
      targets: this.deer,
      x: 1090,
      duration: 500,
    });
  }
}
