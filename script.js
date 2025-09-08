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
  let app = document.querySelector('.app');
  let tiles = [];
  let boardData = [];
  let size = 3;
  let boardEl;

  function init(boardSize = 3) {
    size = boardSize;
    const container = document.createElement('div');
    container.classList.add('board');
    container.style.gridTemplateColumns = `repeat(${boardSize}, clamp(90px, 20vw, 200px))`;
    container.style.gridTemplateRows = `repeat(${boardSize}, clamp(90px, 20vw, 200px))`;

    setBoardEl(container);
    const builtBoard = build(size, container);
    boardData.push(...builtBoard);
  }

  const getData = function () {
    return boardData;
  }

  const getSize = function () {
    return size;
  }

  const setTiles = function (tilesArr) {
    tiles = [...tilesArr];
  }

  const setData = function (data) {
    boardData = [...data];
  }

  const setBoardEl = function (element) {
    boardEl = element
  }

  const getApp = function () {
    return app;
  }

  const getBoardEl = function () {
    return boardEl;
  }

  const getTiles = function () {
    return tiles;
  }

  const getTile = function (tileArg) {
    const tiles = getTiles();
    const tile = tiles.find((child) => {
      if (child.id === tileArg.dataset.id) {
        return child;
      }
    });

    return tile;
  }

  const createTiles = function () {
    const size = getSize();
    const loopSize = size * size;
    const createdTiles = []

    for (let i = 0; i < loopSize; i++) {
      const tile = playerFactory('.', 'tile'); // Blank tile.
      createdTiles.push(tile);
    }
    setTiles(createdTiles);
  }

  const updateTile = function (tile) {
    const tiles = getTiles();
    const index = tiles.findIndex((child) => (child.id === tile.id));

    tiles[index] = tile;
    setTiles(tiles);
  }

  // Builds the board, storing relevant data of each tile inside an array.
  //   Data such as player marker, index of the tile (row/column).
  function build(boardSize, container) {
    app.textContent = '';
    const newTileSet = [];
    const newBoard = [];

    createTiles();
    const oldTileSet = getTiles();
    let tileSetIndex = 0;

    for (let i = 0; i < boardSize; i++) {

      let row = [];
      for (let j = 0; j < boardSize; j++) {
        const tileElm = document.createElement('div');
        tileElm.classList.add('tile');
        tileElm.dataset.id = oldTileSet[tileSetIndex].id;
        container.appendChild(tileElm);

        const rowIndex = i;
        const colIndex = j;

        const tileObj = {
          id: oldTileSet[tileSetIndex].id,
          player: {
            marker: oldTileSet[tileSetIndex].marker,
            name: oldTileSet[tileSetIndex].name,
          },
          row: rowIndex,
          col: colIndex,
          element: tileElm,
        };

        row.push(tileObj);
        newTileSet.push(tileObj);
        tileSetIndex++;
      }
      newBoard.push(row);
    }

    setTiles(newTileSet);
    return newBoard;
  }

  // Render the board as a string.
  //   Attaches a numbering system for readability.
  function render(parent, append, ...children) {
    for (child of children) {
      if (child.element) {
        if (append) {
          parent.appendChild(child.element);
        } else {
          parent.after(child.element);
        }
      }
      else { parent.appendChild(child) }
    }
  }

  function updateData() {
    const boardSize = getSize();
    const tileSet = getTiles();
    const newBoard = [];
    let tileSetIndex = 0;

    for (let i = 0; i < boardSize; i++) {
      let row = [];
      for (let j = 0; j < boardSize; j++) {
        row.push(tileSet[tileSetIndex]);
        tileSetIndex++;
      }
      newBoard.push(row);
    }
    setData(newBoard);
  }

  return {
    init,
    getData,
    getSize,
    getTile,
    getTiles,
    getApp,
    getBoardEl,
    render,
    updateData,
    updateTile
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

  const addPlayers = function (playersArg) {
    for (player of playersArg) {
      players.push(player);
    }
  }

  const getPlayers = function () {
    return players;
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
    setCurrentPlayer(players[0])
    const board = gameBoard.getBoardEl();
    const app = gameBoard.getApp();

    board.addEventListener('click', selectTile);
    gameBoard.render(app, false, board);
  }

  const selectTile = function (event) {
    if (event.target.classList.contains('tile')) {
      const oldTile = gameBoard.getTile(event.target);
      const newTile = { ...oldTile };
      const player = getCurrentPlayer();
      const content = document.createElement('p');
      if (!isFilled(oldTile)) {

        content.classList.add('content');

        setTimeout(() => {
          content.innerText = player.marker;
          content.style.opacity = '1';
        }, 1); // Small delay to allow initial opacity to be set

        newTile.player = player;
        newTile.element.appendChild(content);

        gameBoard.updateTile(newTile);
        gameBoard.updateData();
        playTurn(newTile)
      } else {
        throw Error(`${oldTile.row}x${oldTile.col}::Tile already filled!`);
      }
    }
  }

  const playTurn = function (tile) {
    const player = getCurrentPlayer();
    setCurrentPlayer(player, true);

    const row = tile.row;
    const col = tile.col;
    const winnerBool = checkWinner(player, row, col);

    if (winnerBool) {
      const scoreBoard = gameSession.getScoreBoard();
      console.log(scoreBoard.lastChild);
      scoreBoard.children[0].textContent = `${player.name} wins!`;
      scoreBoard.classList.remove('hidden');
      handleVictory();
    }
  }

  const isFilled = function (tile) {
    if (tile.player.marker !== '.') {
      return true;
    }

    return false;
  }

  const checkWinner = function (current, row, col) {
    winState.setPlayer(current);
    const isWinner = winState.check(board, row, col);

    return isWinner;
  }

  const handleVictory = function () {
    const container = gameBoard.getBoardEl();
    container.removeEventListener('click', selectTile);
  }

  /* WIN STATE IIFE */
  /* Handle checks for winning move */
  const winState = (function () {
    let current;

    // Gets relevant game info and packages it neatly
    const getState = function (board) {
      const gameboard = board.getData();
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
  }
})();

// GAME SESSION IIFE //
/******************************** 
*
* Handle STATE of game SESSION
*
********************************/
const gameSession = (function () {
  let scoreBoardElm = document.querySelector('.scoreboard');
  const buttons = document.querySelector('.buttons');
  const addPlayersForm = document.querySelector('#add-players');
  const submitForm = addPlayersForm.querySelector('button');
  const players = [];

  const init = function () {
    submitForm.addEventListener('click', addPlayers);
    buttons.children[0].addEventListener('click', restart);
    buttons.children[1].addEventListener('click', quit);
  }

  const getScoreBoard = function () {
    return scoreBoardElm;
  }

  const play = function () {
    gameBoard.init();
    gameState.init(gameBoard, players);
    gameState.start();
  }

  const addPlayers = function (event) {
    if (!checkRequired()) {
      event.preventDefault()
      const data = new FormData(addPlayersForm);
      const names = data.getAll('name');
      const markers = data.getAll('marker');

      const playerOne = playerFactory(markers[0], names[0]);
      const playerTwo = playerFactory(markers[1], names[1]);
      players.push(playerOne, playerTwo);

      hideBoard();
      play();
    }
  }

  const restart = function () {
    getScoreBoard().classList.add('hidden');
    play();
  }

  const quit = function () {
    restart();
    hideBoard();
    buttons.classList.add('hidden');
  }

  const hideBoard = function () {
    gameBoard.getApp().classList.toggle('hidden');
    addPlayersForm.parentElement.classList.toggle('hidden');
    buttons.classList.toggle('hidden');
  }

  const checkRequired = function () {
    let emptyRequired = false;
    const inputs = addPlayersForm.querySelectorAll('input[required]');
    for (input of inputs) {
      if (input.value === "") {
        emptyRequired = true;
      }
    }

    return emptyRequired;
  }

  return {
    init,
    getScoreBoard,
  }
})();

gameSession.init();