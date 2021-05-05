import * as PIXI from "pixi.js";
// webpack error on PixiJS v5. import { loader } from "webpack";
import { WebpackPluginInstance as loader } from "webpack";
// window.PIXI = PIXI;
import { STAGES, ASSETS, GAMES } from "./constants";
import { setText } from "./helper/setText";
import { randomInt } from "./helper/randomInt";
import Stats from "stats.js";
import { Howl, Howler } from "howler"; // npm install --save @types/howler
import { gsap } from "gsap"; // npm install -D @types/gsap

import { PixiPlugin } from "gsap/PixiPlugin";
import { AnimatedSprite, DisplayObject, Sprite } from "pixi.js";
import { shuffle } from "gsap/all";

// register the plugin
gsap.registerPlugin(PixiPlugin);
// give the plugin a reference to the PIXI object
PixiPlugin.registerPIXI(PIXI);

console.log(PIXI);

// stats
let stats: Stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

// constant
const WIDTH: number = STAGES.WIDTH;
const HEIGHT: number = STAGES.HEIGHT;
const BG_COLOR: number = STAGES.BG_COLOR;

const BOUNDARY_RANGE_X: number = 28;
const BOUNDARY_RANGE_Y: number = 10;
const BOUNDARY_RANGE_WIDTH: number = 488;
const BOUNDARY_RANGE_HEIGHT: number = 488;

const FIRST = 1;
const NOT_FIRST = 2;

// renderer
const renderer: PIXI.Renderer = new PIXI.Renderer({
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: BG_COLOR,
});
document.body.appendChild(renderer.view);

// stage
const stage: PIXI.Container = new PIXI.Container();

// Custom GameLoop(v5), call requestAnimationFrame directly.
let oldTime: number = Date.now();
let ms: number = 1000;
let fps: number = GAMES.FPS;
let animate: FrameRequestCallback = (): void => {
  // console.log("animate()");
  let newTime: number = Date.now();
  let deltaTime: number = newTime - oldTime;
  oldTime = newTime;
  deltaTime < 0 ? (deltaTime = 0) : deltaTime;
  deltaTime > ms ? (deltaTime = ms) : deltaTime;
  renderer.render(stage);
  stats.begin();
  requestAnimationFrame(animate);

  // GameLoop
  if (gameLoopFlag) {
    gameLoop(deltaTime);
  }

  stats.end();
};

// loader
let loader: PIXI.Loader = new PIXI.Loader();

// asset
const ASSET_BG: string = ASSETS.ASSET_BG;
const ASSET_OBJ1: string = ASSETS.ASSET_OBJ1;

// container
let container: PIXI.Container = new PIXI.Container();
container.width = WIDTH;
container.height = HEIGHT;
container.x = 0;
container.y = 0;
container.pivot.x = 0.5;
container.pivot.y = 0.5;
container.interactive = false;
container.interactiveChildren = true;
container.buttonMode = false;
stage.addChild(container);

// init
let bg: PIXI.Sprite;

let gameLoopFlag: boolean = false;

let card_back: PIXI.Sprite;
let card_0: PIXI.Sprite;
let card_1: PIXI.Sprite;
let card_2: PIXI.Sprite;
let card_3: PIXI.Sprite;
let card_4: PIXI.Sprite;
let card_5: PIXI.Sprite;
let card_6: PIXI.Sprite;

// text
let text_pixiVersion: PIXI.Text;

if (ASSET_BG === "") {
  console.log("Don't use background image.");
} else {
  loader.add("bg_data", ASSET_BG);
}
loader.add("obj_1_data", ASSET_OBJ1);

loader.load((loader: PIXI.Loader, resources: any) => {
  console.log(loader);
  console.log(resources);

  // bg
  if (ASSET_BG !== "") {
    bg = new PIXI.Sprite(resources.bg_data.texture);
    container.addChild(bg);
  }

  gameSetup(resources);
});

// err
loader.onError.add(() => {
  throw Error("load error ...");
});

/**
 *
 * @param delta
 */
const gameLoop = (delta: number): void => {
  // console.log("gameLoop()", delta);
};

/**
 *
 * @param resources
 */
const gameSetup = (resources: any): void => {
  console.log("gameSetup()");

  // set sprite sheet(texture atras frame)
  let id: any = resources.obj_1_data.textures;

  // Create card sprite

  // back
  card_back = new PIXI.Sprite(id["pic_back.png"]);
  card_back.scale.x = card_back.scale.y = 0.5;
  card_back.x = 10;
  card_back.y = 10;
  container.addChild(card_back);

  // 0
  card_0 = new PIXI.Sprite(id["pic_0.png"]);
  card_0.scale.x = card_0.scale.y = 0.5;
  card_0.x = 120;
  card_0.y = 10;
  container.addChild(card_0);

  // 1
  card_1 = new PIXI.Sprite(id["pic_1.png"]);
  card_1.scale.x = card_1.scale.y = 0.5;
  card_1.x = 230;
  card_1.y = 10;
  container.addChild(card_1);

  // 2
  card_2 = new PIXI.Sprite(id["pic_2.png"]);
  card_2.scale.x = card_2.scale.y = 0.5;
  card_2.x = 340;
  card_2.y = 10;
  container.addChild(card_2);

  // 3
  card_3 = new PIXI.Sprite(id["pic_3.png"]);
  card_3.scale.x = card_3.scale.y = 0.5;
  card_3.x = 10;
  card_3.y = 120;
  container.addChild(card_3);

  // 4
  card_4 = new PIXI.Sprite(id["pic_4.png"]);
  card_4.scale.x = card_4.scale.y = 0.5;
  card_4.x = 120;
  card_4.y = 120;
  container.addChild(card_4);

  // 5
  card_5 = new PIXI.Sprite(id["pic_5.png"]);
  card_5.scale.x = card_5.scale.y = 0.5;
  card_5.x = 230;
  card_5.y = 120;
  container.addChild(card_5);

  // 6
  card_6 = new PIXI.Sprite(id["pic_6.png"]);
  card_6.scale.x = card_6.scale.y = 0.5;
  card_6.x = 340;
  card_6.y = 120;
  container.addChild(card_6);

  // app start
  gameLoopFlag = true;
  requestAnimationFrame(animate); // -> gameLoop start

  const cardgame: CardGame = new CardGame();
  cardgame.testA(); // testA()
  // cardgame.testB(); // err, private
  console.log(cardgame.a); // 1
  // console.log(cardgame.b); // err
};

class CardGame {
  public a: number = 1;
  private b: number = 2;

  public pict: number[] = []; // カードの絵を入れる配列
  public back: number = 0; // カードの裏の絵を入れる変数

  public cardMaxNum: number = 12; // カードの最大枚数

  public count: number = 0; // ひっくり返されたカードの枚数
  public openCard: [number, number] = [100, 100]; // ひっくり返された2枚のカード番号
  public stat: number[] = []; // カードの状態（0:裏、1:今回ひっくり返された、2:表のまま）

  public card: number[] = []; // カードの配列、セットされた絵の番号が入る
  public x: number[] = []; // カードのx座標
  public y: number[] = []; // カードのy座標
  public cardWidth: number = 200; // カードの横幅
  public cardHeight: number = 200; // カードの縦幅
  public cardMargin: number = 10; // 並べる時の余白

  /**
   * 初期化する
   */
  public init(): void {
    // カードを並べる（カードのx,y座標を設定）
    // カードをセットする
    // shuffle();
    // マウスリスナーとして自分を登録
  }

  public paint(): void {
    // update(g)
  }

  public update(g: PIXI.Graphics): void {
    // バックをオレンジで塗る

    // タイトルの描画

    // カードの描画
    for (let i: number = 0; i < this.cardMaxNum; i++) {
      if (this.stat[i] === 0) {
        // 裏側の絵を描く
      } else {
        // 表側の絵を描く
      }
    }

    // シャッフルボタンの描画
  }

  public mousePressed(e: MouseEvent): void {
    // マウスが押された座標を得る →★直に押したスプライトで取得？
    let ix: number = e.movementX;
    let iy: number = e.movementY;

    // 押した座標がシャッフルボタンの場合、カードをセットし直す →★直に押したボタンから飛ぶ？
    // if(){
    //   shuffle();
    //   repaint();
    // }

    // 1枚目のカードをひっくり返す前の処理＝前回のカードを裏返しにする
    for (let i: number = 0; i < this.cardMaxNum; i++) {
      if (this.stat[i] === 1) {
        // 前回ひっくり返されたカードを元に戻す（前回一致:2のｊカードはそのまま）
        this.stat[i] = 0; // 裏に
        // repaint（再描画で裏の絵に）
      }
    }

    // 今回ひっくり返すカードの処理
    // 元のコードではマウスの押された座標から、行と列を割り出し、その値を使用して指定のカードを決定
    let col: number = 0,
      row: number = 0;

    if (col >= 0 && row >= 0) {
      // ひっくり返すカードの番号
      let nn: number = col * 4 + row; // 考え方

      if (this.stat[nn] === 0) {
        // カードが裏だったら、カードをひっくり返す
        this.openCard[this.count] = nn;

        // カードの状態を「今ひっくり返した」にする
        this.stat[nn] = 1;

        // repaint() 当該カードの表示を表にする

        // 2枚目のカードをひっくり返す処理
        if (this.count === 1) {
          if (this.card[this.openCard[0]] === this.card[this.openCard[1]]) {
            // 絵が一致したらカードの状態を表に固定する
            this.stat[this.openCard[0]] = 2;
            this.stat[this.openCard[1]] = 2;
          }
        }
      }

      // 現在何枚のカードがひっくり返されたか
      this.count = this.count + 1;
      if (this.count === 2) {
        this.count = 0;
      }
    }
  }

  public mouseReleased(e: MouseEvent): void {
    // マウスボタンが離された
  }

  public mouseClicked(e: MouseEvent): void {
    // マウスボタンがクリックされた
  }

  public mouseEntered(e: MouseEvent): void {
    // マウスボがボタン領域に入ってきた（over）
  }

  public mouseExited(e: MouseEvent): void {
    // マウスボがボタン領域に入ってきた（overout）
  }

  public Shuffle(): void {
    // 変数の初期化
    this.count = 0; // ひっくり返されたカード枚数は0枚
    this.stat.map((idx) => {
      // カードを全て裏の状態に戻す
      this.stat[idx] = 0;
    });

    // 使わない絵を乱数で決める
    let notUseCard = randomInt(0, 6);
    console.log(`notUseCard: ${notUseCard}`);

    // カードに絵の番号をセットする
    let k: number = 0;
    for (let i: number = 0; i < 7; i++) {
      if (i !== notUseCard) {
        // notUseCard以外の絵の番号をセット
        this.card[k] = i;
        this.card[k + 1] + i;
        k = k + 2;
      }
    }

    // カードの順番を入れ替える
    // カードの枚数だけループ
    for (let i: number = 0; i < this.cardMaxNum; i++) {
      // 乱数で入れ替えるカードを決める
      let cardNo = randomInt(0, this.cardMaxNum);
      console.log(cardNo);

      // カードの入れ替え
      let work: number = this.card[k];
      this.card[k] = this.card[cardNo];
      cardNo = work;
    }
  }

  public testA() {
    console.log("testA()");
    // this.testB(); // ok
  }

  private testB() {
    console.log("testB()");
  }
}
