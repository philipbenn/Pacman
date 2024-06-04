"use strict";

window.addEventListener("load", start);

function start(){
    console.log("Js is running")
    
    document.addEventListener("keydown", keyPress);

    createTiles();
    displayTiles();
    spawnGhosts();
    requestAnimationFrame(tick);
}


//#region CONTROLLER 
let counter = 0;
let lastTimestamp = 0;
let ghosts = [];

function tick(timestamp) {
  requestAnimationFrame(tick);

  const deltatime = (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;

  movePlayer(deltatime);

  if (counter == 50) {
    changeGhostDirection();
    counter = 0;
  }
  counter++;


  if(scatter){
    moveGhostsToScatter(deltatime);
  } else {
    moveGhostA(deltatime); // ghost movement logic
  }



  if (powerUpActive) {
    powerUpTimer -= deltatime;
    if (powerUpTimer <= 0) {
      powerUpActive = false;
      scatter = false;
      removeBlinking();
      
    }
  }
  //gameOverCheck();
  if (gameOverCheck()) {
    console.log("Game Over");
  }

  displayPlayerposition();
  displayGhostA();
  // showDebugging();
}

function keyPress(event) {
  const pacman = document.querySelector("#pacman");

  if (event.key == "ArrowUp" || event.key == "ArrowDown" || event.key == "ArrowLeft" || event.key == "ArrowRight" || event.key == "w" || event.key == "s" || event.key == "a" || event.key == "d") {
    setControlsFalse();
    pacman.classList.remove("pacman-left", "pacman-right", "pacman-up", "pacman-down", "moving");
  }

  if (event.key === "ArrowLeft") {
    controls.left = true;
    pacman.classList.add("pacman-left");
  } else if (event.key === "ArrowRight") {
    controls.right = true;
    pacman.classList.add("pacman-right");
  } else if (event.key === "ArrowUp") {
    controls.up = true;
    pacman.classList.add("pacman-up");
  } else if (event.key === "ArrowDown") {
    controls.down = true;
    pacman.classList.add("pacman-down");
  } else if (event.key === "w") {
    controls.up = true;
    pacman.classList.add("pacman-up");
  } else if (event.key === "s") {
    controls.down = true;
    pacman.classList.add("pacman-down");
  } else if (event.key === "a") {
    controls.left = true;
    pacman.classList.add("pacman-left");
  } else if (event.key === "d") {
    controls.right = true;
    pacman.classList.add("pacman-right");
  }

  if (controls.left || controls.right || controls.up || controls.down) {
    pacman.classList.add("moving");
  }
}

function setControlsFalse(){
  controls.up = false;
  controls.down = false;
  controls.left = false;
  controls.right = false;

}


//#endregion CONTROLLER

//#region MODEL */

let points = 0;

function gameOverCheck() {
  for (let i = 0; i < ghosts.length; i++) {
    if (Math.floor(pacman.x / tile_size) === Math.floor(ghosts[i].x / tile_size) &&
        Math.floor(pacman.y / tile_size) === Math.floor(ghosts[i].y / tile_size)) {
      if (powerUpActive) {
        points += 500; // Add points for eating a ghost
        ghosts[i].element.remove(); // Remove the ghost's element from DOM
        ghosts.splice(i, 1); // Remove the ghost from the array
        i--; // Adjust index due to removal
      } else {
        return true; // Game over if not in power-up state
      }
    }
  }
  return false;
}

let powerUpActive = false;
let powerUpTimer = 0;

function eatPowerUp() {
  powerUpActive = true;
  powerUpTimer = 10; // 10 seconds
  addBlinking();
  scatter = true;
  // Additional logic if needed (e.g., change ghost appearance)
}

function addBlinking() {
  ghosts.forEach(ghost => {
    ghost.element.classList.add("blinking");
  });
}

function removeBlinking() {
  ghosts.forEach(ghost => {
    ghost.element.classList.remove("blinking");
  });
}


function movePlayer(deltatime) {
  pacman.moving = false;
  let tempDirection = pacman.direction;
  const newPos = {
    x: pacman.x,
    y: pacman.y
  };

  if (controls.up) {
    pacman.moving = true;
    tempDirection = "up";
    pacman.speed = pacman.topspeed;
  }
  if (controls.down) {
    pacman.moving = true;
    tempDirection = "down";
    pacman.speed = pacman.topspeed;
  }
  if (controls.left) {
    pacman.moving = true;
    tempDirection = "left";
    pacman.speed = pacman.topspeed;
  }
  if (controls.right) {
    pacman.moving = true;
    tempDirection = "right";
    pacman.speed = pacman.topspeed;
  }

  if (pacman.speed > 0) {
    if (tempDirection === "up") {
      newPos.y -= pacman.speed * deltatime;
    }
    if (tempDirection === "down") {
      newPos.y += pacman.speed * deltatime;
    }
    if (tempDirection === "left") {
      newPos.x -= pacman.speed * deltatime;
    }
    if (tempDirection === "right") {
      newPos.x += pacman.speed * deltatime;
    }
  }

  if (!canMoveToMore(newPos)) {
    if (tempDirection === "right" && controls.down) {
      const downPos = { x: pacman.x, y: pacman.y + pacman.speed * deltatime };
      if (canMoveToMore(downPos)) {
        pacman.direction = "down";
        newPos.y += pacman.speed * deltatime;
      }
    }
    pacman.moving = false;
  }

  if (canMoveToMore(newPos)) {
    pacman.x = newPos.x;
    pacman.y = newPos.y;
    checkForItems();
    pacman.direction = tempDirection;
  }
}

function movePlayerv2(deltatime){
  pacman.moving = false;
    let tempDirection = pacman.direction;
    
    

    const newPos = {
      x: pacman.x,
      y: pacman.y
    }

    if(controls.up){
        pacman.moving = true;
        tempDirection = "up";
        pacman.speed = pacman.topspeed;
    }
    if(controls.down){
        pacman.moving = true;
        tempDirection = "down";
        pacman.speed = pacman.topspeed;
    }
    if(controls.left){
        pacman.moving = true;
        tempDirection = "left";
        pacman.speed = pacman.topspeed;
    }
    if(controls.right){
        pacman.moving = true;
        tempDirection = "right";
        pacman.speed = pacman.topspeed;
    }

    const posToCheck = getCheckPos({x: pacman.x, y: pacman.y}, tempDirection);
    
    if(canMoveTo(posToCheck)){
      if(pacman.speed > 0){
        if(controls.up){
          newPos.y -= pacman.speed * deltatime;
        }
        if(controls.down){
          newPos.y += pacman.speed * deltatime;
        }
        if(controls.left){
          newPos.x -= pacman.speed * deltatime;
        }
        if(controls.right){
          newPos.x += pacman.speed * deltatime;
        }
      }
    } else {
      pacman.moving = false;
    }
    
} 

function getCheckPos(oldPos, tempDirection){
  let newCol = coordFromPos(oldPos).col;
  let newRow = coordFromPos(oldPos).row;

  if(tempDirection === "up"){
    newRow--;
  } else if(tempDirection === "down"){
    newRow++;
  } else if(tempDirection === "left"){
    newCol--;
  } else if(tempDirection === "right"){
    newCol++;
  }
  
  return posFromCoord({row: newRow, col: newCol});
}

function canMoveTo(pos, hitbox) {
  const positions = getPosForHitbox(pos, hitbox);
  let canMove = true;

  positions.forEach(position => {
    const { row, col } = coordFromPos(position);
    if (row < 0 || row >= GRID_height || col < 0 || col >= GRID_width) {
      canMove = false;
    } else {
      const tileType = getTileAtCoord({ row, col });
      if (tileType === 1) { // wall
        canMove = false;
      }
    }
  });

  return canMove;
}

function getPosForHitbox(pos, hitbox) {
  const positions = [];

  const topLeft = { x: pos.x - hitbox.x, y: pos.y - hitbox.y };
  const topRight = { x: pos.x - hitbox.x + hitbox.w, y: pos.y - hitbox.y };
  const bottomLeft = { x: pos.x - hitbox.x, y: pos.y - hitbox.y + hitbox.h };
  const bottomRight = { x: pos.x - hitbox.x + hitbox.w, y: pos.y - hitbox.y + hitbox.h };

  positions.push(topLeft);
  positions.push(topRight);
  positions.push(bottomLeft);
  positions.push(bottomRight);

  return positions;
}


function canMoveToMore(pos) {
  let canMove = true;

  const positions = getPosForPlayer(pos);

  positions.forEach(position => {
    const { row, col } = coordFromPos(position);
    if (row < 0 || row >= GRID_height ||
      col < 0 || col >= GRID_width) {
      canMove = false;
    } else {
      const tileType = getTileAtCoord({ row, col });
      if (tileType === 1) { // wall
        canMove = false;
      }
    }
  });

  return canMove;
}


let scatter = false;
const scatterPositions = [
  { x: 32, y: 128 }, 
  { x: 288, y: 32 }, 
  { x: 576, y: 160 }, 
  { x: 256, y: 288 }, 
];

function moveGhostsToScatter(deltatime) {
  ghosts.forEach((ghost, index) => {
    const scatterPos = scatterPositions[index % scatterPositions.length];
    const direction = {
      x: scatterPos.x > ghost.x ? 1 : (scatterPos.x < ghost.x ? -1 : 0),
      y: scatterPos.y > ghost.y ? 1 : (scatterPos.y < ghost.y ? -1 : 0)
    };

    const newPos = {
      x: ghost.x + direction.x * ghostA.speed * deltatime,
      y: ghost.y + direction.y * ghostA.speed * deltatime
    };

    if (canMoveTo(newPos, ghostA.hitbox)) {
      ghost.x = newPos.x;
      ghost.y = newPos.y;
    } else {
      // Handle collisions if necessary
    }
  });
}


function spawnGhosts() {
  const ghostContainer = document.querySelector("#ghosts");
  const numberOfGhosts = 1; // number of ghosts to spawn
  const ghostColors = 10; // total number of ghost colors in the sprite sheet
  const frameHeight = 32; // height of each ghost frame in the sprite sheet

  // hardcoded positions for the ghosts
  /* 

function spawnGhosts() {
  const ghostContainer = document.querySelector("#ghosts");
  const numberOfGhosts = 4; // Adjust the number as needed
  const ghostColors = 10; // Total number of ghost colors in the sprite sheet
  const frameHeight = 32; // Height of each ghost frame in the sprite sheet

  const ghostPositions = [
    { x: 32, y: 128 }, 
    { x: 288, y: 32 }, 
    { x: 576, y: 160 }, 
    { x: 256, y: 288 }, 
  ];

  for (let i = 0; i < numberOfGhosts; i++) {
    const ghostPos = ghostPositions[i];
    const ghostElement = document.createElement("div");
    ghostElement.classList.add("ghost");
    const randomColorIndex = Math.floor(Math.random() * ghostColors);
    const backgroundPositionY = -randomColorIndex * frameHeight;
    ghostElement.style.backgroundPosition = `0px ${backgroundPositionY}px`;
    ghostElement.setAttribute('data-name', `ghost${i + 1}`);
    ghostElement.style.left = `${ghostPos.x}px`;
    ghostElement.style.top = `${ghostPos.y}px`;
    ghostContainer.appendChild(ghostElement);

    ghosts.push({
      x: ghostPos.x,
      y: ghostPos.y,
      element: ghostElement
    });
  }
} */

  //Spawn Ghost A *
  const ghostAElement = document.createElement("div");
  ghostAElement.classList.add("ghost");
  const randomColorIndex = Math.floor(Math.random() * ghostColors);
  const backgroundPositionY = -randomColorIndex * frameHeight;
  ghostAElement.setAttribute('data-name', `ghostA`);
  ghostAElement.style.left = `${ghostA.x}px`;
  ghostAElement.style.top = `${ghostA.y}px`;
  ghostContainer.appendChild(ghostAElement);
}


const ghostA = {
  x: 10,
  y: 10,
  regX: 16,
  regY: 16,
  hitbox: {
    x: 5, // Adjust hitbox offset
    y: 5, // Adjust hitbox offset
    w: 22, // Adjust hitbox width
    h: 22  // Adjust hitbox height
  },
  speed: 100,
  direction: undefined
};


function moveGhostA(deltatime) {
  const newPos = {
    x: ghostA.x,
    y: ghostA.y
  };

  if (randomDirection === "up") {
    newPos.y -= ghostA.speed * deltatime;
  }
  if (randomDirection === "down") {
    newPos.y += ghostA.speed * deltatime;
  }
  if (randomDirection === "left") {
    newPos.x -= ghostA.speed * deltatime;
  }
  if (randomDirection === "right") {
    newPos.x += ghostA.speed * deltatime;
  }

  if (canMoveTo(newPos, ghostA.hitbox)) {
    ghostA.x = newPos.x;
    ghostA.y = newPos.y;
  }
}

  

let randomDirection = "right";

function changeGhostDirection(){
    const directions = ["up", "down", "left", "right"];
    let randomIndex = Math.floor(Math.random() * directions.length);
    randomDirection = directions[randomIndex];
}

const pacman = {
  x: 20,
  y: 20,
  regX: 16,
  regY: 16,
  hitbox: {
    x: 5, // Adjust hitbox offset
    y: 5, // Adjust hitbox offset
    w: 22, // Adjust hitbox width
    h: 22  // Adjust hitbox height
  },
  speed: 110,
  topspeed: 150,
  moving: false,
  direction: undefined,
};


const controls = {
    up: false,
    down: false,
    left: false,
    right: false,
    use: false
}

/* const tiles = [
    [0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 3, 0, 1, 0, 1, 0, 0, 0, 0, 3],
    [0, 0, 0, 3, 1, 1, 1, 0, 1, 0, 3, 0, 0, 0, 1, 1, 1, 0, 1, 3],
    [0, 0, 0, 3, 0, 0, 1, 0, 1, 0, 3, 0, 0, 0, 0, 2, 1, 0, 1, 3],
    [0, 0, 1, 3, 3, 3, 0, 0, 0, 0, 3, 3, 1, 0, 0, 0, 0, 0, 3, 3],
    [1, 0, 1, 1, 1, 3, 1, 1, 0, 0, 1, 3, 1, 1, 1, 0, 1, 1, 3, 3],
    [1, 0, 0, 0, 0, 3, 3, 3, 0, 1, 1, 3, 0, 0, 0, 0, 0, 0, 3, 1],
    [3, 0, 1, 0, 0, 0, 1, 3, 3, 3, 3, 3, 1, 0, 0, 0, 1, 0, 3, 3],
    [3, 0, 1, 0, 1, 0, 0, 3, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 1, 1, 1, 3, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 3],
    [3, 0, 0, 0, 0, 2, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 3],
    [3, 3, 1, 0, 3, 3, 3, 3, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 3, 3],
    [1, 3, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 3, 3],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 1, 0, 3, 3, 1, 0, 3, 3, 0, 3, 1, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 0, 1, 3, 3, 3, 0, 3, 0, 3, 1, 0, 1, 2, 0, 0, 0, 0],
    [3, 0, 0, 0, 1, 1, 1, 3, 1, 3, 3, 3, 0, 0, 1, 1, 1, 0, 1, 0],
    [3, 0, 0, 0, 0, 2, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0],
    [3, 3, 1, 0, 0, 0, 0, 3, 3, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [1, 3, 1, 1, 1, 0, 1, 1, 3, 0, 1, 0, 1, 1, 1, 0, 1, 1, 3, 3],
    [1, 3, 3, 3, 3, 0, 0, 0, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 1],
] */

const tiles = [
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1],
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

const elSmaloElTilo = [
  [0, 1, 0, 0, 0],
  [0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0],
  [0, 0, 0, 1, 0],
];

const GRID_width = tiles[0].length;
const GRID_height = tiles.length;
const tile_size = 32;

function getTileAtCoord({row, col}){
  /* const row = coord.row;
  const col = coord.col; */

  //const {row, col} = coord; // destructuring
  
  return tiles[row][col];
}

function getTilesUnderPLayer(pacman){
  const coords = [];

  const topLeft = {x: pacman.x - pacman.regX + pacman.hitbox.x, y: pacman.y};
  const topRight = {x: pacman.x - pacman.regX + pacman.hitbox.x + pacman.hitbox.w, y: pacman.y};
  const bottomLeft = {x: pacman.x - pacman.regX + pacman.hitbox.x, y: pacman.y + pacman.hitbox.h};
  const bottomRight = {x: pacman.x - pacman.regX + pacman.hitbox.x + pacman.hitbox.w, y: pacman.y + pacman.hitbox.h};
  
  const coordTopLeft = coordFromPos(topLeft);
  const coordTopRight = coordFromPos(topRight);
  const coordBottomLeft = coordFromPos(bottomLeft);
  const coordBottomRight = coordFromPos(bottomRight);
  

  coords.push(coordTopLeft);
  coords.push(coordTopRight);
  coords.push(coordBottomLeft);
  coords.push(coordBottomRight);

  return coords;
}

function getPosForPlayer(pos) {
  const positions = [];

  // Adjusted the hitbox offset and size
  const topLeft = { x: pos.x - pacman.regX + pacman.hitbox.x, y: pos.y - pacman.regY + pacman.hitbox.y };
  const topRight = { x: pos.x - pacman.regX + pacman.hitbox.x + pacman.hitbox.w, y: pos.y - pacman.regY + pacman.hitbox.y };
  const bottomLeft = { x: pos.x - pacman.regX + pacman.hitbox.x, y: pos.y - pacman.regY + pacman.hitbox.y + pacman.hitbox.h };
  const bottomRight = { x: pos.x - pacman.regX + pacman.hitbox.x + pacman.hitbox.w, y: pos.y - pacman.regY + pacman.hitbox.y + pacman.hitbox.h };

  positions.push(topLeft);
  positions.push(topRight);
  positions.push(bottomLeft);
  positions.push(bottomRight);

  return positions;
}



function coordFromPos( {x, y} ){
  const row = Math.floor(y / tile_size);
  const col = Math.floor(x / tile_size);
  return {row, col};
}

function posFromCoord( {row, col} ){
  const x = col * tile_size;
  const y = row * tile_size;
  return {x, y};
}

//#endregion MODEL

//#region VIEW */

function displayPlayerposition() {
  const visualPlayer = document.querySelector("#pacman");
  visualPlayer.style.translate = `${pacman.x - pacman.regX}px ${pacman.y - pacman.regY}px`;
}

function displayGhostA() {
  const visualGhostA = document.querySelector('[data-name=ghostA]');
  visualGhostA.style.translate = `${ghostA.x}px ${ghostA.y}px`;
}


function createTiles(){
  const gameField = document.querySelector("#gamefield");

  const background = document.querySelector("#background");

  for(let row = 0; row < GRID_height; row++){
    for(let col = 0; col < GRID_width; col++){
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


function getNameForItem(item){
  switch(item){
    case 1: return "coin";
  }
}

function displayTiles(){
  const visualTiles = document.querySelectorAll("#background .tile");

  for(let row = 0; row < GRID_height; row++){
    for(let col = 0; col < GRID_width; col++){
      const tile = getTileAtCoord({row, col});
      const visualTile = visualTiles[row * GRID_width + col];

      visualTile.classList.add(getClassForTileType(tile))
    }
  }
}

function getClassForTileType(tile){
  switch(tile){
    case 0: return "empty";
    case 1: return "wall";
    case 2: return "coin";
    case 3: return "xp";
  }
}

//#endregion VIEW

//#region DEBUGGING
function showDebugging(){
    //showDebugTileUnderPlayer();
    //showDebugMoreTiles();
    showPlayerHitbox();
    //showGhostHitbox();
    //showDebugPlayerRegPoint();
    showDebugPlayerHitbox();
    //showDebugGhostHitbox();
  }
  
  let lastCoord = {row: 1, col: 1};
  function showDebugTileUnderPlayer(){
    const coord = coordFromPos(pacman);
  
    if(coord.row !== lastCoord.row || coord.col !== lastCoord.col){
      unhighlightTile(lastCoord);
      highlightTile(coord);
    }
  
    lastCoord = coord;
  }
  
  let lastCoords = [];
  function showDebugMoreTiles(){
    const coords = getTilesUnderPLayer(pacman);
  
    lastCoords.forEach(coord => {
      unhighlightTile(coord);
    });
    lastCoords = [];
    coords.forEach(coord => {
      highlightTile(coord);
      lastCoords.push(coord);
    });
  }
  
  function showPlayerHitbox(){
    const pacman = document.querySelector("#pacman");
    
    if(!pacman.classList.contains("show-rect")){
      pacman.classList.add("show-rect");
    }
  
  }

  function showGhostHitbox(){
    const ghost = document.querySelector("#ghostA");

    if(!ghost.classList.contains("show-rect")){
      ghost.classList.add("show-rect");
    }
  }

  function showDebugGhostHitbox(){
    const visualGhost = document.querySelector("#ghostA");

    if(!visualGhost.classList.contains("show-hitbox")){
      visualGhost.classList.add("show-hitbox");
    }

    visualGhost.style.setProperty("--hitboxWidth", ghostA.hitbox.w + "px");
    visualGhost.style.setProperty("--hitboxHeight", ghostA.hitbox.h + "px");
    visualGhost.style.setProperty("--hitboxX", ghostA.hitbox.x + "px");
    visualGhost.style.setProperty("--hitboxY", ghostA.hitbox.y + "px");
  }
  
  function showDebugPlayerRegPoint(){
    const visualPlayer = document.querySelector("#pacman");
  
    if(!visualPlayer.classList.contains("show-reg-point")){
      visualPlayer.classList.add("show-reg-point");
    }
  
    visualPlayer.style.setProperty("--regX", pacman.regX + "px");
    visualPlayer.style.setProperty("--regY", pacman.regY + "px");
  }
  
  function showDebugPlayerHitbox(){
    const visualPlayer = document.querySelector("#pacman");
  
    if(!visualPlayer.classList.contains("show-hitbox")){
      visualPlayer.classList.add("show-hitbox");
    }
  
    visualPlayer.style.setProperty("--hitboxWidth", pacman.hitbox.w + "px");
    visualPlayer.style.setProperty("--hitboxHeight", pacman.hitbox.h + "px");
    visualPlayer.style.setProperty("--hitboxX", pacman.hitbox.x + "px");
    visualPlayer.style.setProperty("--hitboxY", pacman.hitbox.y + "px");
  
  }
  
  function highlightTile({row, col}){
    const visualTiles = document.querySelectorAll("#background .tile");
    const visualTile = visualTiles[row * GRID_width + col];
    visualTile.classList.add("highlight");
  }
  
  function unhighlightTile(coord){
    const visualTiles = document.querySelectorAll("#background .tile");
    const visualTile = visualTiles[coord.row * GRID_width + coord.col];
    visualTile.classList.remove("highlight");
  }

  
  //#endregion DEBUGGING


  function checkForItems() {
    const items = getItemsUnderPlayer();
  
    items.forEach(item => {
      if (item.value === 2) {
        eatPowerUp();
      }
      takeItem(item);
    });
  }

  function takeItem({row, col}){
    const item = tiles[row][col];

    if(item === 3 || item === 2){
        tiles[row][col] = 0; 

        const visualItem = document.querySelector(`#background .tile:nth-child(${(row * GRID_width) + col + 1})`);
        visualItem.classList.remove(getClassForTileType(item));

        points += 10;

        console.log("Took item", item);
    }
}


function getItemsUnderPlayer(){
    const coords = getTilesUnderPlayer(pacman);
    const items = [];

    coords.forEach(coord => {
        const item = tiles[coord.row][coord.col];
        if(item === 3 || item === 2){
            items.push({row: coord.row, col: coord.col});
        }
    });

    return items;
}

function getTilesUnderPlayer(pacman){
  const coords = [];

  const topLeft = {x: pacman.x - pacman.regX + pacman.hitbox.x, y: pacman.y};
  const topRight = {x: pacman.x - pacman.regX + pacman.hitbox.x + pacman.hitbox.w, y: pacman.y};
  const bottomLeft = {x: pacman.x - pacman.regX + pacman.hitbox.x, y: pacman.y + pacman.hitbox.h};
  const bottomRight = {x: pacman.x - pacman.regX + pacman.hitbox.x + pacman.hitbox.w, y: pacman.y + pacman.hitbox.h};
  
  const coordTopLeft = coordFromPos(topLeft);
  const coordTopRight = coordFromPos(topRight);
  const coordBottomLeft = coordFromPos(bottomLeft);
  const coordBottomRight = coordFromPos(bottomRight);
  

  coords.push(coordTopLeft);
  coords.push(coordTopRight);
  coords.push(coordBottomLeft);
  coords.push(coordBottomRight);

  return coords;
}

//region A* Pathfinding

function createNode(row, col, walkable) {
    return {
        row: row,
        col: col,
        walkable: walkable,
        g: Infinity, // Cost from start to this node
        h: 0, // Heuristic cost to goal (only for A*)
        f: Infinity, // Total cost (only for A*)
        parent: null // To trace the path back
    };
}

function buildGraph(grid) {
    const graph = [];
    for (let row = 0; row < grid.length; row++) {
        graph[row] = [];
        for (let col = 0; col < grid[row].length; col++) {
            graph[row][col] = createNode(row, col, grid[row][col] !== 1);
        }
    }
    return graph;
}

function getNeighbors(graph, node) {
    const neighbors = [];
    const directions = [
        { row: -1, col: 0 }, // up
        { row: 1, col: 0 },  // down
        { row: 0, col: -1 }, // left
        { row: 0, col: 1 }   // right
    ];
    directions.forEach(dir => {
        const newRow = node.row + dir.row;
        const newCol = node.col + dir.col;
        if (newRow >= 0 && newRow < graph.length && newCol >= 0 && newCol < graph[0].length) {
            const neighbor = graph[newRow][newCol];
            if (neighbor.walkable) {
                neighbors.push(neighbor);
            }
        }
    });
    return neighbors;
}

function manhattanDistance(nodeA, nodeB) {
    return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
}

function reconstructPath(node) {
    const path = [];
    while (node !== null) {
        path.push({ row: node.row, col: node.col });
        node = node.parent;
    }
    return path.reverse();
}

function aStar(grid, startCoord, goalCoord) {
    const graph = buildGraph(grid);
    const startNode = graph[startCoord.row][startCoord.col];
    const goalNode = graph[goalCoord.row][goalCoord.col];
    const openSet = [];
    const closedSet = new Set();

    startNode.g = 0;
    startNode.h = manhattanDistance(startNode, goalNode);
    startNode.f = startNode.h;
    openSet.push(startNode);

        
    while (openSet.length > 0) {
        // Get the node with the lowest f cost
        openSet.sort((a, b) => a.f - b.f);
        const currentNode = openSet.shift();

        if (currentNode === goalNode) {
            return reconstructPath(currentNode);
        }

        closedSet.add(currentNode.row + "," + currentNode.col);
        const neighbors = getNeighbors(graph, currentNode);

neighbors.forEach(neighbor => {
            if (closedSet.has(neighbor.row + "," + neighbor.col)) {
                return;
            }

const tentativeG = currentNode.g + 1;

if (tentativeG < neighbor.g) {
                neighbor.parent = currentNode;
                neighbor.g = tentativeG;
                neighbor.h = manhattanDistance(neighbor, goalNode);
                neighbor.f = neighbor.g + neighbor.h;

if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                }
            }
        });
    }

return []; // No path found
}

// Example usage:
const grid = [
    [0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 3, 0, 1, 0, 1, 0, 0, 0, 0, 3],
    [0, 0, 0, 3, 1, 1, 1, 0, 1, 0, 3, 0, 0, 0, 1, 1, 1, 0, 1, 3],
    [0, 0, 0, 3, 0, 0, 1, 0, 1, 0, 3, 0, 0, 0, 0, 2, 1, 0, 1, 3],
    [0, 0, 1, 3, 3, 3, 0, 0, 0, 0, 3, 3, 1, 0, 0, 0, 0, 0, 3, 3],
    [1, 0, 1, 1, 1, 3, 1, 1, 0, 0, 1, 3, 1, 1, 1, 0, 1, 1, 3, 3],
    [1, 0, 0, 0, 0, 3, 3, 3, 0, 1, 1, 3, 0, 0, 0, 0, 0, 0, 3, 1],
    [3, 0, 1, 0, 0, 0, 1, 3, 3, 3, 3, 3, 1, 0, 0, 0, 1, 0, 3, 3],
    [3, 0, 1, 0, 1, 0, 0, 3, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 1, 1, 1, 3, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 3],
    [3, 0, 0, 0, 0, 2, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 3],
    [3, 3, 1, 0, 3, 3, 3, 3, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 3, 3],
    [1, 3, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 3, 3],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 1, 0, 3, 3, 1, 0, 3, 3, 0, 3, 1, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 0, 1, 3, 3, 3, 0, 3, 0, 3, 1, 0, 1, 2, 0, 0, 0, 0],
    [3, 0, 0, 0, 1, 1, 1, 3, 1, 3, 3, 3, 0, 0, 1, 1, 1, 0, 1, 0],
    [3, 0, 0, 0, 0, 2, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0],
    [3, 3, 1, 0, 0, 0, 0, 3, 3, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [1, 3, 1, 0, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 1, 0, 0, 3, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0],
];
const startA = { row: 0, col: 0 };
const goalA = { row: 3, col: 4 };
const path = aStar(elSmaloElTilo, startA, goalA);
console.log("A* Path:", path);

/* function djikstra(graph, start, end){
  const dist = [];
  const prev = [];

  const queue = [];

  for(let i = 0; i < graph.length; i++){
    dist[i] = Infinity;
    prev[i] = null;
    queue.push(i);
  }

  dist[start] = 0;

  while(queue.length > 0){
    queue.sort((a, b) => dist[a] - dist[b]);
    const u = queue.shift();

    if(u === end){
      break;
    }

    for(let v = 0; v < graph[u].length; v++){
      if(graph[u][v] !== 0){
        const alt = dist[u] + graph[u][v];
        if(alt < dist[v]){
          dist[v] = alt;
          prev[v] = u;
        }
      }
    }
  }

  const path = [];
  let u = end;
  while(prev[u] !== null){
    path.unshift(u);
    u = prev[u];
  }
  path.unshift(u);

  return path;
} */

function djikstra(graph, start, end){
  const dist = Array(graph.length).fill(Infinity);
  const prev = Array(graph.length).fill(null);
  const queue = [];

  dist[start] = 0;

  for(let i = 0; i < graph.length; i++){
    queue.push(i);
  }

  while(queue.length > 0){
    queue.sort((a, b) => dist[a] - dist[b]);
    const u = queue.shift();

    if(u === end){
      break;
    }

    for(let v = 0; v < graph[u].length; v++){
      if(graph[u][v] !== 0){
        const alt = dist[u] + graph[u][v];
        if(alt < dist[v]){
          dist[v] = alt;
          prev[v] = u;
        }
      }
    }
  }

  const path = [];
  let u = end;
  while(prev[u] !== null){
    path.unshift(u);
    u = prev[u];
  }
  path.unshift(start); // Ensure the start node is included

  return path;
}

function hillClimbSearch(graph, start, end){
  let current = start;

  while(true){
    let neighbors = getNeighbors(graph, current);
    let next = current;
    let min = graph[current.row][current.col];

    neighbors.forEach(neighbor => {
      if(graph[neighbor.row][neighbor.col] < min){
        next = neighbor;
        min = graph[neighbor.row][neighbor.col];
      }
    });

    if(next.row === current.row && next.col === current.col){
      break;
    }

    current = next;
  }
}

function greedyBestFirstSearch(grid, startCoord, goalCoord) {
  const graph = buildGraph(grid);
  const startNode = graph[startCoord.row][startCoord.col];
  const goalNode = graph[goalCoord.row][goalCoord.col];
  const openSet = [];
  const closedSet = new Set();

  // Priority queue sorted by heuristic value (h)
  startNode.h = manhattanDistance(startNode, goalNode);
  openSet.push(startNode);

  while (openSet.length > 0) {
      // Sort the open set to get the node with the lowest heuristic value
      openSet.sort((a, b) => a.h - b.h);
      const currentNode = openSet.shift();

      // If the goal node is reached, reconstruct the path
      if (currentNode === goalNode) {
          return reconstructPath(currentNode);
      }

      closedSet.add(currentNode.row + "," + currentNode.col);
      const neighbors = getNeighbors(graph, currentNode);

      neighbors.forEach(neighbor => {
          if (closedSet.has(neighbor.row + "," + neighbor.col)) {
              return;
          }

          neighbor.h = manhattanDistance(neighbor, goalNode);

          if (!openSet.includes(neighbor)) {
              neighbor.parent = currentNode;
              openSet.push(neighbor);
          }
      });
  }

  return []; // No path found
}





//endregion