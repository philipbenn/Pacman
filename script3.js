"use strict";

window.addEventListener("load", start);

function start() {
  console.log("start");

  addEventListeners();
  createTiles();
  displayTiles();
  displayEntityPosition(pacman);
  displayPlayerposition();
  //requestAnimationFrame(tick);
}

function displayPlayerposition(){
  const visualPlayer = document.querySelector("#pacman");
  console.log(visualPlayer)
  visualPlayer.style.translate = `${pacman.x - pacman.regX}px ${pacman.y - pacman.regY}px`;
}

//#region Controller
let lastTimestamp = 0;
function tick(timestamp) {
  requestAnimationFrame(tick);

  const delta = (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;

  moveObject(pacman, delta);

  displayEntityPosition(pacman);
}

//#region movement
function moveObject(entity, delta) {}

function getDirection() {
  if (controls.up) {
    return "up";
  } else if (controls.down) {
    return "down";
  } else if (controls.left) {
    return "left";
  } else if (controls.right) {
    return "right";
  }
}
//#endregion

//#endregion

//#region Model

//#region pacman
const pacman = {
  name: "pacman",
  x: 100,
  y: 100,
  regX: 16,
  regY: 16,
  speed: 100,
  topspeed: 150,
  moving: false,
  direction: undefined,
};
//#endregion

//#region level
const tiles = [
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1],
  [1, 3, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 3, 1],
  [1, 3, 1, 2, 0, 1, 3, 1, 2, 0, 0, 1, 3, 1, 0, 2, 0, 1, 3, 1],
  [1, 3, 1, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1],
  [1, 3, 1, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1],
  [1, 3, 1, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1],
  [1, 3, 1, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1],
  [1, 3, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 3, 1],
  [1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const GRID_width = tiles[0].length;
const GRID_height = tiles.length;
const tile_size = 32;

//#endregion
//#endregion

//#region View
function createTiles() {
  const gameField = document.querySelector("#gamefield");

  const background = document.querySelector("#background");

  for (let row = 0; row < GRID_height; row++) {
    for (let col = 0; col < GRID_width; col++) {
      const tile = document.createElement("div");
      tile.classList.add("tile");

      background.append(tile);
    }
  }
  background.style.setProperty("--GRID_WIDTH", GRID_width);
  background.style.setProperty("--GRID_HEIGHT", GRID_height);
  background.style.setProperty("--TILE_SIZE", tile_size + "px");

  gameField.style.setProperty("--GRID_WIDTH", GRID_width);
  gameField.style.setProperty("--GRID_HEIGHT", GRID_height);
  gameField.style.setProperty("--TILE_SIZE", tile_size + "px");
}

function displayTiles() {
  const visualTiles = document.querySelectorAll("#background .tile");

  for (let row = 0; row < GRID_height; row++) {
    for (let col = 0; col < GRID_width; col++) {
      const tile = getTileAtCoord({ row, col });
      const visualTile = visualTiles[row * GRID_width + col];

      visualTile.classList.add(getClassForTileType(tile));
    }
  }
}

function displayEntityPosition(entity) {
  const visualEntity = document.querySelector(`#${entity.name}`);
  console.log(visualEntity);
  console.log(entity.x)
  visualEntity.style.translate = `${entity.x - entity.regX}px ${entity.y - entity.rexY}px)`;
}
//#endregion

//#region Utility
function getTileAtCoord({ row, col }) {
  return tiles[row][col];
}

function getClassForTileType(tile) {
  switch (tile) {
    case 0:
      return "empty";
    case 1:
      return "wall";
    case 2:
      return "coin";
    case 3:
      return "xp";
  }
}

const controls = {
  up: false,
  down: false,
  left: false,
  right: false,
};
//#endregion

//#region Debugging
//#endregion

//#region Eventlisteners
function addEventListeners() {
  window.addEventListener("keydown", keyDown);
}

function keyDown(e) {
  controls.left = false;
  controls.right = false;
  controls.up = false;
  controls.down = false;

  if (e.key === "ArrowUp") {
    controls.up = true;
  } else if (e.key === "ArrowDown") {
    controls.down = true;
  } else if (e.key === "ArrowLeft") {
    controls.left = true;
  } else if (e.key === "ArrowRight") {
    controls.right = true;
  }
}
//#endregion
