import Phaser from 'phaser';
import eventManager from '../classes/EventManager';

import * as Keys from '../data/keys';
import Settings from '../data/settings';

import Gun from '../classes/gun';

export default class UI extends Phaser.Scene {
  constructor() {
    super({ key: Keys.Scenes.UI });

    this.CTAtimer = 0;
    this.isTimerRunning = false;
  }

  init(data) {
    // Enables different move behavior depending on device
    // https://phaser.discourse.group/t/check-if-mobile/305/5¡
    this.setInputs(this.sys.game.device.os.desktop, this);

    this.cameras.main.fadeIn(Settings.Cam_FadeTime);
    this.time.delayedCall(Settings.Cam_FadeTime * 3, () => {
      this.isTimerRunning = true;
    });

    eventManager.on(
      Keys.Events.shootGun,
      () => {
        this.updateBullets();
        this.hideCTA();
      },
      this
    );
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      eventManager.off(
        Keys.Events.shootGun,
        () => {
          this.updateBullets();
          this.hideCTA();
        },
        this
      );
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

    this.CTA = this.add.image(this.sys.game.config.width - 300, 100, Keys.Assets.UI, Keys.UI.CTAMessage);
    this.CTA.setVisible(false);
    this.CTA.setScale(0);

    this.gun = new Gun(this, Settings.Amount_Of_Bullets); // Maybe UI for overlay?
  }

  update(time, delta) {
    // All icons are on, so 3 deers killed :(
    if (!this.deerIcons.getFirstDead()) {
      eventManager.emit(Keys.Events.killHattrick);
    }

    if (!this.isTimerRunning) return;

    this.CTAtimer -= delta;
    if (this.CTAtimer <= 0) this.displayCTA();
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
    if (!icon) return;

    icon.setActive(true);
    icon.fx.reset();
  }

  /**
   * Shows the CTA
   */
  displayCTA() {
    // Just in case some event calls here
    if (this.CTA.visible) return;

    this.CTAtimer = 1;
    this.CTA.setVisible(true);
    this.CTAtween = this.tweens.chain({
      targets: this.CTA,
      tweens: [
        {
          scale: { from: 0, to: 1 },
          duration: 500,
          ease: 'Sine.in',
        },
        {
          scale: 1.25,
          duration: 700,
          ease: 'Quad.inOut',
          yoyo: true,
          repeat: -1,
        },
      ],
    });
  }

  /**
   * Hides the CTA
   */
  hideCTA() {
    this.CTAtimer = Settings.CTA_On_Idle_Time;
    // Don't bother if all is off :P
    if (!this.CTA.visible) return;

    this.CTAtween.destroy();
    this.CTAtween = this.tweens.add({
      targets: this.CTA,
      scale: 0,
      duration: 300,
      ease: 'Sine.out',
      onComplete: () => {
        this.CTAtween.destroy();
        this.CTA.setVisible(false);
      },
    });
  }

  /**
   * Sets input handling for the scene.
   * @param {boolean} isDesktop Checked if the machine is a desktop
   * @param {Phaser.Scene} scene The scene context
   */
  setInputs(isDesktop, scene) {
    // https://photonstorm.github.io/phaser3-docs/Phaser.Input.Events.html
    // Desktops don't need drag wrapped around
    if (isDesktop) {
      this.input.on(
        Phaser.Input.Events.POINTER_MOVE,
        (pointer) => {
          this.gun.move(pointer.x, pointer.y);
        },
        scene
      );

      this.input.on(
        Phaser.Input.Events.POINTER_UP,
        (pointer) => {
          if (Math.abs(pointer.downX - pointer.upX) <= 10 && Math.abs(pointer.downY - pointer.upY) <= 10) {
            this.gun.shoot(pointer.x, pointer.y);
          }
        },
        scene
      );
    } else {
      // On mobiles, "tap" and drag to move
      this.input.on(
        Phaser.Input.Events.POINTER_DOWN,
        () => {
          this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer) => this.gun.move(pointer.x, pointer.y));
          // Shoot on release
          this.input.on(
            Phaser.Input.Events.POINTER_UP,
            (pointer) => {
              if (Math.abs(pointer.downX - pointer.upX) <= 10 && Math.abs(pointer.downY - pointer.upY) <= 10) {
                this.gun.shoot(pointer.x, pointer.y);
              }
            },
            scene
          );
        },
        scene
      );
    }
  }
}
