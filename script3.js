"use strict";

window.addEventListener("load", start);

function start() {
  console.log("start");

  addEventListeners();
  createGrid();
  displayGrid();
  spawnGhosts();
  requestAnimationFrame(tick);
}

//#region Controller
const updateInterval = 200;
let lastTimestamp = 0;
function tick(timestamp) {

  if(timestamp - lastTimestamp > updateInterval){
    moveObject(pacman)
    displayEntityPosition(pacman);
    displayEntityAnimation(pacman);

    //moveObject(aStarGhost);
    for(let ghost of ghosts){
      displayEntityPosition(ghost);
    }
    //displayEntityAnimation(aStarGhost);
    lastTimestamp = timestamp;
  }

  if (powerUpActive) {
    for(let ghost of ghosts){
      addBlinkingEffect(ghost);
    }
    powerUpDuration--;
    if (powerUpDuration <= 0) {
      for(let ghost of ghosts){
        removeBlinkingEffect(ghost);
      }
      powerUpActive = false;
    }
  }
  
  displayGrid();
  gameOverCheck();
  requestAnimationFrame(tick);
}

//#region movement
let lastDirection = "right";
function moveObject(entity) {
  let inputDirection = getDirectionFromControls();
  let tempDirection = getDirection(inputDirection);

  let newPos = { x: entity.x, y: entity.y };
  newPos.x += tempDirection.x
  newPos.y += tempDirection.y

  
  if (canMoveTo(newPos)) {
  entity.x = newPos.x;
  entity.y = newPos.y;
  entity.moving = true;
  entity.direction = inputDirection;
  if(entity.name === "pacman"){
    checkForItems(entity.x, entity.y);
  }
  lastDirection = inputDirection;
  } else {
    tempDirection = getDirection(lastDirection);
    newPos = { x: entity.x, y: entity.y };
    newPos.x += tempDirection.x;
    newPos.y += tempDirection.y;
    if(canMoveTo(newPos)){
      entity.x = newPos.x;//todo extract method from this as this is a duplicate of the if statement above
      entity.y = newPos.y;
      entity.moving = true;
      entity.direction = inputDirection;
      if(entity.name === "pacman"){
        checkForItems(entity.x, entity.y);
      }
    } else {
      entity.moving = false;
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
function gameOverScreen() {
  console.log("Game Over");

  const gameOverScreen = document.createElement("div");
  gameOverScreen.classList.add("gameOverPopUp");
  gameOverScreen.innerHTML = `
    <h1>Game Over</h1>
    <button id="restartButton">Restart</button>
  `;
  document.body.append(gameOverScreen);

  // Remove Pacman and ghosts from the screen
  despawnEntity(pacman);
  ghosts.forEach(ghost => despawnEntity(ghost));

  // Add an event listener to the restart button to reload the game
  document.getElementById("restartButton").addEventListener("click", () => {
    location.reload();
  });

  window.removeEventListener("keydown", keyDown);
}


//#endregion

//#region pacman
let gameOver = false;

function gameOverCheck() {
  for (let ghost of ghosts) {
    if (powerUpActive && pacman.x === ghost.x && pacman.y === ghost.y) {
      console.log("Ghost has been Eaten!");

      ghosts.splice(ghosts.indexOf(ghost), 1);
      despawnEntity(ghost);

    } else if (!powerUpActive && pacman.x === ghost.x && pacman.y === ghost.y) {
      if (!gameOver) {
        gameOver = true;
        gameOverScreen();
      }
    }
  }
}


const pacman = {
  name: "pacman",
  x: 0,
  y: 0,
  moving: false,
  direction: undefined,
};
let powerUpActive = false;
let powerUpDuration = 0;

function eatPowerUp(){
  powerUpActive = true;
  powerUpDuration = 1000;
}


//#endregion

//#region ghost
const aStarGhost = {
  name: "aStarGhost",
  x: 8,
   y: 5,
  moving: false,
  direction: undefined,
};

const djikstraGhost = {
  name: "djikstraGhost",
  x: 1,
  y: 5, 
  moving: false,
  direction: undefined,
};

const gbfsGhost = {
  name: "gbfsGhost",
  x: 15,
  y: 5,
  moving: false,
  direction: undefined,
};

let ghosts = [aStarGhost, djikstraGhost, gbfsGhost];

function spawnGhosts(){
  const ghostContainer = document.querySelector("#ghosts");
  const ghostFrameHeight = 32;
  const ghostColors = 3;
  let ghostColorIncrement = 0;

  for(let ghost of ghosts){
    const visualGhost = document.createElement("div");
    visualGhost.classList.add("ghost");
    visualGhost.id = ghost.name;
    ghostContainer.append(visualGhost);
    visualGhost.style.backgroundPosition = `0px -${(ghostColorIncrement % ghostColors) * ghostFrameHeight}px`;
    ghostColorIncrement++;
  }
}

//#endregion

//#region level
const tiles = [
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 3, 3, 3, 3, 3, 1],
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
      cell.dataset.row = row;
      cell.dataset.col = col;
      board.append(cell);
    }
  }
}

function addBlinkingEffect(entity){
  const visualEntity = document.querySelector(`#${entity.name}`);
  visualEntity.classList.add("blinking");

}

function removeBlinkingEffect(entity){
  const visualEntity = document.querySelector(`#${entity.name}`);
  visualEntity.classList.remove("blinking");

}

function despawnEntity(entity){
  const visualEntity = document.querySelector(`#${entity.name}`);
  visualEntity.remove();

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

function displayEntityAnimation(entity) {
  const visualPlayer = document.querySelector(`#${entity.name}`);
  if (entity.direction && !visualPlayer.classList.contains(entity.direction)){
    visualPlayer.classList.remove("up", "down", "left", "right");
    visualPlayer.classList.add(`${entity.direction}`);
    if(!visualPlayer.classList.contains("animateVer") || !visualPlayer.classList.contains("animateHor")){
      if(entity.direction === "up" || entity.direction === "down"){
        visualPlayer.classList.remove("animateHor");
        visualPlayer.classList.add("animateVer");
      } else {
        visualPlayer.classList.remove("animateVer");
        visualPlayer.classList.add("animateHor");
      }
    }
  } 

  
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

const aStarControls = {
  up: false,
  down: false,
  left: false,
  right: false,
};

const djikstraControls = {
  up: false,
  down: false,
  left: false,
  right: false,
};

const gbfsControls = {
  up: false,
  down: false,
  left: false,
  right: false,
 }

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

function checkForItems(x, y) {
  const item = getItemFromGrid(x, y);

  if (item === 2) {
    console.log("coin");
    eatPowerUp();
  }
  if (item === 3) {
    console.log("xp");
  }
  takeItem(x, y);
}

function getItemFromGrid(x, y) {
  return tiles[y][x];
}

function takeItem(col, row) {
  const visualItem = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
  visualItem.classList.remove(getClassForTileType(getItemFromGrid(col, row)));
  tiles[row][col] = 0;

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

  if (e.key === "ArrowUp" || e.key === "w") {
    controls.up = true;
  } else if (e.key === "ArrowDown" || e.key === "s") {
    controls.down = true;
  } else if (e.key === "ArrowLeft" || e.key === "a") {
    controls.left = true;
  } else if (e.key === "ArrowRight" || e.key === "d") {
    controls.right = true;
  }
}
//#endregion
