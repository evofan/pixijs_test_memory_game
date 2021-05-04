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
// const ASSET_OBJ1: string = ASSETS.ASSET_OBJ1;

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

let gameState: string = "init";
let gameLoopFlag: boolean = false;

let gameScene: PIXI.Container = new PIXI.Container();
let gameOverScene: PIXI.Container = new PIXI.Container();
let gameClearScene: PIXI.Container = new PIXI.Container();
let message_gameover: PIXI.Text;
let message_gameclear: PIXI.Text;

// text
let text_pixiVersion: PIXI.Text;

if (ASSET_BG === "") {
  console.log("Don't use background image.");
} else {
  loader.add("bg_data", ASSET_BG);
}
// loader.add("obj_1_data", ASSET_OBJ1);

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

// function

/**
 * Runs the current game state in a loop and renders the sprite.
 * @param delta
 */
const gameLoop = (delta: number): void => {
  // console.log("gameLoop()", delta);
};

/**
 * The setup() function is executed as soon as the texture atlas image is loaded.
 * It runs only once and allows you to run the setup task only once for your game.
 * Great place to create and initialize objects, sprites, game scenes, generate data arrays, and analyze loaded JSON game data.
 * @param resources
 */
const gameSetup = (resources: any): void => {
  console.log("gameSetup()");

  gameState = "play";

  // app start
  gameLoopFlag = true;
  requestAnimationFrame(animate); // -> gameLoop start
};
