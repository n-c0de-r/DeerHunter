import Phaser from 'phaser';
import eventManager from '../classes/EventManager';

import * as Keys from '../data/keys';
import Settings from '../data/settings';

import Gun from '../classes/gun';
import Scope from '../classes/scope';

export default class UI extends Phaser.Scene {
  constructor() {
    super({ key: Keys.Scenes.UI });

    this.CTAtimer = 0;
    this.isTimerRunning = false;
    this.isTutorialDone = false;
    this.isBonusLayout = false;
  }

  init(data) {
    // Enables different move behavior depending on device
    // https://phaser.discourse.group/t/check-if-mobile/305/5¡
    this.setInputs(this.sys.game.device.os.desktop, this);

    this.cameras.main.fadeIn(Settings.Cam_FadeTime);

    this.setEvents();
  }

  create(data) {
    this.counterBack = this.add.nineslice(0, 0, Keys.Assets.UI, Keys.UI.CountContainer, 304, 150, 16, 16, 16, 16).setOrigin(0, 0);

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

    this.toggleInterface(false);

    this.CTA = this.add.image(this.sys.game.config.width - 300, 100, Keys.Assets.UI, Keys.UI.CTAMessage);
    this.CTA.setVisible(false);
    this.CTA.setScale(0);

    this.gun = new Gun(this);
    this.gun.toggleEnabled(false);
    this.gun.setAlpha(0);

    this.time.delayedCall(Settings.Cam_FadeTime, () => {
      this.mask = this.setMask(400, 300, 128);
      this.setOverlay(this.mask, 0.75);
      this.overlayTween.play();
      this.overlayTween.on(Phaser.Tweens.Events.TWEEN_COMPLETE, () => {
        this.showCTA();
        this.showGun();
        this.isTimerRunning = true;
      });
      // this.setTutorial(this.deer.x, this.deer.y);
    });
  }

  update(time, delta) {
    // All icons are on, so 3 deers killed :(
    if (!this.isBonusLayout && !this.deerIcons.getFirstDead()) {
      this.isBonusLayout = true;
      console.log('bonus emit');
      eventManager.emit(Keys.Events.playBonus);
    }

    if (!this.isTimerRunning) return;

    this.CTAtimer -= delta;
    if (this.CTAtimer <= 0) this.showCTA();
  }

  // UI RELATED FUNCTIONS

  setEvents() {
    eventManager.on(Keys.Events.showGun, this.showGun, this);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      eventManager.off(Keys.Events.showGun, this.showGun, this);
    });

    eventManager.on(Keys.Events.hitDeer, this.finishTutorial, this);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      eventManager.off(Keys.Events.hitDeer, this.finishTutorial, this);
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

    eventManager.on(
      Keys.Events.playBonus,
      () => {
        this.cameras.main.fadeOut(Settings.Cam_FadeTime);
        this.time.delayedCall(Settings.Cam_FadeTime, () => {
          this.setBonus();
        });
      },
      this
    );
    eventManager.on(Keys.Events.emptyGun, () => this.cameras.main.fadeOut(Settings.Cam_FadeTime), this);
    eventManager.on(Keys.Events.timeoutGame, () => this.cameras.main.fadeOut(Settings.Cam_FadeTime), this);
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
          console.log(this.gun.isEnabled);
          console.log('scope name', this.gun.name);
          console.log('scope key', Keys.UI.Scope);
          if (this.gun.isEnabled && this.gun.name === Keys.UI.Scope) {
            this.mask = this.setMask(pointer.x, pointer.y, this.gun.getBounds().width / 2);
            this.overlay = this.setOverlay(this.mask, 1);
          }
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
          this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer) => {
            this.gun.move(pointer.x, pointer.y);
            if (this.gun.isEnabled && this.gun.name === Keys.UI.Scope) {
              this.mask = this.setMask(pointer.x, pointer.y, this.gun.getBounds().width / 2);
              this.overlay = this.setOverlay(this.mask, 1);
            }
          });
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

  /**
   * Sets up an overlay and masks a cutout
   * @param <{Phaser.Display.Masks.BitmapMask}> mask The mask for the overlay.
   * @param {number} alpha The intensity of transparency.
   */
  setOverlay(mask, alpha) {
    // https://phaser.io/examples/v3/view/display/masks/graphics-bitmap-mask
    this.overlay = this.add.graphics();

    this.overlay.fillStyle(0x000000).fillRect(0, 0, this.sys.game.config.width, this.sys.game.config.height);

    this.overlay.setMask(mask);

    this.overlayTween = this.tweens.add({
      targets: this.overlay,
      alpha: { from: 0, to: alpha },
      duration: 1000,
    });
  }

  /**
   * Creates a bitmap mask.
   * @param {number} x X position of the mask.
   * @param {number} y Y position of the mask.
   * @param {number} size The radius of the mask.
   * @returns {Phaser.Display.Masks.BitmapMask} A phaser bitmap mask
   */
  setMask(x, y, size) {
    const maskGraphics = this.make.graphics();

    maskGraphics.fillStyle(0xffffff);
    maskGraphics.fillCircle(x, y, size);

    const mask = new Phaser.Display.Masks.BitmapMask(this, maskGraphics);

    mask.invertAlpha = true;
    return mask;
  }

  finishTutorial() {
    this.tweens.add({
      targets: this.overlay,
      alpha: 0,
      duration: 250,
      onComplete: () => {
        this.toggleInterface(true);
        this.isTutorialDone = true;
        eventManager.off(Keys.Events.hitDeer, () => this.finishTutorial, this);
      },
    });
  }

  /**
   * Toggles the UI elements visibility.
   */
  toggleInterface(state) {
    eventManager.off(Keys.Events.showInterface, this.showCTA, this);
    this.counterBack.setVisible(state);
    this.deerIcons.setVisible(state);
    this.bullets.setVisible(state);
    if (state) {
      this.gun.setBullets(Settings.Amount_Of_Bullets);
      this.hideCTA();
    }
  }

  /**
   * Fade in the gun once at start.
   */
  showGun() {
    this.tweens.add({
      targets: this.gun,
      alpha: 1,
      duration: 500,
      onComplete: () => {
        eventManager.off(Keys.Events.showGun, this.showGun, this);
      },
    });
    this.gun.toggleEnabled(true);
    this.gun.setBullets(Infinity);
    this.showCTA();
  }

  /**
   * Sets up the bonus view
   */
  setBonus() {
    this.gun.destroy();
    console.log('bonus setup');
    const x = this.sys.game.config.width / 2;
    const y = this.sys.game.config.height / 2;
    this.gun = new Scope(this, x, y);
    this.gun.setScale(0.5);
    this.mask = this.setMask(x, y, this.gun.getBounds().width / 2);
    this.overlay = this.setOverlay(this.mask, 1);
    this.toggleInterface(false);
    this.cameras.main.fadeIn(Settings.Cam_FadeTime);
    this.time.delayedCall(Settings.Cam_FadeTime, this.gun.toggleEnabled(true));
  }

  /**
   * Shows the CTA
   */
  showCTA() {
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
    if (!this.CTA.visible || !this.isTutorialDone) return;

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
   * Updates the displayed amount of bullets.
   */
  updateBullets() {
    const bullet = this.bullets.getLast(true);
    if (!bullet || !this.isTutorialDone) return;

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
    Settings.Amount_Of_Deer -= 1;
    const icon = this.deerIcons.getFirstDead();
    if (!icon || !this.isTutorialDone) return;

    icon.setActive(true);
    icon.fx.reset();
  }
}
