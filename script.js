/* 
Main Goal:
  Build a functional Tic Tac Toe game.
  Use as little globally scoped code as possible.
*/

// GAMEBOARD IIFE //
/***********************************
*
* Handles the STATE of the BOARD.
*
***********************************/
const gameBoard = (function () {
  let board = [];
  let size = 3;
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

  const get = function () {
    return board;
  }

  // Builds the board, storing relevant data of each tile inside an array.
  //   Data such as player marker, index of the tile (row/column).
  function build(boardSize) {
    let tiles = [];
    let index = 0;
    for (let i = 0; i < boardSize; i++) {
      let row = [];
      for (let j = 0; j < boardSize; j++) {
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

  function init(boardSize = 3) {
    size = boardSize;
    const builtBoard = build(size);
    board.push(...builtBoard);
  }

  function boardSize() {
    console.log(`${size}x${size}`);
  }

  // Render the board as a string.
  //   Attaches a numbering system for readability.
  function render() {
    boardString = " ";
    for (let i = 0; i < size; i++) {
      boardString += ` ${i}|`; // Number columns
    }

    boardString += `\n`;

    for (let i = 0; i < size; i++) {
      boardString += `${i}-`; // Number rows
      for (let j = 0; j < size; j++) {
        boardString += `[${board[i][j].player.marker}]`;
      }
      boardString += `\n`
    }

    return boardString;
  }

  function update(player, row, col) {
    board[row][col] = { player, row, col };
    build(size);
  }

  return {
    init,
    get,
    boardSize,
    render,
    update,
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

  // General
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

  // Gamestate management
  const start = function () {
    setCurrentPlayer(players[0], false);
    console.log(board.render());
  }

  const setCurrentPlayer = function (player, nextTurnFlag) {
    if (nextTurnFlag) {
      let playerIndex;
      players.findIndex((child, index) => {
        if (child.id == player.id)
          playerIndex = index;
      });
      if (playerIndex >= players.length - 1) {
        currentPlayer = { ...players[0] };
      } else {
        currentPlayer = { ...players[playerIndex + 1] };
      }
    } else {
      currentPlayer = player;
    }
  }

  const playTurn = function (row, col) {
    const filledFlag = isFilled(row, col);

    if (!filledFlag) {
      board.update(currentPlayer, row, col);
      setCurrentPlayer(currentPlayer, true);
      console.log(board.render());
    } else {
      throw Error(`${row}x${col}::Tile already filled!`);
    }
  }

  const isFilled = function (row, col) {
    const tile = board.get()[row][col];
    if (tile.player.marker !== '.') {
      return true;
    }

    return false;
  }

  /*
    Check if tile is already filled
    Check for winning move
  */

  return {
    getPlayers,
    addPlayers,
    attachBoard,
    start,
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
  const id = crypto.randomUUID()

  return {
    marker,
    name,
    id,
  }
}

gameBoard.init();

const hunter = playerFactory('x', 'Hunter');
const karma = playerFactory('o', 'Karma');

gameState.addPlayers(hunter, karma);
gameState.attachBoard(gameBoard);

gameState.start();
gameState.playTurn(1, 1);
gameState.playTurn(0, 0);
gameState.playTurn(2, 1);
gameState.playTurn(2, 1);
