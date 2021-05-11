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
import {
  AnimatedSprite,
  DisplayObject,
  InteractionEvent,
  Sprite,
} from "pixi.js";
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

const CARD_CLOSED: number = 0;
const CARD_OPEN: number = 1;
const CARD_COMPLETED: number = 2;

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

// button off cover
let buttonOffRect: PIXI.Graphics = new PIXI.Graphics();
buttonOffRect.lineStyle(1, 0xff0033, 1); // width, color, alpha
buttonOffRect.beginFill(0xff0033);
buttonOffRect.drawRect(0, 0, WIDTH, HEIGHT);
buttonOffRect.endFill();
buttonOffRect.alpha = 0;
buttonOffRect.visible = false;
buttonOffRect.interactive = true;
buttonOffRect.interactiveChildren = false;
buttonOffRect.buttonMode = false;

// init
let bg: PIXI.Sprite;
let pic_gametitle: PIXI.Sprite;

let gameLoopFlag: boolean = false;

// text
let text_pixiVersion: PIXI.Text;

let gameClearScene: PIXI.Container = new PIXI.Container();
let message_gameclear: PIXI.Text;

let cards_back: PIXI.Sprite[] = []; // 裏側の図柄のカード
let cards1st: PIXI.Sprite[] = []; // ペアのカード図柄の1枚目のカード
let cards2nd: PIXI.Sprite[] = []; // ペアのカード図柄の2枚目のカード

let rectangles: PIXI.Graphics[] = []; // ボタン領域描画用

let mouseEnabled: boolean = true; // ボタン連打防止用

let cardPicMaxNumTemp: number = 7; // カードの図柄の最大枚数, 0-6
let cardMaxNumTemp: number = 12; // カードの最大枚数, 1-12

let offsetX: number = 100; // カードを並べ始めるx起点（画面左上から）
let offsetY: number = 110; // カードを並べ始めるy起点（画面左上から）
let cardCols: number = 4;
let cardRows: number = 3;
let cardWidth: number = 92;
let cardHeight: number = 135;
let cardOffset: number = 10;

let cardShine1: PIXI.AnimatedSprite;
let cardShine2: PIXI.AnimatedSprite;

let cardOpenSound: Howl;

if (ASSETS.ASSET_BG === "") {
  console.log("Don't use background image.");
} else {
  loader.add("bg_data", ASSETS.ASSET_BG);
}
loader.add("obj_1_data", ASSETS.ASSET_OBJ1);
loader.add("obj_2_data", ASSETS.ASSET_OBJ2);
loader.add("obj_3_data", ASSETS.ASSET_OBJ3);
loader.add("obj_4_data", ASSETS.ASSET_OBJ4);
loader.add("obj_5_data", ASSETS.ASSET_OBJ5);
loader.add("obj_6_data", ASSETS.ASSET_OBJ6);
loader.add("obj_7_data", ASSETS.ASSET_OBJ7);

loader.load((loader: PIXI.Loader, resources: any) => {
  console.log(loader);
  console.log(resources);

  // bg
  if (ASSETS.ASSET_BG !== "") {
    bg = new PIXI.Sprite(resources.bg_data.texture);
    container.addChild(bg);
  }

  // title
  pic_gametitle = new PIXI.Sprite(resources.obj_2_data.texture);
  pic_gametitle.scale.x = 0.75;
  pic_gametitle.scale.y = 0.75;
  pic_gametitle.x = WIDTH / 2 - pic_gametitle.width / 2;
  pic_gametitle.y = 20;

  container.addChild(pic_gametitle);

  container.addChild(gameClearScene);
  gameClearScene.visible = false;

  let style: PIXI.TextStyle = new PIXI.TextStyle({
    fontFamily: "Futura",
    fontSize: 64,
    fill: "white",
  });
  message_gameclear = new PIXI.Text("Game Clear!", style);
  message_gameclear.x = WIDTH / 2;
  message_gameclear.y = HEIGHT / 2;
  message_gameclear.anchor.set(0.5, 0.5);
  message_gameclear.scale.x = 0.5;
  message_gameclear.scale.y = 0.5;
  message_gameclear.alpha = 1; // TODO: tween
  gameClearScene.addChild(message_gameclear);

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

  // Create card sprite

  // Set sprite sheet(texture atras frame)
  let id: any = resources.obj_1_data.textures;
  let scaleNum: number = 0.5;

  // Register the sprite of the card design(1/2)
  for (let i: number = 0; i < cardPicMaxNumTemp; i++) {
    cards1st[i] = new PIXI.Sprite(id[`pic_trumpx2_${i}.png`]);
    cards1st[i].scale.x = cards1st[i].scale.y = scaleNum;
    cards1st[i].x = -1000;
    cards1st[i].y = -1000;
    container.addChild(cards1st[i]);
    cards1st[i].name = `cards1st_${i}`;
  }

  // Register the sprite of the card design(2/2).
  for (let j: number = 0; j < cardPicMaxNumTemp; j++) {
    cards2nd[j] = new PIXI.Sprite(id[`pic_trumpx2_${j}.png`]);
    cards2nd[j].scale.x = cards2nd[j].scale.y = scaleNum;
    cards2nd[j].x = -1000;
    cards2nd[j].y = -1000;
    container.addChild(cards2nd[j]);
    cards2nd[j].name = `cards2nd_${j}`;
  }

  // Create sprites for the background image of the cards.
  for (let i: number = 0; i < cardMaxNumTemp; i++) {
    cards_back[i] = new PIXI.Sprite(id["pic_trumpx2_cover.png"]);
    cards_back[i].scale.x = cards_back[i].scale.y = scaleNum;
    cards_back[i].x = -1000;
    cards_back[i].y = -1000;
    container.addChild(cards_back[i]);
    cards_back[i].name = `cards_back_${i}`;
  }

  // hit area for click, tap
  for (let i: number = 0; i < cardMaxNumTemp; i++) {
    rectangles[i] = new PIXI.Graphics();
    rectangles[i].lineStyle(1, 0xff3300, 0); // width, color, alpha
    rectangles[i].beginFill(0x66ccff);
    rectangles[i].drawRect(0, 0, cardWidth, cardHeight);
    rectangles[i].endFill();
    rectangles[i].x = offsetX + (i % cardCols) * (cardWidth + cardOffset);
    rectangles[i].y = offsetY + (i % cardRows) * (cardHeight + cardOffset);
    //rectangles[i].x = 30 + i * 50 + 10;
    container.addChild(rectangles[i]);

    rectangles[i].interactive = true;
    rectangles[i].buttonMode = true;
    rectangles[i].interactiveChildren = true;
    rectangles[i].name = `rectangle_${i}`;

    // rectangle.visible = false; // Hit judgment disappears when using visible=false.
    rectangles[i].alpha = 0.0; // If alpha=0, hit judgment is valid.

    rectangles[i].on("tap", (e: InteractionEvent) => {
      if (mouseEnabled) {
        console.log("rectangle tap!", e.target.name);
        cardgame.onClickTap(e);
      }
    });
    rectangles[i].on("click", (e: InteractionEvent) => {
      if (mouseEnabled) {
        console.log("rectangle click!", e.target.name);
        cardgame.onClickTap(e);
      }
    });
  }

  // Create Animated sprite
  let cardShineImages1: string[] = [
    "assets/images/pic_light_1.png",
    "assets/images/pic_light_1.png",
    "assets/images/pic_light_2.png",
    "assets/images/pic_light_3.png",
    "assets/images/pic_light_4.png",
  ];
  let textureArray: PIXI.Texture[] = [];
  for (let i: number = 0; i < 5; i++) {
    let texture: PIXI.Texture = PIXI.Texture.from(cardShineImages1[i]);
    textureArray.push(texture);
  }

  cardShine1 = new PIXI.AnimatedSprite(textureArray);
  cardShine1.x = -1000;
  cardShine1.y = -1000;
  cardShine1.scale.set(0.5);
  cardShine1.animationSpeed = 0.2;
  cardShine1.loop = false;
  cardShine1.alpha = 0.75;
  cardShine1.play();
  cardShine1.onComplete = () => {
    console.log("cardShine1 anim.totalFrames: ", cardShine1.totalFrames);
    console.log("cardShine1 animation end");
    cardShine1.visible = false;
  };
  container.addChild(cardShine1);

  cardShine2 = new PIXI.AnimatedSprite(textureArray);
  cardShine2.x = -1000;
  cardShine2.y = -1000;
  cardShine2.scale.set(0.5);
  cardShine2.animationSpeed = 0.2;
  cardShine2.loop = false;
  cardShine2.alpha = 0.75;
  cardShine2.play();
  cardShine2.onComplete = () => {
    console.log("cardShine2 anim.totalFrames: ", cardShine2.totalFrames);
    console.log("cardShine2 animation end");
    cardShine2.visible = false;
  };
  container.addChild(cardShine2);

  // SE
  cardOpenSound = new Howl({
    src: [resources.obj_7_data.url],
    autoplay: false,
    loop: false,
    volume: 0.1,
    onend: () => {
      console.log("cardOpenSound finished.");
    },
  });

  // main class
  const cardgame: CardGame = new CardGame();

  cardgame.init();

  cardgame.shuffle();

  cardgame.update();

  // app start
  gameLoopFlag = true;
  requestAnimationFrame(animate); // -> gameLoop start
};

/**
 * Memory Game Main Class
 */
class CardGame {
  // TODO：元の本のプロパティを羅列してるが使わなくなったのは削除する

  public cardMaxNum: number = 12; // Maximum number of cards

  public count: number = 0; // Number of opeped cards
  public openCard: [number, number] = [100, 100]; // two card, that now opened
  public stat: number[] = []; // State of all cards (0: back、1: now opened、2: open）

  public card: number[] = []; // Enter the number of the picture on the card

  public isSameCard1st: boolean[] = []; // drawing the first card with the same pattern
  public cardAll: PIXI.Sprite[] = []; // 1stと2ndを連番で格納したもの
  public openCardSprite: PIXI.Sprite[] = []; // 1枚目と2枚目に開いたカードのスプライト画像

  public selectNum1st: number = -1; // First opened card number

  public rect1st: any = null; // 1枚目のヒット領域、カード選択時は続けて押せないように、★visibleで制御に変更したら削除
  public rect2nd: any = null; // 2枚目のヒット領域、カード選択時は続けて押せないように

  public leftNum: number = this.cardMaxNum; // Number of remaining cards, 0 = gameclear

  /**
   * Initialize the card order.
   */
  public init(): void {
    console.log("init()");
    // set card state
    for (let i: number = 0; i < this.cardMaxNum; i++) {
      this.stat[i] = 0;
      this.isSameCard1st[i] = false;
    }
    console.log("this.stat: ", this.stat);

    // shuffle();
    // マウスリスナーとして自分を登録

    this.count = 0;
  }

  public paint(): void {
    // update(g)
  }

  public update(): void {
    console.log("update()");
    // バックをオレンジで塗る
    // タイトルの描画 →この辺の描画周りはloaderのコールバックにまとめる、かクラス内にまとめる？

    // this.card=[6,3,2,1,5,4,2,6,5,3,4,1];
    //console.log();
    //this.stat[2] = 2;
    //this.stat[6] = 2;

    // 表を表示するテスト
    // this.stat = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2];

    // カードの描画
    console.log("this.stat: ", this.stat);
    for (let i: number = 0; i < this.cardMaxNum; i++) {
      //if (this.stat[i] === 0) {
      // 裏側の絵を描く
      cards_back[i].x = offsetX + (i % cardCols) * (cardWidth + cardOffset);
      cards_back[i].y = offsetY + (i % cardRows) * (cardHeight + cardOffset);
      // ★最終的にはカードと合わせる、0でない場合はvisibleで消すか、最初の一回だけ裏側描画にする

      //      } else if (this.stat[i] === 2) {
      if (this.isSameCard1st[this.card[i]] === false) {
        console.log("ペアの1枚目が出たのでフラグをtrueに");
        this.isSameCard1st[this.card[i]] = true;
        console.log("ペアの1枚目の方のカード画像を表示");
        // 表側の絵を描く
        cards1st[this.card[i]].x =
          offsetX + (i % cardCols) * (cardWidth + cardOffset);
        cards1st[this.card[i]].y =
          offsetY + (i % cardRows) * (cardHeight + cardOffset);
        this.cardAll.push(cards1st[this.card[i]]);
      } else {
        console.log("ペアの2枚目の方のカード画像を表示");
        // 表側の絵を描く
        cards2nd[this.card[i]].x =
          offsetX + (i % cardCols) * (cardWidth + cardOffset);
        cards2nd[this.card[i]].y =
          offsetY + (i % cardRows) * (cardHeight + cardOffset);
        this.cardAll.push(cards2nd[this.card[i]]);
      }
      // }
    }
    console.log("this.cardAll: ", this.cardAll);

    // シャッフルボタンの描画
  }

  /**
   * カードがクリック又はタップされた時に呼ばれる
   * @param e
   */
  public async onClickTap(e: InteractionEvent) {
    console.log("onClickTap() ", e, e.target.name);

    // se
    cardOpenSound.stop();
    cardOpenSound.play();

    mouseEnabled = false;
    //let ix: number = e.movementX;
    //let iy: number = e.movementY;

    // 押した座標がシャッフルボタンの場合、カードをセットし直す →★直に押したボタンから飛ぶ？
    // if(){
    //   shuffle();
    //   repaint();
    // }

    // 1枚目のカードをひっくり返す前の処理＝前回のカードを裏返しにする
    /*
    for (let i: number = 0; i < this.cardMaxNum; i++) {
      if (this.stat[i] === 1) {
        // 前回ひっくり返されたカードを元に戻す（前回一致:2のｊカードはそのまま）
        this.stat[i] = 0; // 裏に
        // repaint（再描画で裏の絵に）// ★前回ひっくり返したstat=1のみ裏側に戻す→stat=2で揃ってるのは戻さない
      }
    }
    */
    console.log("stat: ", this.stat);

    // 今回ひっくり返すカードの処理
    // 元のコードではマウスの押された座標から、行と列を割り出し、その値を使用して指定のカードを決定

    console.log("今回ひっくり返すカードの処理");
    let tempStr: string = String(e.target.name);
    let selectNum: number = Number(tempStr.substr(10));
    console.log("selectNum: ", selectNum);

    // 1枚目のカードをひっくり返す処理
    if (this.count === 0) {
      // 矩形をマウス押下出来ないようにする
      // e.target.visible = false;
      this.rect1st = e.target;
      this.rect1st.visible = false;

      for (let i: number = 0; i < this.cardMaxNum; i++) {
        if (this.stat[i] === CARD_OPEN) {
          // 前回ひっくり返されたカードを元に戻す（前回一致:2のｊカードはそのまま）
          this.stat[i] = CARD_CLOSED; // 裏に
          // repaint（再描画で裏の絵に）// ★前回ひっくり返したstat=1のみ裏側に戻す→stat=2で揃ってるのは戻さない
        }
      }

      this.openCardSprite = [];
      this.openCard[0] = -1;
      this.openCard[1] = -1;
      this.selectNum1st = 1;

      console.log("1枚目のカードをひっくり返す処理");
      if (this.stat[selectNum] === CARD_CLOSED) {
        console.log("裏→今ひっ繰り返した状態に");
        this.stat[selectNum] = CARD_OPEN; // 今ひっ繰り返した状態

        cards_back[selectNum].visible = false; // カード裏画像を非表示に＝下に重なっていたカードの表が見える

        this.openCard[0] = this.card[selectNum];
        console.log("this.openCard[0]: ", this.openCard[0]);
        console.log("this.openCard[this.count]", this.openCard[this.count]);

        this.openCardSprite[0] = this.cardAll[selectNum];
        console.log("this.openCardSprite[0]: ", this.openCardSprite[0].name);
      }
      console.log("stat[1枚目後]: ", this.stat);
      this.selectNum1st = selectNum;
    }

    // 2枚目のカードをひっくり返す処理
    else if (this.count === 1) {
      console.log("2枚目のカードをひっくり返す処理");

      // ボタンオフに
      container.addChild(buttonOffRect);
      buttonOffRect.visible = true;

      this.stat[selectNum] = CARD_OPEN; // 今ひっ繰り返した状態

      this.rect2nd = e.target;
      this.rect2nd.visible = false;

      cards_back[selectNum].visible = false; // カード裏画像を非表示に＝下に重なっていたカードの表が見える

      this.openCard[1] = this.card[selectNum];
      console.log("this.openCard[1]: ", this.openCard[1]);
      console.log("this.openCard[this.count]", this.openCard[this.count]);

      this.openCardSprite[1] = this.cardAll[selectNum];
      console.log("this.openCardSprite[1]: ", this.openCardSprite[1].name);

      console.log(
        "ここで1枚目と2枚目のカードを表示: ",
        this.openCard[0],
        this.openCard[1]
      );

      if (this.openCard[0] === this.openCard[1]) {
        console.log("絵が一致したらカードの状態を表に固定する");
        // 絵が一致したらカードの状態を表に固定する
        this.stat[this.selectNum1st] = CARD_COMPLETED;
        this.stat[selectNum] = CARD_COMPLETED;
        // 下に移動（仮
        //this.cardAll[this.openCard[0].y +=100
        console.log(
          "this.openCardSprite[0].name: ",
          this.openCardSprite[0].name
        );
        console.log(
          "this.openCardSprite[1].name: ",
          this.openCardSprite[1].name
        );

        // カードを輝かせる
        await this.sleep(300);
        cardShine1.x = this.openCardSprite[0].x;
        cardShine1.y = this.openCardSprite[0].y;
        cardShine1.visible = true;
        cardShine1.gotoAndStop(1);
        cardShine1.play();

        cardShine2.x = this.openCardSprite[1].x;
        cardShine2.y = this.openCardSprite[1].y;
        cardShine2.visible = true;
        cardShine2.gotoAndStop(1);
        cardShine2.play();

        // ちょっと待ってから右下に移動？エフェクトも欲しい
        await this.sleep(1500);
        this.openCardSprite[0].x = 100 + (this.cardMaxNum - this.leftNum) * 5;
        this.openCardSprite[0].y = 550;
        this.openCardSprite[1].x = 110 + (this.cardMaxNum - this.leftNum) * 5;
        this.openCardSprite[1].y = 550;
        container.addChild(this.openCardSprite[0]);
        container.addChild(this.openCardSprite[1]);
        // 選択ボタンも押せないようにする、最終的には消すか領域外にするかmouseEnabedを消してα0.1にするとか
        // ★あと同じカードを2回続けて押せないようにする→1個で揃った判定になるので
        rectangles[this.selectNum1st].y -= 100;
        rectangles[selectNum].y -= 100;
        this.rect1st.y = 450; // 領域外に？
        this.leftNum -= 2;
        console.log("this.leftNum: ", this.leftNum);
        // ボタンオンに
        container.removeChild(buttonOffRect);
        if (this.leftNum === 0) {
          this.clearGame();
        }
      } else {
        console.log("絵が一致しないので元に戻す、sleepで数秒後に？");
        await this.sleep(1500);
        this.rect1st.visible = true; // 矩形をイネーブルに
        this.rect2nd.visible = true; // 矩形をイネーブルに // 特に2枚目をすぐに戻すとめくったカードが一瞬しか見えず分からない
        cards_back[this.selectNum1st].visible = true;
        cards_back[selectNum].visible = true;
        // ボタンオンに
        container.removeChild(buttonOffRect);
      }
      console.log("stat[2枚目後]: ", this.stat);
    }

    /*
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
      */

    // 現在何枚のカードがひっくり返されたか
    this.count = this.count + 1;
    if (this.count === 2) {
      this.count = 0;
      this.openCardSprite = [];
      this.openCard[0] = -1;
      this.openCard[1] = -1;
      this.rect1st = null;
      this.rect2nd = null;
    }

    mouseEnabled = true; // 連打防止用、他の方法でもいいかも
  }

  /**
   * カードをシャッフルする
   * ・最初に使用しないカード番号を1組決める
   * ・それ以外をペアで並べ、その後ランダム順に並べ替える
   * ・TODO: ゲームの途中でも残りをシャッフル出来るようにする（ボタンから呼ばれる）
   */
  public shuffle(): void {
    // 変数の初期化
    this.count = 0; // ひっくり返されたカード枚数を0枚にリセット
    this.stat.map((idx) => {
      // カードを全て裏の状態に戻す
      this.stat[idx] = 0;
    });

    // 使わないカード番号1組を乱数で決める
    let notUseCard: number = randomInt(0, cardPicMaxNumTemp - 1); // 0-6の7枚
    console.log(`notUseCard: ${notUseCard}`);

    // カード番号にカード図柄の番号をセットする
    let k: number = 0;
    for (let i: number = 0; i < 7; i++) {
      if (i !== notUseCard) {
        // notUseCard以外の絵の番号をセット、2枚組でセットされる
        this.card[k] = i;
        this.card[k + 1] = i;
        k = k + 2;
      }
    }
    console.log(`this.card（1組の絵を削除後）: ${this.card}`); // ex. this.card: 0,0,1,1,2,2,3,3,5,5,6,6

    // カードの順番を入れ替える
    // カードの枚数だけループ
    for (let j: number = 0; j < this.cardMaxNum; j++) {
      // 乱数で入れ替えるカードを決める
      let rndNum: number = randomInt(0, this.cardMaxNum - 1); // バブルソート等、他のソード方法でもいいかも
      console.log(rndNum);
      // カードの入れ替え
      let tempNum: number = this.card[j];
      this.card[j] = this.card[rndNum];
      this.card[rndNum] = tempNum;
    }
    console.log(`this.card（並べ替え後）: ${this.card}`); // ex. this.card（並べ替え後）: 5,3,6,1,0,4,5,1,3,6,4,0
  }

  /**
   * ゲームクリア処理
   */
  private clearGame(): void {
    console.log("clearGame()");
    mouseEnabled = false;
    gameClearScene.visible = true;
  }

  /**
   * 数秒待つ
   * @param ms
   * @returns
   */
  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// マウスオーバーで数pixelカードが上がって、アウトで下がるとか
