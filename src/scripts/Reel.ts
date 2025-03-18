import * as PIXI from "pixi.js";

export class Reel extends PIXI.Container {
  private reelContainer: PIXI.Container = new PIXI.Container();
  private stopSymbols: string[] = [];
  private visibleReelSymbols: string[] = [];
  private symbolHeight: number = 256;
  private symbols: PIXI.DisplayObject[] = [];
  private id: number;

  constructor(id:number) {
    super();
    this.id = id;
    this.addChild(this.reelContainer);
  }

  public get reelId(): number {
    return this.id;
  }
  public fillWithSymbols(symbols: string[]) {
    this.emptyReel();
    this.fillSymbols(symbols);
  }

  /* private emptyReel() {
    while (this.reelContainer.children.length > 0) {
      let removedChild = this.reelContainer.getChildAt(0);
      this.reelContainer.removeChild(removedChild);
      removedChild.destroy();
    }
  }

  private fillSymbols(symbols: string[]) {
    for (let i = 0; i < symbols.length; i++) {
      let sprite = new PIXI.Sprite(
        PIXI.Loader.shared.resources[symbols[i]].texture
      );
      sprite.y = this.reelContainer.height;
      this.reelContainer.addChild(sprite);
    }
  } */

    private emptyReel() {
      this.symbols = [];
      while (this.reelContainer.children.length > 0) {
        let removedChild = this.reelContainer.getChildAt(0);
        this.reelContainer.removeChild(removedChild);
        removedChild.destroy();
      }
    }
  
    private fillSymbols(symbols: string[]) {
      for (let i = 0; i < symbols.length; i++) {
        let sprite = PIXI.Sprite.from(symbols[i]);
        this.symbols.push(sprite);
        sprite.x = (this.symbolHeight - sprite.width) / 2;
        sprite.y = i * this.symHeight + (this.symHeight - sprite.height) / 2;
  
        this.reelContainer.addChild(sprite);
      }
    }
  
    public set stoppingSymbols(syms: string[]) {
      this.stopSymbols = syms;
    }

  public get stoppingSymbols() {
    return this.stopSymbols;
  }

  get symHeight() {
    return this.symbolHeight;
  }

  public getSymbolAt(index: number) {
    return this.reelContainer.getChildAt(index + 1);
  }

  public addRandomSymbolOnTop(): void {
    const randomSymbolTexture = this.randomSymbolName;

    let sprite = PIXI.Sprite.from(randomSymbolTexture);
    sprite.x = (this.symbolHeight - sprite.width) / 2;
    sprite.y = -this.symbolHeight;

    this.reelContainer.addChildAt(sprite, 0);
  }

  public set visibleReel(symbols: string[]) {
    this.visibleReelSymbols = symbols;
    this.visibleReelSymbols.unshift(
      this.visibleReelSymbols[this.visibleReelSymbols.length - 1]
    );

    this.fillWithSymbols(this.visibleReelSymbols);
    this.reelContainer.y = -this.symbolHeight;
  }

  public getReelContainer(): PIXI.Container {
    return this.reelContainer;
  }

  public get randomSymbolName() {
    let name = "";
    let randomNumber = Math.floor(Math.random() * 11);
    if (randomNumber < 5) {
      if (randomNumber == 0) {
        name = "hv1";
      } else {
        name = "hv" + randomNumber;
      }
    } else if (randomNumber > 6) {
      name = "lv" + (randomNumber % 6);
    } else {
      name = "lv" + (2 % 6);
    }
    // console.log("Sym Name :::     ", randomNumber, name);
    return name;
  }

  public updateReel(symName: string = "") {
    this.visibleReelSymbols.pop();
    let nextSymbol = symName || this.randomSymbolName;

    this.visibleReelSymbols.unshift(nextSymbol);

    this.reelContainer.removeChildAt(this.reelContainer.children.length - 1);
    this.addNewSymbol();
    this.moveSymbolsToNextPosition();

    this.reelContainer.y = 0;
  }

  private addNewSymbol() {
    let sprite = PIXI.Sprite.from(this.visibleReelSymbols[0]);
    sprite.x = (this.symbolHeight - sprite.width) / 2;
    sprite.y = -this.symbolHeight;

    this.reelContainer.addChildAt(sprite, 0);
  }

  private moveSymbolsToNextPosition() {
    for (let i = 0; i < this.reelContainer.children.length; i++) {
      let child: PIXI.Sprite = this.reelContainer.getChildAt(i) as PIXI.Sprite;
      child.y = this.symbolHeight * (i-1) + (this.symHeight - child.height) / 2;
    }
  }
}
