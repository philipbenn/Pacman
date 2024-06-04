"use strict";

window.addEventListener("load", start);

function start() {
  console.log("start");

  addEventListeners();
  createGrid();
  displayGrid();
  requestAnimationFrame(tick);
}

//#region Controller
const updateInterval = 200;
let lastTimestamp = 0;
function tick(timestamp) {
  if(timestamp - lastTimestamp > updateInterval){
    moveObject(pacman)
    displayEntityPosition(pacman);
    lastTimestamp = timestamp;
  }
  requestAnimationFrame(tick);
}

//#region movement
let lastDirection = "down";
function moveObject(entity) {
  let tempDirection = getDirection(getDirectionFromControls());

  let newPos = { x: entity.x, y: entity.y };
  newPos.x += tempDirection.x
  newPos.y += tempDirection.y

  
  if (canMoveTo(newPos)) {
  entity.x = newPos.x;
  entity.y = newPos.y;
  lastDirection = getDirectionFromControls();
  } else {
    tempDirection = getDirection(lastDirection);
    newPos = { x: entity.x, y: entity.y };
    newPos.x += tempDirection.x;
    newPos.y += tempDirection.y;
    if(canMoveTo(newPos)){
      entity.x = newPos.x;
      entity.y = newPos.y;
    }
  }
}

function canMoveTo(pos){
  if(pos.x < 0 || pos.x > GRID_width - 1 || pos.y < 0 || pos.y > GRID_height - 1){
    return false;
  }
  if(getTileAtCoord({row: pos.y, col: pos.x}) === 1){
    return false;
  }
  return true;

}

function getDirection(direction) {
  if (direction === "up") {
    let temp = { x: 0, y: -1 };
    return temp;
  } else if (direction === "down") {
    let temp = { x: 0, y: 1 };
    return temp;
  } else if (direction === "left") {
    let temp = { x: -1, y: 0 };
    return temp;
  } else if (direction === "right") {
    let temp = { x: 1, y: 0 };
    return temp;
  }
  return { x: 0, y: 0 };
}

//#endregion

//#endregion

//#region Model

//#region pacman
const pacman = {
  name: "pacman",
  x: 0,
  y: 0,
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

//make the array into a graphs


//#endregion
//#endregion

//#region View
function createGrid(){
  const board = document.querySelector("#gameBoard");
  board.style.setProperty("--GRID_WIDTH", GRID_width);
  for(let row = 0; row < GRID_height; row++){
    for(let col = 0; col < GRID_width; col++){
      const cell = document.createElement("div");
      cell.classList.add("cell");
      board.append(cell);
    }
  }
}

function displayGrid(){
  const cells = document.querySelectorAll("#gameBoard .cell");
  cells.forEach((cell, index) => {
    const row = Math.floor(index / GRID_width);
    const col = index % GRID_width;
    const tile = getTileAtCoord({row, col});
    cell.classList.add(getClassForTileType(tile));
  });
}

function displayEntityPosition(entity) {
  const visualPlayer = document.querySelector(`#${entity.name}`);
  visualPlayer.style.transform = `translate(${entity.x * tile_size}px, ${entity.y * tile_size}px)`;
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

function getDirectionFromControls() {
  if (controls.up) {
    return "up";
  } else if (controls.down) {
    return "down";
  } else if (controls.left) {
    return "left";
  } else if (controls.right) {
    return "right";
  }
  return undefined;

}
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
