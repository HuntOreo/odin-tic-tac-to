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
  const init = function (board, players) {
    attachBoard(board);
    addPlayers(players);
    setCurrentPlayer(players[0]);
  }

  const getPlayers = function () {
    return players;
  }

  const addPlayers = function (playersArg) {
    for (player of playersArg) {
      players.push(player);
    }
  }

  function setCurrentPlayer(player, flag) {
    if (flag) {
      let playerIndex;
      players.findIndex((child, index) => {
        if (child.id == player.id)
          playerIndex = index;
      });
      if (playerIndex >= players.length - 1) {
        currentPlayer = { ...players[0] };
        return currentPlayer;
      } else {
        currentPlayer = { ...players[playerIndex + 1] };
      }
    } else {
      currentPlayer = player;
    }
  }

  function getCurrentPlayer() {
    return currentPlayer;
  }

  const attachBoard = function (boardArg) {
    board = boardArg;
  }

  // Gamestate management
  const start = function () {
    setCurrentPlayer(players[0], false);
    console.log(board.render());
  }

  const playTurn = function (row, col) {
    const current = getCurrentPlayer();
    const filledFlag = isFilled(row, col);
    let msg = '';

    if (!filledFlag) {
      msg += `${current.name}: ${row}x${col}\n`

      board.update(current, row, col);
      msg += board.render();
      console.log(msg);

      setCurrentPlayer(current, true);
      return checkWinner(current, row, col);
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

  const checkWinner = (current, row, col) => {
    winState.setPlayer(current);
    const isWinner = winState.check(board, row, col);

    return isWinner;
  }

  /* WIN STATE IIFE */
  /* Handle checks for winning move */
  const winState = (function () {
    let current;

    // Gets relevant game info and packages it neatly
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

    // Receive a tile set and inspect for matching markers
    const checkTiles = function (tiles, state) {
      let score = 0;
      for (tile of tiles) {
        if (tile.player.marker === state.player.marker) {
          score++;
        }
      }
      if (score === state.size) {
        return true;
      }
      return false;
    }

    // Win conditions
    const row = function (board, index) {
      const state = getState(board);
      const { gameboard } = state;
      const candidate = gameboard[index];

      return checkTiles(candidate, state);
    }

    const col = function (board, index) {
      const state = getState(board);
      const { gameboard, size } = state;
      const candidate = [];

      for (let i = 0; i < size; i++) {
        candidate.push(gameboard[i][index]);
      }
      return checkTiles(candidate, state);
    }

    const diagonal = function (board, dirFlag) {
      const state = getState(board);
      const { gameboard, size } = state;
      const candidate = [];

      let j = size - 1
      for (let i = 0; i < size; i++) {
        if (dirFlag == '>') {
          candidate.push(gameboard[i][j]);
          j--;
        } else if (dirFlag == '<') {
          candidate.push(gameboard[i][i]);
        }
      }
      return checkTiles(candidate, state);
    }

    // Handle searching for win condition
    const check = function (board, rowIndex, colIndex) {
      let isWinner = false;

      if (isWinner === false) {
        isWinner = row(board, rowIndex);
      }
      if (isWinner === false) {
        isWinner = col(board, colIndex);
      }
      if (isWinner === false) {
        isWinner = diagonal(board, '>');
      }
      if (isWinner === false) {
        isWinner = diagonal(board, '<');
      }

      return isWinner;
    }

    return {
      check,
      setPlayer,
      getPlayer,
    }
  })();

  return {
    getPlayers,
    checkWinner,
    getCurrentPlayer,
    playTurn,
    start,
    init
  }
})();

// GAME SESSION IIFE //
/******************************** 
*
* Handle STATE of game SESSION
*
********************************/
const gameSession = (function () {
  let addingPlayerFlag = true;
  let playingFlag = true;
  const init = function (players, size) {
    gameBoard.init();
    gameState.init(gameBoard, players);
  }

  const play = function () {
    gameState.start();

    while (playingFlag) {

      const index = prompt('Which tile? (ex: 0x0)');
      const indexArr = index.split('x');
      const row = indexArr[0];
      const col = indexArr[1];
      const isWinner = turn(row, col);

      if (isWinner) {
        togglePlayingFlag();
        console.log('Winner!');
      }
    }
  }

  const turn = function (row, col) {
    return gameState.playTurn(row, col)
  }

  // TODO:
  //  Receive input of the user to 
  //    start game, 
  //    determine board size, 
  //    add players

  const togglePlayingFlag = function () {
    playingFlag = !playingFlag;
  }

  /* const size = prompt('Board size: (leave blank for default)');

  // if (size === null) {
  //   addingPlayerFlag = false;
  //   playingFlag = false;
  // } else {
  //   size ? gameBoard.init(size) : gameBoard.init();
  //   attachBoard(gameBoard);
  // }

  // while (addingPlayerFlag) {
  //   addingPlayerFlag = false;
  //   if (players.length < 2) {
  //     addingPlayerFlag = true;
  //     const name = prompt('Player Name:');
  //     if (name === null) {
  //       addingPlayerFlag = false;
  //       playingFlag = false;
  //       break;
  //     }
  //     const marker = prompt('Player Marker: (ex: X/O)');
  //     if (marker === null) {
  //       addingPlayerFlag = false;
  //       playingFlag = false;
  //       break;
  //     }
  //     addPlayers({ marker, name });
  //   }
  // }

  // if (size > 3) {
  //   let addMoreCheck = false;
  //   const addMorePrompt = prompt('Add more players? (y/n)');
  //   if (addMorePrompt === null) { playingFlag = false }
  //   if (addMorePrompt === 'y') {
  //     addMoreCheck = true;
  //     while (addMoreCheck) {
  //       const name = prompt('Player Name:');
  //       const marker = prompt('Player Marker: (ex: X/O)');
  //       addPlayers({ marker, name });
  //       const addMorePrompt = prompt('Add more players? (y/n)');
  //       if (addMorePrompt === null) {
  //         playingFlag = false;
  //         break;
  //       }
  //       if (addMorePrompt === 'y') { addMoreCheck = true }
  //       if (addMorePrompt === 'n') { addMoreCheck = false }
  //     }
  //   }
  */

  return {
    init,
    play
  }

})();

const playerOne = playerFactory('x', 'Hunter');
const playerTwo = playerFactory('o', 'Karma');

const players = [playerOne, playerTwo];

gameSession.init(players);
gameSession.play();