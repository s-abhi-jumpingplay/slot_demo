import { EventDispatcher } from './../EventDispatcher';
import * as PIXI from "pixi.js";
import { gsap, Linear } from "gsap";
import { Model } from "../dataStore/Model";
import { MainScreen } from "../scene/MainScreen";
import { OverlayPanel } from "../scene/OverlayPanel";
import * as constants from "../config/constants.json";
import * as localizeText from "../config/en.json";

export interface IButtonView {
  SPRITE: string;
  NAME: string;
  X: number;
  Y: number;
  TEXT: string;
}

export class GameController extends PIXI.Container {
  private gameData: Model;
  private gameButtons: PIXI.Sprite[] = [];
  private mainScreen: MainScreen;
  private betPanel: OverlayPanel;
  private eventDispature: EventDispatcher;
  private animatedCoinPool: PIXI.AnimatedSprite[] = [];
  private coinShowerIntervalId: ReturnType<typeof setInterval> | undefined;

  constructor() {
    super();
    this.gameData = Model.getInstance();
    this.betPanel = new OverlayPanel();

    this.mainScreen = new MainScreen();
    this.eventDispature = EventDispatcher.getInstance();
    this.addEventListeners();
  }

  private setupUI() {
    const mainBg = PIXI.Sprite.from(constants.background.sprite);
    this.addChild(mainBg);

    this.betPanel.init();
    this.addChild(this.betPanel);
    this.betPanel.updateBet();
    this.betPanel.updateBalance();

    this.mainScreen.init();
  }

  public init() {
    this.setupUI();
    this.createCoinPool();
    this.addChild(this.mainScreen);

    this.gameButtons.push(this.createSpinButton());
    this.gameButtons.push(this.createBetUpButton());
    this.gameButtons.push(this.createBetDownButton());
  }

  private createCoinPool() {
    let totalCoins = constants.CELEBRATION.COIN_POOL_SIZE;
    for (let i = 0; i < totalCoins; i++) {
      let coinTexture = PIXI.Loader.shared.resources.coinAnim.spritesheet;
      let animatedCoin = undefined;
      if (coinTexture) {
        animatedCoin = new PIXI.AnimatedSprite(
          coinTexture.animations.coin_anim
        );
        animatedCoin.anchor.set(0.5);
        animatedCoin.scale.set(0.2);
        animatedCoin.animationSpeed = 0.5;
        animatedCoin.loop = true;
        this.animatedCoinPool.push(animatedCoin);
      }
    }
  }

  private addEventListeners() {
    this.eventDispature.addEventListener(
      "ALL_REELS_STOPPED",
      this.addWinPresentation.bind(this)
    );
    this.eventDispature.addEventListener(
      "ENABLE_BUTTONS",
      this.enableGameButtons.bind(this)
    );
  }

  private playCoinCelebration() {
    this.coinShowerIntervalId = setInterval(() => {
      this.coinShooter();
    }, 20);
  }

  private coinShooter() {
    if (this.animatedCoinPool.length > 0) {
      let coin = this.animatedCoinPool.pop();
      if (coin) {
        coin.x = this.getRandomNumberInRange(0, constants.viewport.width);
        coin.y = 0;
        coin.play();
        coin.alpha = 1;
        this.addChild(coin);
        gsap.to(coin, {
          alpha: 0.1,
          y: constants.viewport.height,
          duration: 1.2,
          ease: Linear.easeOut,
          onCompleteParams: [coin],
          onComplete: (coin) => {
            coin.stop();
            this.removeChild(coin);
            this.animatedCoinPool.push(coin);
          },
        });
      }
    }
  }

  private async addWinPresentation() {
    if (this.gameData.totalWinAmount) {
      this.playCoinCelebration();
      this.disableGameButtons();
      this.showWinPresentation();

      gsap.delayedCall(constants.CELEBRATION.COIN_SHOWER_DURATION, () => {
        clearInterval(this.coinShowerIntervalId);
      });
      await this.betPanel.addCountup();
      this.enableGameButtons();
    } else {
      this.enableGameButtons();
    }
  }

  private showWinPresentation(): void {
    const winPos = this.gameData.winPosition;
    const uniqueArray = [...new Set(winPos)];
    console.log("WINS ::  ", uniqueArray);
    const reels = this.mainScreen.reel;

    for(let i=0; i<uniqueArray.length; i++) {
      const symbolMap = uniqueArray[i].split('_');
      const reel = reels[parseInt(symbolMap[0])].children[0] as PIXI.Container;
      console.log("Animating  ::  ", symbolMap[1], reel.children)
      const sprite = reel.getChildAt(parseInt(symbolMap[1]));
      gsap.fromTo(sprite, { alpha: 0 }, { alpha: 1, duration: 1, yoyo: true, repeat: -1 });
    }
  }

  private clearWinAnimations(): void {
    const reels = this.mainScreen.reel;
    for(let i=0; i<3; i++) {
      const reel = (reels[i].children[0] as PIXI.Container);
      for(let j=0; j< reel.children.length; j++){
        const sprite = reel.getChildAt(j);
        gsap.killTweensOf(sprite);
      }
    }
  }

  /* private getButtonByName(buttonName: string) {
    let selectedButton;
    this.gameButtons.forEach((button) => {
      if (button.name == buttonName) {
        selectedButton = button;
      }
    });

    return selectedButton;
  } */

  private addButton(btnView: IButtonView) {
    const mainButton = PIXI.Sprite.from(btnView.SPRITE);
    mainButton.name = btnView.NAME;
    mainButton.x = btnView.X;
    mainButton.y = btnView.Y;
    mainButton.interactive = true;
    mainButton.cursor = "pointer";
    this.addChild(mainButton);

    if (btnView.TEXT) {
      const style = new PIXI.TextStyle({
        fontSize: 50,
      });
      const text = new PIXI.Text(btnView.TEXT, style);
      text.anchor.set(0.5);
      mainButton.addChild(text);
    }

    return mainButton;
  }

  private createSpinButton() {
    let mainButton = this.addButton(constants.SPIN_BTN);
    mainButton.scale.set(0.6);
    mainButton.anchor.set(0.5);
    mainButton.on("pointerdown", this.handleSpinRequest, this);
    return mainButton;
  }
  private createBetUpButton() {
    let mainButton = this.addButton(constants.BET_UP_BTN);
    // mainButton.scale.set(0.6);
    mainButton.anchor.set(0.5);
    mainButton.angle = 180;
    mainButton.on("pointerdown", this.increaseBet, this);
    return mainButton;
  }
  private createBetDownButton() {
    let mainButton = this.addButton(constants.BET_DOWN_BTN);
    // mainButton.scale.set(0.6);
    mainButton.anchor.set(0.5);
    mainButton.on("pointerdown", this.reduceBet, this);
    return mainButton;
  }

  private increaseBet(): void {
    this.gameData.increaseBet();
    this.betPanel.updateBet();

    if(this.gameData.balance < this.gameData.currentBet) {
      this.betPanel.updateWinDisplay(localizeText.INSUFFICIENT_BALANCE);
    }
  }

  private reduceBet(): void {
    this.gameData.reduceBet();
    this.betPanel.updateBet();

    if(this.gameData.balance >= this.gameData.currentBet) {
      this.betPanel.updateWinDisplay(localizeText.GOOD_LUCK);
    }
  }

  private disableGameButtons() {
    this.gameButtons.forEach((button) => {
      this.disableButton(button);
    });
  }

  private enableGameButtons() {
    this.gameButtons.forEach((button) => {
      if (button.visible) {
        this.enableButton(button);
      }
    });
  }

  private enableButton(button: PIXI.Sprite | undefined) {
    if (!button) {
      return;
    }
    button.interactive = true;
    button.alpha = 1;
  }
  private disableButton(button: PIXI.Sprite | undefined) {
    if (!button) {
      return;
    }
    button.interactive = false;
    button.alpha = 0.3;
  }

  private async handleSpinRequest() {
    let reels = this.gameData.reelsetData;
    let bet = this.gameData.randomBet;
    const newReelStops: number[] = [];

    this.clearWinAnimations();
    console.log("Placing BET   ::     ", bet);

    if(this.gameData.balance < this.gameData.currentBet) {
      console.log("LOW BALANCE !!");
      this.betPanel.updateWinDisplay(localizeText.INSUFFICIENT_BALANCE);
      // HANDLE INSUFFICIENT BALANCE
      return;
    }

    this.disableGameButtons();
    this.gameData.placeBet();
    this.betPanel.updateBalance();

    for (let i = 0; i < reels.length; i++) {
      newReelStops.push(Math.floor(Math.random() * reels[i].length));
    }
    this.gameData.reelstops = newReelStops;
    this.mainScreen.spinReels();


    this.betPanel.updateStopPositionData();
    this.betPanel.showWinDetails();
  }

  //  -------------       UTILITY METHODS        ---------------------

  private getRandomNumberInRange(start: number, end: number) {
    let randomInRange = Math.floor(Math.random() * (end - start));
    let selectedNum = start + randomInRange;
    return selectedNum;
  }
}
