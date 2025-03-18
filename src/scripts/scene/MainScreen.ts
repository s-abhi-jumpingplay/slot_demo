import * as PIXI from "pixi.js";
import { Model } from "../dataStore/Model";
import { Reel } from "../Reel";
import * as constants from "../config/constants.json";
import { BaseSpin } from "../services/BaseSpin";
import { EventDispatcher } from "../EventDispatcher";
import { gsap } from "gsap";

export class MainScreen extends PIXI.Container {
  private mainContainer: PIXI.Container = new PIXI.Container();
  private gameData: Model;
  private reelStartPosition_x = constants.REEL_START_POSITION.X;
  private reelStartPosition_y = constants.REEL_START_POSITION.Y;
  private reels: Reel[] = [];
  private spinMechanics: BaseSpin[] = [];
  private symbolSize = constants.SYMBOL_SIZE;
  private eventDispature: EventDispatcher;
  private reelMask: PIXI.Sprite = new PIXI.Sprite(PIXI.Texture.WHITE);

  constructor() {
    super();
    this.eventDispature = EventDispatcher.getInstance();
    this.gameData = Model.getInstance();
    this.addChild(this.mainContainer);
  }

  public init(): void {
    let initReels = this.gameData.stopSymbols;
    this.reelMask.width = constants.SYMBOL_SIZE*3;
    this.reelMask.height = constants.SYMBOL_SIZE*3*0.6;

    this.reelMask.x = this.reelStartPosition_x;
    this.reelMask.y = this.reelStartPosition_y;

    this.addChild(this.reelMask);

    for (let i = 0; i < initReels.length; i++) {
      let newReel = new Reel(i);
      // console.log("initReel ", initReels[i]);
      newReel.fillWithSymbols(initReels[i]);
      newReel.scale.set(1, 0.6);
      newReel.addRandomSymbolOnTop();
      this.addChild(newReel);

      newReel.mask = this.reelMask;
      newReel.x = this.reelStartPosition_x + i * this.symbolSize;
      newReel.y = this.reelStartPosition_y;
      this.reels.push(newReel);
      this.spinMechanics.push(new BaseSpin(newReel));
    }
  }

  public get reel(): Reel[] {
    return this.reels;
  }

  private onSpinTimerComplete() {
    for (let i = 0; i < this.reels.length; i++) {
      gsap.delayedCall(0.2 * i, () => {
        this.reels[i].stoppingSymbols = this.gameData.stopSymbols[i];
        console.log("STOP REQ  ::  ", i, this.reels[i].stoppingSymbols);
        this.spinMechanics[i].requestStop();
      });
    }
    gsap.delayedCall(1.2, () => {
      this.eventDispature.dispatchEvent("ALL_REELS_STOPPED");
    });
  }

  public spinReels() {
    this.eventDispature.dispatchEvent("DISABLE_BUTTONS");
    for (let i = 0; i < 3; i++) {
      gsap.delayedCall(0.15 * i, () => {
        this.spinMechanics[i].startSpin();
      });
    }

    gsap.delayedCall(2.5, this.onSpinTimerComplete.bind(this));
  }

  public updateReelsWithNewStop() {
    const newReelSymbols = this.gameData.stopSymbols;
    for (let reelIndex = 0; reelIndex < this.reels.length; reelIndex++) {
      this.reels[reelIndex].fillWithSymbols(newReelSymbols[reelIndex]);
    }
  }
}
