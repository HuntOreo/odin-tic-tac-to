/* 
Main Goal:
  Build a functional Tic Tac Toe game.
  Use as little globally scoped code as possible.
 
Requirements:
  Use Factory Functions
    For single instance objects like game-board, 
    or displayContainer, use IIFE module patterns so that 
    it cannot be reused to create additional instances.
  
  Store the game-board inside of an array!
  
  Players will be stored in objects.

  Control game-flow with an object.
*/

// GAMEBOARD IIFE //
/***********************************
*
* Handles the STATE of the BOARD.
*
***********************************/
const gameBoard = (function () {
  let board = [];
  let boardSize = 3;
  let boardString = "";

  // This builds tiles that make up the board.
  function tileFactory(player, row, column) {
    let marker = player.marker;
    function build() {
      return {
        marker,
        row,
        column,
        player
      }
    }

    return {
      build,
    }
  }
  // Builds the board, storing relevant data of each tile inside an array.
  //   Data such as player marker, index of the tile (row/column).
  function buildBoard(size) {
    let tiles = [];
    let index = 0;
    for (let i = 0; i < size; i++) {
      let row = [];
      for (let j = 0; j < size; j++) {
        const rowIndex = i;
        const colIndex = j;

        const player = {
          marker: '.',
          name: undefined,
        }

        const tileBlueprint = tileFactory(player, rowIndex, colIndex);
        const tile = tileBlueprint.build();
        row.push(tile);
        index++;
      }

      tiles.push(row);
    }
    return tiles;
  }

  function init(size = 3) {
    boardSize = size;
    const builtBoard = buildBoard(size);
    board.push(...builtBoard);
  }

  function getSize() {
    console.log(`Board is ${boardSize} by ${boardSize}`);
  }

  // Render the board as a string that displays each tile in rows & columns.
  //   Attaches a numbering system for readability.
  function displayBoard() {
    boardString = " ";
    for (let i = 0; i < boardSize; i++) {
      boardString += ` ${i}|`; // Number columns
    }

    boardString += `\n`;

    for (let i = 0; i < boardSize; i++) {
      boardString += `${i}-`; // Number rows
      for (let j = 0; j < boardSize; j++) {
        boardString += `[${board[i][j].marker}]`;
      }
      boardString += `\n`
    }

    return boardString;
  }

  function updateBoard(player, row, col) {
    board[row][col] = player;
    buildBoard(boardSize);
  }

  return {
    init,
    getSize,
    displayBoard,
    updateBoard,
  }
})();

// GAMESTATE IIFE //
/********************************************** 
*
* Handles the LIFECYCLE and STATE of the GAME.
*
**********************************************/
const gameState = (function () {
  let players = [];
  let currentPlayer = {};
  let board;

  const getPlayers = function () {
    return players;
  }

  const addPlayers = function (...playersArg) {
    for (player of playersArg) {
      players.push(player);
    }
  }

  const attachBoard = function (boardArg) {
    board = boardArg;
  }

  const playTurn = function (player, row, col) {
    board.updateBoard(player, row, col);
  }

  return {
    getPlayers,
    addPlayers,
    attachBoard,
    playTurn,
  }
})();

// PLAYER FACTORY
/*******************************************
*
* Responsible for creating players objects.
*
*******************************************/
const playerFactory = function (playerMarker, playerName) {
  const marker = playerMarker;
  const name = playerName;

  return {
    marker,
    name,
  }
}

gameBoard.init();

const hunter = playerFactory('x', 'Hunter');
const karma = playerFactory('o', 'Karma');

gameState.addPlayers(hunter, karma);
gameState.attachBoard(gameBoard);

console.log(gameBoard.displayBoard());
gameState.playTurn(hunter, 1, 1);
console.log(gameBoard.displayBoard());
gameState.playTurn(karma, 0, 0);
console.log(gameBoard.displayBoard());
