"use strict";

window.addEventListener("load", start);

function start() {
    console.log("start");
    setupGame();
}


//region controller
document.addEventListener("DOMContentLoaded", () => {
const heightInput = document.querySelector("#height");
const widthInput = document.querySelector("#width");
const startButton = document.querySelector("#startButton");
});

let gridwidth;
let gridheight;
let position = {x: 0, y: 0};

function setupGame(){
    gridwidth = 10;
    gridheight = 6;
    createModel();
    createMazePrim();
    createView();

    document.addEventListener("keydown", keyDown)

    writeToCell(position.y, position.x, 1);

    startGame();

}

function startGame(){
    displayModel();
    console.log(model)
    tick();
}

let lastTimestamp = 0;
function tick(timestamp){
  requestAnimationFrame(tick);

  const deltatime = (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;

  movePlayer(deltatime);

  //checkForItems();

  displayPlayerposition();
  //displayPlayerAnimation();  
  //showDebugging();
}

function keyPress(event) {
    if(event.key === "ArrowLeft") {
      controls.left = true;
    } else if(event.key === "ArrowRight") {
      controls.right = true;
    } else if(event.key === "ArrowUp") {
      controls.up = true;
    } else if(event.key === "ArrowDown") {
      controls.down = true;
    } else if(event.key === " "){
      controls.use = true;
    }
  }

  function keyUp(event) {
    if(event.key === "ArrowLeft") {
      controls.left = false;
    } else if(event.key === "ArrowRight") {
      controls.right = false;
    } else if(event.key === "ArrowUp") {
      controls.up = false;
    } else if(event.key === "ArrowDown") {
      controls.down = false;
    } else if(event.key === " "){
      controls.use = false;
    }
  }

//endregion

//region playerMovement
function movePlayer(deltatime){
    player.moving = false;
    const newPos = {
        x: player.x,
        y: player.y
    }

    if(controls.up){
        player.moving = true;
        player.direction = "up";
        player.speed += player.acceleration * deltatime;
    }
    if(controls.down){
        player.moving = true;
        player.direction = "down";
        player.speed += player.acceleration * deltatime;
    }
    if(controls.left){
        player.moving = true;
        player.direction = "left";
        player.speed += player.acceleration * deltatime;
    }
    if(controls.right){
        player.moving = true;
        player.direction = "right";
        player.speed += player.acceleration * deltatime;
    }

    if(player.speed > 0){
      if(controls.up){
        newPos.y -= player.speed * deltatime;
      }
      if(controls.down){
        newPos.y += player.speed * deltatime;
      }
      if(controls.left){
        newPos.x -= player.speed * deltatime;
      }
      if(controls.right){
        newPos.x += player.speed * deltatime;
      }
    }

    player.speed = Math.min(player.speed, player.topspeed);

    if(canMoveToMore(newPos)){
        player.x = newPos.x;
        player.y = newPos.y;
    } else {
        player.moving = false;
        if(newPos.x !== player.x && newPos.y !== player.y){
            const newXpos = {
                x: newPos.x,
                y: player.y
            }
            const newYpos = {
                x: player.x,
                y: newPos.y
            
            }

            if(canMoveToMore(newXpos)){
                player.moving = true;
                player.x = newXpos.x;
            } else if(canMoveToMore(newYpos)){
                player.moving = true;
                if(player.y < newPos.y){
                  player.direction = "down";
                } else {
                  player.direction = "up";
                }
                player.y = newYpos.y;

            }
        }
    }

    if(!player.moving){
      player.speed -= player.acceleration * deltatime + 5;
    }
    player.speed = Math.max(player.speed, 0);
}




const player = {
    x: 10,
    y: 550,
    regX: 10,
    regY: 15,
    hitbox: {
      x: 4,
      y: 14,
      w: 16,
      h: 15
    },
    speed: 0,
    topspeed: 150,
    moving: false,
    direction: undefined,
    isTaking: false
}

const controls = {
    up: false,
    down: false,
    left: false,
    right: false,
}

let direction = "right"
//endregion

//region model
let model = [
[0,0,0,0,0,0,0,0,0,5],
[0,0,0,0,2,2,2,2,0,0],
[0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,3,3,3,0,0,0],
[0,0,0,0,0,0,3,0,0,0],
[5,0,0,0,0,4,0,0,0,5]
];


function gridToGraph(grid) {
    const rows = grid.length;
    const cols = grid[0].length;
    const graph = {};

    function addEdge(node1, node2) {
        if (!graph[node1]) {
            graph[node1] = [];
        }
        graph[node1].push(node2);
    }

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (grid[i][j] === 0) {  // Assuming 0 represents walkable cell
                const node = `${i},${j}`;
                if (i > 0 && grid[i - 1][j] === 0) {  // Check above
                    addEdge(node, `${i - 1},${j}`);
                }
                if (i < rows - 1 && grid[i + 1][j] === 0) {  // Check below
                    addEdge(node, `${i + 1},${j}`);
                }
                if (j > 0 && grid[i][j - 1] === 0) {  // Check left
                    addEdge(node, `${i},${j - 1}`);
                }
                if (j < cols - 1 && grid[i][j + 1] === 0) {  // Check right
                    addEdge(node, `${i},${j + 1}`);
                }
            }
        }
    }

    return graph;
}


function createModel(){
    model.splice(0, model.length)
    for(let row = 0; row < gridheight; row++){
        for(let col = 0; col < gridwidth; col++){
            const cell = {
                "row": row,
                "col": col,
                "type": 0,
                "north": true,
                "east": true,
                "west": true,
                "south": true
            }
            model.push(cell);
        }
    }
}

function writeToCell(row, col, value){
    model[getCellIndex(row,col)] = value;
}

function readFromCell(row, col){
    return model[getCellIndex(row, col)];
}

function getCellIndex(row, col){
    return row * gridwidth + col;
}

function getCell(row, col) {
    return model[row * gridwidth + col];
}

function getNeighbors(cell){
    let neighbours = [];

    if(cell.row > 0){
        neighbours.push(getCell(cell.row - 1, cell.col));
    }
    if (cell.row < gridheight - 1){
        neighbours.push(getCell(cell.row + 1, cell.col));
    }
    if(cell.col > 0){
        neighbours.push(getCell(cell.row, cell.col - 1));
    }
    if(cell.col < gridwidth - 1){
        neighbours.push(getCell(cell.row, cell.col + 1));
    }

    return neighbours;
}

function createMazePrim() {
    console.log("Creating Maze Prim");
    let walls = [];
    let visited = [];

    for (let i = 0; i < model.length; i++) {
        visited.push(false);
    }

    //const start = this.model[Math.floor(Math.random() * this.model.length)];
    const start = model[0];
    visited[getCellIndex(start.row, start.col)] = true;
    let neighbours = getNeighbors(start).filter(neighbour => !visited[getCellIndex(neighbour.row, neighbour.col)])
    for (let neighbour of neighbours) {
        walls.push([start, neighbour]);
    }
     
    while (walls.length > 0) {
        const randomIndex = Math.floor(Math.random() * walls.length);
        const wall = walls[randomIndex];
        walls.splice(randomIndex, 1); // Remove the selected wall
        const cell1 = wall[0];
        const cell2 = wall[1];
        if(!visited[getCellIndex(cell2.row, cell2.col)]) {
        visited[getCellIndex(cell2.row, cell2.col)] = true;

        // Update the model with the removed walls
        if (cell1.row < cell2.row) {
            getCell(cell1.row, cell1.col).south = false;
            getCell(cell2.row, cell2.col).north = false;
        } else if (cell1.row > cell2.row) {
            getCell(cell1.row, cell1.col).north = false;
            getCell(cell2.row, cell2.col).south = false;
        } else if (cell1.col < cell2.col) {
            getCell(cell1.row, cell1.col).east = false;
            getCell(cell2.row, cell2.col).west = false;
        } else if (cell1.col > cell2.col) {
            getCell(cell1.row, cell1.col).west = false;
            getCell(cell2.row, cell2.col).east = false;
        }

        const newNeighbours = getNeighbors(cell2).filter(neighbour => !visited[getCellIndex(neighbour.row, neighbour.col)])
        for (let neighbour of newNeighbours) {
            walls.push([cell2, neighbour]);
        }  
        }  
    }
}

function createMazeBinarySpacePartitioning() {
    console.log("Creating Maze Binary Space Partitioning");
    const start = {row: 0, col: 0};
    const end = {row: gridheight - 1, col: gridwidth - 1};
    const walls = [];
    const rooms = [];
    const corridors = [];

    const createRooms = (start, end) => {
        if (end.row - start.row < 2 || end.col - start.col < 2) {
            return;
        }

        const width = end.col - start.col;
        const height = end.row - start.row;

        const horizontal = Math.random() > 0.5;
        const vertical = !horizontal;

        if (horizontal) {
            const split = Math.floor(Math.random() * (width - 2)) + 1;
            const splitRow = Math.floor(Math.random() * height) + start.row;
            for (let row = start.row; row <= end.row; row++) {
                if (row === splitRow) {
                    getCell(row, start.col + split).west = false;
                    getCell(row, start.col + split + 1).east = false;
                } else {
                    getCell(row, start.col + split).type = 2;
                }
            }

            createRooms(start, {row: end.row, col: start.col + split - 1});
            createRooms({row: start.row, col: start.col + split + 1}, end);
        } else if (vertical) {
            const split = Math.floor(Math.random() * (height - 2)) + 1;
            const splitCol = Math.floor(Math.random() * width) + start.col;
            for (let col = start.col; col <= end.col; col++) {
                if (col === splitCol) {
                    getCell(start.row + split, col).north = false;
                    getCell(start.row + split + 1, col).south = false;
                } else {
                    getCell(start.row + split, col).type = 2;
                }
            }

            createRooms(start, {row: start.row + split - 1, col: end.col});
            createRooms({row: start.row + split + 1, col: start.col}, end);
        }
    }

    createRooms(start, end);
}


//endregion

//region view


function createView(){
    const board = document.querySelector("#grid");
    board.style.setProperty("--GRID_WIDTH", gridwidth);
    for(let row = 0; row < gridheight; row++){
        for(let col = 0; col < gridwidth; col++){
            const cell = document.createElement("div");
            cell.classList.add("cell");
            board.appendChild(cell);
        }
    }
}

function displayModel(){
    const cells = document.querySelectorAll("#grid .cell")
    console.log(cells)
    cells.forEach((cell, index) => {
        const row = Math.floor(index / gridwidth);
        const col = index % gridwidth;
        clearCell(cell);
        cell.classList.add(getType(getCell(row, col)));

        const ways = ["north", "east", "south", "west"];
        ways.forEach(way => {
            if(getCell(row, col)[way]){
                cell.classList.remove(way);
            } else {
                cell.classList.add(way);
            }
        }
        );
    });
}

function getType(value){
    switch(value){
        case 0:
            return "empty";
        case 1:
            return "pacman";
        case 2:
            return "coin";
        case 3:
            return "food";
        case 4:
            return "power";
        default:
            return "empty";
    }
}

function clearCell(cell){
    cell.classList.remove("pacman");
    cell.classList.remove("coin");
    cell.classList.remove("food");
    cell.classList.remove("power");
}
//endregion