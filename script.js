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
  let tiles = [];
  let board = [];
  let size = 3;
  let boardString = "";
  let app;

  function init(boardSize = 3) {
    app = document.querySelector('.app');
    size = boardSize;
    const builtBoard = build(size);
    board.push(...builtBoard);

  }

  const get = function () {
    return board;
  }

  const getSize = function () {
    return size;
  }

  const setTiles = function (tilesArr) {
    tiles = [...tilesArr];
  }

  const getTiles = function () {
    return tiles;
  }

  const getTile = function (tileArg) {
    const tiles = getTiles()
    const tile = tiles.find((child) => {
      if(child.id === tileArg.dataset.id) {
        return child;
      }
    });
    
    console.log(tile);
    return tile;
  }

  const createTiles = function () {
    const size = getSize();
    const loopSize = size*size;
    const createdTiles = []
    
    for (let i = 0; i < loopSize; i++) {
      const tile = playerFactory('.', 'tile'); // Blank tile.
      createdTiles.push(tile);
    }
    setTiles(createdTiles);
  }

  // Builds the board, storing relevant data of each tile inside an array.
  //   Data such as player marker, inde1fr 1fr 1frx of the tile (row/column).
  function build(boardSize) {
    const newBoard = [];
    app.textContent = '';
    const container = document.createElement('div');
    container.classList.add('container');
    container.addEventListener('click', (event) => {
      if (event.target.classList.contains('tile')) {
        getTile(event.target);
      }
    })

    createTiles();
    const tileSet = getTiles();

    let setIndex = 0;
    for (let i = 0; i < boardSize; i++) {
      let row = [];
      for (let j = 0; j < boardSize; j++) {
        const tileElm = document.createElement('div');
        tileElm.classList.add('tile');
        tileElm.dataset.id = tileSet[setIndex].id;
        container.appendChild(tileElm);

        const rowIndex = i;
        const colIndex = j;

        const tileObj = {
          id: tileSet[setIndex].id,
          player: {
            marker: tileSet[setIndex].marker,
            name: tileSet[setIndex].name,
          },
          row: rowIndex,
          col: colIndex,
          element: tileElm,
        };

        row.push(tileObj);
        setIndex++;
      }
      newBoard.push(row);
    }
    app.appendChild(container);
    return newBoard;
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
    console.log(build(size));
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
    setCurrentPlayer({ player: players[0] });
  }

  const addPlayers = function (playersArg) {
    for (player of playersArg) {
      players.push(player);
    }
  }

  const getPlayers = function () {
    return players;
  }

  function setCurrentPlayer({ player, flag }) {
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
    setCurrentPlayer({ player: players[0], flag: false });
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

      setCurrentPlayer({ player: current, flag: true });
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
    init,
    getPlayers,
    addPlayers,
    start,
    playTurn,
    checkWinner,
  }
})();

// GAME SESSION IIFE //
/******************************** 
*
* Handle STATE of game SESSION
*
********************************/
const gameSession = (function () {

  // TODO:
  //  Receive input of the user to 
  //    start game, 
  //    determine board size, 

  const init = function (players, size = 3) {
    play();
  }

  const play = function () {
    // const players = addPlayers();
    const one = playerFactory('x', 'hunter');
    const two = playerFactory('o', 'karma');
    const players = [one, two];
    gameBoard.init();
    gameState.init(gameBoard, players);
    gameState.start();

    turnPrompt();
  }

  const turnPrompt = function (repeat) {
    const index = prompt('Which tile? (ex: 0x0)');
    const indexArr = index.split('x');
    const row = indexArr[0];
    const col = indexArr[1];
    const isWinner = gameState.playTurn(row, col);

    if (isWinner) {
      return console.log("Winner");
    } else {
      turnPrompt(repeat);
    }
  }

  const addPlayers = function () {
    let addingPlayerFlag = true;
    const players = [];

    while (addingPlayerFlag) {
      if (players.length < 2) {
        const name = prompt('Player Name:');
        if (name === null) {
          addingPlayerFlag = false;
          break;
        }

        const marker = prompt('Player Marker: (ex: X/O)');
        if (marker === null) {
          addingPlayerFlag = false;
          break;
        }

        const player = playerFactory(marker, name)
        players.push(player);

      } else {
        addingPlayerFlag = false;
      }
    }

    return players;
  }

  return {
    init,
    play
  }
})();

gameSession.play();