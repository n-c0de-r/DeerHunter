import Phaser from 'phaser';

import * as Keys from '../data/keys';
import Settings from '../data/settings';

const MESSAGES = [
  { text: 'Poor  -_- ', color: '#ff0000' },
  { text: 'Good One! ', color: '#ff0000' },
  { text: 'Well Done ', color: '#0000ff' },
  { text: 'Great Job ', color: '#00ff00' },
  { text: 'FANTASTIC ', color: '#ffff00' },
];

const DISPLAY_DELAY = 300;

export default class extends Phaser.Scene {
  constructor() {
    super({ key: Keys.Scenes.Results });
  }

  init(data) {
    const background = this.add.image(0, 0, Keys.Assets.Background);
    background.setOrigin(0, 0);
    background.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
    const fx = background.preFX.addColorMatrix();
    fx.blackWhite();

    this.counterBack = this.add.nineslice(this.sys.game.config.width / 2, this.sys.game.config.height / 2, Keys.Assets.UI, Keys.UI.CountContainer, 304, 150, 16, 16, 16, 16);

    this.deerIcons = this.add.group({
      key: Keys.Assets.UI,
      frame: Keys.UI.CountPositive,
      setScale: 0,
      repeat: Settings.Amount_Of_Deer - 1,
      setXY: { x: this.sys.game.config.width / 2 - 96, y: this.sys.game.config.height / 2, stepX: 96 },
      active: false,
    });
    this.deerIcons.children.getArray().forEach((icon) => {
      icon.fx = icon.preFX.addColorMatrix();
      icon.fx.blackWhite(); // No 2 assets, just set effects to grayscale
    });

    this.resultBack = this.add.nineslice(0, 0, Keys.Assets.UI, Keys.UI.CountContainer, 300, 100, 16, 16, 16, 16);
    this.resultBack.setVisible(false);
    this.resultText = this.add.text(0, 0, 'Results ', {
      font: `64px ${Keys.UI.Font}`,
      fill: '#7744ff',
    });
    this.resultText.setOrigin(0.5);

    this.resultContainer = this.add.container(this.sys.game.config.width / 2, this.sys.game.config.height / 4, [this.resultBack, this.resultText]);
    this.resultContainer.setSize(400, 100);
    this.resultText.setVisible(false);

    this.bonusIcon = this.add.image(0, 0, Keys.Assets.UI, Keys.UI.ButtonAgain);
    this.bonusIcon.setVisible(false);
    this.bonusText = this.add.text(0, 0, 'BONUS ', {
      font: `48px ${Keys.UI.Font}`,
      fill: '#000000',
    });
    this.bonusText.setOrigin(0.5);
    this.bonusText.setVisible(false);

    this.bonusContainer = this.add.container(this.sys.game.config.width / 2, (this.sys.game.config.height * 3) / 4, [this.bonusIcon, this.bonusText]);
    this.bonusContainer.setSize(400, 100);
  }

  create(data) {
    this.cameras.main.fadeIn(Settings.Cam_FadeTime);
    this.time.delayedCall(Settings.Cam_FadeTime, () => {
      let min = Math.min(Settings.Amount_Of_Deer, Settings.Count_Of_Deer);
      for (let index = 0; index < min; index++) {
        this.time.delayedCall(DISPLAY_DELAY * index, () => this.updateCounter());
      }
      if (Settings.Amount_Of_Deer < Settings.Count_Of_Deer) {
        min = Settings.Count_Of_Deer;
        this.time.delayedCall(DISPLAY_DELAY * Settings.Amount_Of_Deer, () => this.displayBonusButton());
      }
      if (min === 0) min = Settings.Amount_Of_Deer;
      this.time.delayedCall(DISPLAY_DELAY * min, () => this.displayResultMessage(MESSAGES[Settings.Count_Of_Deer]));
      this.time.delayedCall(DISPLAY_DELAY * min * 2, () => this.transitionScenes());
    });
  }

  /**
   * Updates the counter display
   */
  updateCounter(index) {
    // }
    const icon = this.deerIcons.getFirstDead();
    if (!icon) return;

    icon.setActive(true);
    icon.fx.reset();
    this.cameras.main.shake(50, 0.005);
  }

  /**
   * Updates the counter display
   */
  updateCounter(index) {
    // }
    const icon = this.deerIcons.getFirstDead();
    if (!icon) return;

    icon.setActive(true);
    icon.fx.reset();
    this.cameras.main.shake(50, 0.005);
  }

  /**
   * Displays the bonus Button
   */
  displayBonusButton() {
    this.bonusIcon.setVisible(true);
    this.bonusText.setVisible(true);
    this.cameras.main.shake(50, 0.005);
  }

  /**
   * Displays the overall result of the round.
   * @param {object} config The Object containing the respective text settings
   */
  displayResultMessage(config) {
    this.resultText.setText(config.text);
    this.resultText.setFill(config.color);
    this.resultBack.setVisible(true);
    this.resultText.setVisible(true);
    this.resultContainer.setVisible(true);
    this.cameras.main.shake(50, 0.005);
  }

  transitionScenes() {
    this.cameras.main.fadeOut(Settings.Cam_FadeTime);
    this.time.delayedCall(Settings.Cam_FadeTime, () => {
      this.scene.manager.stop(Keys.Scenes.Results);
      this.scene.start(Keys.Scenes.Splash);
    });
  }
}
