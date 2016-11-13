var algorithm = 'random';
var selectedFeature = 'points';
var featureFxn = null;

function createBoard() {

/* Initializes Game Board */
var board,
  game = new Chess();

/* Game Over and Player Piece Movement Conditions */
var onDragStart = function(source, piece, position, orientation) {
  if (game.in_checkmate() === true || game.in_draw() === true ||
    piece.search(/^b/) !== -1) {
    return false;
  }
};

/* =================== AI ALGORITHMS ====================== */

/* Random Move AI */
var makeRandomMove = function() {
  var possibleMoves = game.moves();

  /* Game Over */
  if (possibleMoves.length === 0) return;

  var randomIndex = Math.floor(Math.random() * possibleMoves.length);
  game.move(possibleMoves[randomIndex]);
  board.position(game.fen());
};

/* Min-Max AI */
var minMaxMove = function () {
  var possibleMoves = game.moves();

  /* Game Over */
  if (possibleMoves.length === 0) return;

  var bestMove = possibleMoves[0];
  var currentMin = 9999;
  var n = $('input[name="iterate"]').val();
  for (var i = 0; i < possibleMoves.length; i++) {
    game.move(possibleMoves[i]);
    var max = maxMove(game, n);
    game.undo();
    if (max < currentMin) {
      currentMin = max;
      bestMove = possibleMoves[i];
    }
  }
  game.move(bestMove);
  board.position(game.fen());
};

function minMove(gameState, n) {
  if (n == 0) {
    return featureFxn(gameState);
  } else {
    var possibleMoves = gameState.moves();
    var currentMin = 9999;
    for (var i = 0; i < possibleMoves.length; i++) {
      game.move(possibleMoves[i]);
      var max = maxMove(game, n-1);
      game.undo();
      if (max < currentMin) {
        currentMin = max;
      }
    }
    return currentMin;
  }
}

function maxMove(gameState, n) {
  if (n == 0) {
    return featureFxn(gameState);
  } else {
    var possibleMoves = gameState.moves();
    var currentMax = 0;
    for (var i = 0; i < possibleMoves.length; i++) {
      game.move(possibleMoves[i]);
      var min = minMove(game, n-1);
      game.undo();
      if (min > currentMax) {
        currentMax = min;
      }
    }
    return currentMax;
  }
}


/* ============ FEATURE EVAL FUNCTIONS ================= */

var featurePoints = function(gameBoard) {
  /* Takes care of any edge cases where gameBoard is over */
  if (gameBoard.in_checkmate() && gameBoard.turn() == 'light') {
    return 100;
  } else if (gameBoard.in_checkmate()) {
    return -100;
  } else if (gameBoard.game_over()) {
    return 0;
  }


  var points = 0;
  var gameState = gameBoard.fen();
  for (var i = 0; i <= gameState.length; i++) {
    if (gameState[i] == ' ') {
      break;
    }
    switch(gameState[i]) {
      case 'P':
        points += 1;
        break;
      case 'p':
        points -= 1;
        break;
      case 'N':
        points += 3;
        break;
      case 'n':
        points -= 3;
        break;
      case 'B':
        points += 3;
        break;
      case 'b':
        points -= 3;
        break;
      case 'R':
        points += 5;
        break;
      case 'r':
        points -= 5;
        break;
      case 'Q':
        points += 8;
        break;
      case 'q':
        points -= 8;
        break;
    }
  }
  return points;
}

var featureControl = function(gameBoard) {
  points = 0;

  return points;
}

/* ====================================================== */

/* Handles Player Movements */
var onDrop = function(source, target) {
  /* Checks Legality of Move */
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NEED IMPLEMENT PLAYER SELECTION
  });

  /* Illegal Move Handler */
  if (move === null) return 'snapback';

  /* Selection for Evaluation Function (If Needed) */
  switch (selectedFeature) {
    case 'points':
      featureFxn = featurePoints;
      break;
    case 'control':
      featureFxn = featurePoints;
      break;
    case 'defense':
      featureFxn = featurePoints;
      break;
    case 'offense':
      featureFxn = featurePoints;
      break;
    case 'mixed':
      featureFxn = featurePoints;
      break;
    default:
      featureFxn = featurePoints;
  }

  /* Selection for AI */
  switch (algorithm) {
    case 'random':
      window.setTimeout(makeRandomMove, 250);
      break;
    case 'minmax':
      window.setTimeout(minMaxMove, 250);
      break;
    default:
      window.setTimeout(makeRandomMove, 250);
  }
};

/* Syncs the board for edge cases */
var onSnapEnd = function() {
  board.position(game.fen());
};

/* Creates Board Configuration */
var cfg = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
};

board = ChessBoard('board', cfg);

};

$(document).ready(function() {

	createBoard();

	$('#resetBtn').on('click', function() {
    createBoard();
  });
  $('.alg').on('click', function() {
    algorithm = $('input[name="algorithm"]:checked').val();
  });
  $('.feature').on('click',function() {
    selectedFeature = this.val();
  });
});