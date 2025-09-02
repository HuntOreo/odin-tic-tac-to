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

const gameBoard = (function () {
  let board = [];
  let boardSize = 3;
  let boardString = "";

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

  function buildBoard(size) {
    let tiles = [];
    let index = 0;
    for (let i = 0; i < size; i++) {
      let row = [];
      for (let j = 0; j < size; j++) {
        const rowIndex = i;
        const colIndex = j;

        const player = {
          marker: 'o',
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

  function displayBoard() {
    boardString = "";
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        boardString += `[${board[i][j].marker}]`;
      }
      boardString += `\n`
    }

    return boardString;
  }

  return {
    init,
    getSize,
    displayBoard,
  }
})();

const gameState = (function () {
  let players = [];
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

  const getBoard = function () {
    return board;
  }

  return {
    getPlayers,
    addPlayers,
    attachBoard,
    getBoard,
  }
})();

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
const karma = playerFactory('o', 'Karma')

gameState.addPlayers(hunter, karma);
console.log(gameState.getPlayers());
gameState.attachBoard(gameBoard);

console.log(hunter.name);
console.log(karma.name);

console.log(gameBoard.displayBoard());