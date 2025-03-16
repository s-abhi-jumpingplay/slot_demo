import { gsap, Bounce } from "gsap";
import { Reel } from "../Reel";
import * as PIXI from "pixi.js";
//import * as constants from "../config/constants.json";
import { Model } from "../dataStore/Model";

interface IReelSpin {
  distanceToReach: number;
  startSpin(stopReached: boolean): void;
}

export class BaseSpin implements IReelSpin {
  distanceToReach: number;
  private reel: Reel;
  private stopRequested: boolean = false;
  private reelContainer: PIXI.Container;
  private gameData: Model;

  constructor(reel: Reel) {
    this.distanceToReach = 3;
    this.reel = reel;
    this.reelContainer = this.reel.getReelContainer();
    this.gameData = Model.getInstance();
  }

  public requestStop() {
    this.stopRequested = true;
  }

  public startSpin(stopReached: boolean = false): void {
    if (stopReached && this.distanceToReach == 1) {
      this.stopRequested = false;
      this.distanceToReach = 3;
      // console.log("this.reelContainer  Y    ", this.reelContainer.y);

      gsap.to(this.reelContainer, {
        y: 0,//constants.REEL_START_POSITION.Y,
        duration: .3,
        ease: Bounce.easeOut,
        onComplete: this.onSpinEnded.bind(this),
      });
    } else {
      if (this.stopRequested) {
        this.distanceToReach--;
      }

      // console.log("this.reelContainer  YS    ", this.reelContainer.y);
      gsap.to(this.reelContainer, {
        y: 0,//constants.REEL_START_POSITION.Y,
        duration: .1,
        ease: "none",
        onComplete: this.onSpinComplete.bind(this),
      });
    }
  }

  private onSpinComplete() {
    let nextSymbol = "";
    if (this.stopRequested) {
      let stopSyms = this.reel.stoppingSymbols;
      nextSymbol = stopSyms[this.distanceToReach - 1];
    }
    this.reel.updateReel(nextSymbol);
    this.startSpin(this.stopRequested);
  }

  private onSpinEnded() {
    // this.reel.updateReel("", true);
    this.reel.fillWithSymbols(this.gameData.stopSymbols[this.reel.reelId]);
  }
}
