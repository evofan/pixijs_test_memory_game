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

const BOUNDARY_RANGE_X: number = 28;
const BOUNDARY_RANGE_Y: number = 10;
const BOUNDARY_RANGE_WIDTH: number = 488;
const BOUNDARY_RANGE_HEIGHT: number = 488;

const FIRST = 1;
const NOT_FIRST = 2;

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

let cards_back: PIXI.Sprite[] = []; // 裏側の図柄のカード
let cards1st: PIXI.Sprite[] = []; // ペアのカード図柄の1枚目のカード
let cards2nd: PIXI.Sprite[] = []; // ペアのカード図柄の2枚目のカード

let rectangles: PIXI.Graphics[] = []; // ボタン領域描画用

let mouseEnabled: boolean = true; // ボタン連打防止用

let cardPicMaxNumTemp: number = 7; // カードの図柄の最大枚数, 0-6
let cardMaxNumTemp: number = 12; // カードの最大枚数, 1-12

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
  // temp
  card_6.interactive = true;
  card_6.buttonMode = true;
  card_6.interactiveChildren = true;
  card_6.name = "card_6"; // name: "card_6"

  card_6.on("tap", (e: InteractionEvent) => {
    //console.log("card_6 tap!", e, "\n2:", e.target, "\n3:", e.currentTarget,"\n4:", e.target['name']);
    console.log("card_6 tap!", e.target.name);
  });
  card_6.on("click", (e: InteractionEvent) => {
    console.log("card_6 click!", e.target.name);
  });
  /*
  InteractionEvent {stopped: false, stopsPropagatingAt: null, stopPropagationHint: false, target: Sprite, currentTarget: Sprite, …}
  currentTarget: null
  data: InteractionData {pressure: 0, rotationAngle: false, twist: 0, tangentialPressure: 0, global: Point, …}
  stopPropagationHint: false
  stopped: false
  stopsPropagatingAt: null
  target: null
  type: "tap"
  */

  // test rect
  // 25.長方形
  // すべての形状は、最初にPixiのGraphicsクラス（PIXI.Graphics）の新しいインスタンスを作成することによって作られます。
  let rectangle: PIXI.Graphics = new PIXI.Graphics();
  // 図形に輪郭を付ける場合は、lineStyleメソッドを使用します。四角形の幅4ピクセルの赤い輪郭をアルファ値1で指定する方法は次のとおりです。
  rectangle.lineStyle(4, 0xff3300, 1); // width, color, alpha

  // 長方形を描画するには、drawRect()メソッドを使用します。その4つの引数は、x、y、width、およびheightです。
  // rectangle.drawRect(x, y, width, height);

  // 終了したらendFill()を使用します。

  // Canvas Drawing APIとまったく同じです。
  // これが、四角形を描画し、その位置を変更し、それをステージに追加するために必要なすべてのコードです。

  rectangle.beginFill(0x66ccff);
  rectangle.drawRect(0, 0, 64, 64);
  rectangle.endFill();
  rectangle.x = 440;
  rectangle.y = 200;
  container.addChild(rectangle);

  rectangle.interactive = true;
  rectangle.buttonMode = true;
  rectangle.interactiveChildren = true;
  rectangle.name = "rectangle";

  // rectangle.visible = false; // visibleを使うとヒット判定も消える
  rectangle.alpha = 0.3; // alpha0ならヒット判定は有効、rectangle click! rectangle

  rectangle.on("tap", (e: InteractionEvent) => {
    //console.log("card_6 tap!", e, "\n2:", e.target, "\n3:", e.currentTarget,"\n4:", e.target['name']);
    console.log("rectangle tap!", e.target.name);
  });
  rectangle.on("click", (e: InteractionEvent) => {
    console.log("rectangle click!", e.target.name);
  });

  // app start
  gameLoopFlag = true;
  requestAnimationFrame(animate); // -> gameLoop start

  // カードの図柄のスプライトを登録する（ペアの1枚目）
  for (let i: number = 0; i < cardPicMaxNumTemp; i++) {
    cards1st[i] = new PIXI.Sprite(id[`pic_${i}.png`]);
    cards1st[i].scale.x = cards1st[i].scale.y = 0.25;
    cards1st[i].x = 30 + i * 50 + 10;
    cards1st[i].y = 300;
    container.addChild(cards1st[i]);
    cards1st[i].name = `cards1st_${i}`;
  }

  // カードの図柄のスプライトを登録する（ペアの2枚目）
  for (let j: number = 0; j < cardPicMaxNumTemp; j++) {
    console.log("j: ", j);
    cards2nd[j] = new PIXI.Sprite(id[`pic_${j}.png`]);
    cards2nd[j].scale.x = cards2nd[j].scale.y = 0.25;
    cards2nd[j].x = 30 + j * 50 + 10;
    cards2nd[j].y = 300;
    container.addChild(cards2nd[j]);
    cards2nd[j].name = `cards2nd_${j}`;
  }

  // 背景画像のスプライトをカード枚数分作成する
  for (let i: number = 0; i < cardMaxNumTemp; i++) {
    cards_back[i] = new PIXI.Sprite(id["pic_back.png"]);
    cards_back[i].scale.x = cards_back[i].scale.y = 0.25;
    cards_back[i].x = 30 + i * 50 + 10; //10;/////////////
    cards_back[i].y = 200;
    container.addChild(cards_back[i]);
    cards_back[i].name = `cards_back_${i}`;
  }

  // クリック用ヒットエリア
  for (let i: number = 0; i < cardMaxNumTemp; i++) {
    rectangles[i] = new PIXI.Graphics();
    rectangles[i].lineStyle(1, 0xff3300, 1); // width, color, alpha
    rectangles[i].beginFill(0x66ccff);
    // rectangles[i].drawRect(0, 0, 90, 90);
    rectangles[i].drawRect(0, 0, 50, 50);
    rectangles[i].endFill();
    //rectangles[i].x = 5 + (i % 4) * 110 + 10;
    // rectangles[i].y = 305 + (i % 3) * 110 + 10;
    rectangles[i].x = 30 + i * 50 + 10; //1
    rectangles[i].y = 350; //
    container.addChild(rectangles[i]);

    rectangles[i].interactive = true;
    rectangles[i].buttonMode = true;
    rectangles[i].interactiveChildren = true;
    rectangles[i].name = `rectangle_${i}`;

    // rectangle.visible = false; // visibleを使うとヒット判定も消える
    rectangles[i].alpha = 0.3; // alpha0ならヒット判定は有効、rectangle click! rectangle

    rectangles[i].on("tap", (e: InteractionEvent) => {
      //console.log("card_6 tap!", e, "\n2:", e.target, "\n3:", e.currentTarget,"\n4:", e.target['name']);
      console.log("rectangle tap!", e.target.name);
      cardgame.onClickTap(e);
    });
    rectangles[i].on("click", (e: InteractionEvent) => {
      if (mouseEnabled) {
        console.log("rectangle click!", e.target.name);
        cardgame.onClickTap(e);
      }
    });
  }

  // カードクラスのインスタンス生成
  const cardgame: CardGame = new CardGame();

  // カードを初期化する
  cardgame.init();

  // 最初に使うカードの絵を選び、並び順をシャッフルする（シャッフルボタン押下時も呼ばれる）
  cardgame.shuffle();

  // カードを全部並べる
  cardgame.update();
};

/**
 * カードゲーム（神経衰弱）クラス
 */
class CardGame {
  // TODO：元の本のプロパティを羅列してるが使わなくなったのは削除する
  public pict: number[] = []; // カードの絵を入れる配列
  public back: number = 0; // カードの裏の絵を入れる変数

  public cardMaxNum: number = 12; // カードの最大枚数, 1-12

  public count: number = 0; // ひっくり返されたカードの枚数、最大2枚、2枚ひっくり返したら元に戻す
  public openCard: [number, number] = [100, 100]; // ひっくり返された2枚のカード番号
  public stat: number[] = []; // 全部の（枚数の）カードの状態（0:裏、1:今回ひっくり返された、2:表のまま）

  public card: number[] = []; // カードの配列、セットされた絵の番号が入る
  public x: number[] = []; // カードのx座標
  public y: number[] = []; // カードのy座標
  public cardWidth: number = 200; // カード画像の横幅
  public cardHeight: number = 200; // カード画像の縦幅
  public cardMargin: number = 10; // カード画像を並べる時の余白

  public card1st2ndFlag: boolean[] = []; // 同一絵柄の1枚目のカードか2枚目のカードか
  public cardAll: PIXI.Sprite[] = []; // 1stと2ndを連番で格納したもの
  public openCardSprite: PIXI.Sprite[] = []; // 1枚目と2枚目に開いたカードのスプライト画像

  public selectNumBefore: number = -1; // 1枚目にめくったカード番号

  public rect1st: any = null; // 1枚目のヒット領域、カード選択時は続けて押せないように
  public rect2nd: any = null; // 2枚目のヒット領域、カード選択時は続けて押せないように

  public leftNum: number = this.cardMaxNum; // 残りカード枚数、0枚になったらクリア

  /**
   * 初期化する
   */
  public init(): void {
    console.log("init()");
    // カードを並べる（カードのx, y座標を設定）
    // カードをセットする
    for (let i: number = 0; i < this.cardMaxNum; i++) {
      this.stat[i] = 0; // 全部を裏側に
      this.card1st2ndFlag[i] = false; // ペアの1枚目を引いてない
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
      cards_back[i].x = 30 + i * 50 + 10;
      cards_back[i].y = 400; // ★最終的にはカードと合わせる、0でない場合はvisibleで消すか、最初の一回だけ裏側描画にする

      //      } else if (this.stat[i] === 2) {
      if (this.card1st2ndFlag[this.card[i]] === false) {
        console.log("ペアの1枚目が出たのでフラグをtrueに");
        this.card1st2ndFlag[this.card[i]] = true;
        console.log("ペアの1枚目の方のカード画像を表示");
        // 表側の絵を描く
        cards1st[this.card[i]].x = 30 + i * 50 + 10;
        cards1st[this.card[i]].y = 500;
        this.cardAll.push(cards1st[this.card[i]]);
      } else {
        console.log("ペアの2枚目の方のカード画像を表示");
        // 表側の絵を描く
        cards2nd[this.card[i]].x = 30 + i * 50 + 10;
        cards2nd[this.card[i]].y = 500;
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
    // マウスが押された座標を得る →★直に押したスプライトで取得？
    console.log("onClickTap() ", e, e.target.name);

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
      this.selectNumBefore = 1;

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
      this.selectNumBefore = selectNum;
    }

    // 2枚目のカードをひっくり返す処理
    else if (this.count === 1) {
      console.log("2枚目のカードをひっくり返す処理");
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
        this.stat[this.selectNumBefore] = CARD_COMPLETED;
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
        this.openCardSprite[0].y += 100;
        this.openCardSprite[1].y += 100;
        // 選択ボタンも押せないようにする、最終的には消すか領域外にするかmouseEnabedを消してα0.1にするとか
        // ★あと同じカードを2回続けて押せないようにする→1個で揃った判定になるので
        rectangles[this.selectNumBefore].y -= 100;
        rectangles[selectNum].y -= 100;
        this.rect1st.y = 450; // 領域外に？
        this.leftNum -= 2;
        console.log("this.leftNum: ", this.leftNum);
        if (this.leftNum === 0) {
          this.clearGame();
        }
      } else {
        console.log("絵が一致しないので元に戻す、sleepで数秒後に？");
        await this.sleep(2000);
        this.rect1st.visible = true; // 矩形をイネーブルに
        this.rect2nd.visible = true; // 矩形をイネーブルに // 特に2枚目をすぐに戻すとめくったカードが一瞬しか見えず分からない
        cards_back[this.selectNumBefore].visible = true;
        cards_back[selectNum].visible = true;
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
      // 2枚ひっくり返したらリセット
      this.count = 0;
      this.openCardSprite = [];
      this.openCard[0] = -1;
      this.openCard[1] = -1;
      this.rect1st = null;
      this.rect2nd = null;
      /*
      for (let i: number = 0; i < this.cardMaxNum; i++) {
        if (this.stat[i] === 1) {
          // 前回ひっくり返されたカードを元に戻す（前回一致:2のｊカードはそのまま）
          this.stat[i] = 0; // 裏に
          // repaint（再描画で裏の絵に）// ★前回ひっくり返したstat=1のみ裏側に戻す→stat=2で揃ってるのは戻さない
        }
      }
      */
      // クリア判定
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
