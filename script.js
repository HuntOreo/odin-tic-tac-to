/* 
Main Goal:
  Build a functional Tic Tac Toe game.
  Use as little globally scoped code as possible.
*/

// PLAYER FACTORY //
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

  // Blank Tile
  const tile = playerFactory('.', 'blank');

  const get = function () {
    return board;
  }

  const getSize = function () {
    return size;
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

        const tileObj = {
          player: tile,
          row: rowIndex,
          col: colIndex,
        }
        row.push(tileObj);
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
    getSize,
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
    let msg = '';

    if (!filledFlag) {
      msg += `${currentPlayer.name}: ${row}x${col}\n`

      board.update(currentPlayer, row, col);
      msg += board.render();
      console.log(msg);

      checkWinner(row, col);
      setCurrentPlayer(currentPlayer, true);
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

  const checkWinner = (row, col) => {
    winState.setPlayer(currentPlayer);
    console.log(winState.check(board, row, col));
  }

  /*
    Check for winning move
      - Columns: [boardSize] of the same in a single col
      - Diagonal: [boardSize] of the same in a single diagonal
        - Forward diagonal
        - Backward diagonal
  */
  /* WIN STATE */
  /* Handle checks for winning move */
  const winState = (function () {
    let current;

    const getState = function (board) {
      const gameboard = board.get();
      const size = board.getSize();
      const player = getPlayer();

      return {
        gameboard,
        size,
        player,
      }
    }

    const setPlayer = function (player) {
      current = player;
    }

    const getPlayer = function () {
      return current;
    }

    const checkTiles = function (tiles, state) {
      let score = 0;
      for (tile of tiles) {
        if (tile.player.marker === state.player.marker) {
          score++;
        }
      }

      if (score === state.size) {
        return console.log(`${state.player.name} wins!`);
      }
    }

    const row = function (board, row) {
      const state = getState(board);
      const { gameboard } = state;
      const candidate = gameboard[row];

      checkTiles(candidate, state);
    }

    const col = function (board, row, col) {
      const state = getState(board);
      const { gameboard, size } = state;
      const candidate = [];

      for (let i = 0; i < size; i++) {
        candidate.push(gameboard[i][col]);
      }

      checkTiles(candidate, state);

    }

    const diagonalFor = function () {

    }

    const diagonalBack = function () {

    }

    const check = function (board, rowIndex, colIndex) {
      row(board, rowIndex);
      col(board, rowIndex, colIndex);
      return 'checked';
    }

    return {
      check,
      setPlayer,
      getPlayer,
    }
  })();

  return {
    getPlayers,
    addPlayers,
    attachBoard,
    start,
    playTurn,
  }
})();

// Play Game
gameBoard.init(4);

const hunter = playerFactory('x', 'Hunter');
const karma = playerFactory('o', 'Karma');

gameState.addPlayers(hunter, karma);
gameState.attachBoard(gameBoard);

gameState.start();
gameState.playTurn(0, 0);
gameState.playTurn(1, 2);
gameState.playTurn(1, 0);
gameState.playTurn(2, 1);
gameState.playTurn(2, 0);
gameState.playTurn(1, 3);
gameState.playTurn(3, 0);


