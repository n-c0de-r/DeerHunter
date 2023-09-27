import Phaser from 'phaser';
import eventManager from '../classes/EventManager';

import * as Keys from '../data/keys';
import Settings from '../data/settings';

export default class UI extends Phaser.Scene {
  constructor() {
    super({ key: Keys.Scenes.UI });
  }

  init(data) {
    this.cameras.main.fadeIn(Settings.Cam_FadeTime);

    eventManager.on(Keys.Events.shootGun, this.updateBullets, this);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      eventManager.off(Keys.Events.shootGun, this.updateBullets, this);
    });

    eventManager.on(Keys.Events.hideCTA, this.hideCTA, this);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      eventManager.off(Keys.Events.hideCTA, this.hideCTA, this);
    });

    eventManager.on(Keys.Events.hitDeer, this.updateCounter, this);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      eventManager.off(Keys.Events.hitDeer, this.updateCounter, this);
    });

    eventManager.on(Keys.Events.emptyGun, () => this.cameras.main.fadeOut(Settings.Cam_FadeTime), this);
    eventManager.on(Keys.Events.timeoutGame, () => this.cameras.main.fadeOut(Settings.Cam_FadeTime), this);
  }

  create(data) {
    const counterBack = this.add.nineslice(0, 0, Keys.Assets.UI, Keys.UI.CountContainer, 304, 150, 16, 16, 16, 16).setOrigin(0, 0);

    this.deerIcons = this.add.group({
      key: Keys.Assets.UI,
      frame: Keys.UI.CountPositive,
      repeat: Settings.Amount_Of_Deer - 1,
      setXY: { x: 56, y: 72, stepX: 96 },
      active: false,
    });
    // https://labs.phaser.io/view.html?src=src/fx\colormatrix\colormatrix%20fx.js
    this.deerIcons.children.getArray().forEach((icon) => {
      icon.fx = icon.preFX.addColorMatrix();
      icon.fx.blackWhite(); // No 2 assets, just set effects to grayscale
    });

    this.bullets = this.add.group({
      key: Keys.Assets.UI,
      frame: Keys.UI.Bullet,
      repeat: Settings.Amount_Of_Bullets - 1,
      setXY: { x: this.sys.game.config.width - 32, y: this.sys.game.config.height - 72, stepX: -32 },
    });

    this.CTA = this.add.image(300, 100, Keys.Assets.UI, Keys.UI.CTAMessage);
    this.CTA.setVisible(false);
  }

  update(time, delta) {
    // All icons are on, so 3 deers killed :(
    if (!this.deerIcons.getFirstDead()) {
      eventManager.emit(Keys.Events.killHattrick);
    }
  }

  // UI RELATED FUNCTIONS

  /**
   * Updates the displayed amount of bullets.
   */
  updateBullets() {
    const bullet = this.bullets.getLast(true);
    if (!bullet) return;

    this.tweens.add({
      targets: bullet,
      alpha: 0,
      scale: 0,
      duration: 500,
      ease: 'Quad.easeOut',
      onComplete: () => {
        bullet.setActive(false);
        bullet.removeFromDisplayList();
      },
    });
  }

  /**
   * Updates the counter display
   */
  updateCounter() {
    const icon = this.deerIcons.getFirstDead();
    icon.setActive(true);
    icon.fx.reset();
  }

  displayCTA() {
    // TODO: implement CTA
  }

  hideCTA() {}
}
