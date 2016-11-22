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
  var beta = 9999;
  var alpha = -9999;
  var n = $('input[name="iterate"]').val();
  for (var i = 0; i < possibleMoves.length; i++) {
    game.move(possibleMoves[i]);
    var max = maxMove(game, n, alpha, beta);
    game.undo();
    if (max < currentMin) {
      currentMin = max;
      bestMove = possibleMoves[i];
    }
    if (currentMin <= alpha) {
      break;
    }
    beta = Math.min(beta, currentMin)
  }
  game.move(bestMove);
  board.position(game.fen());
};

function minMove(gameState, n, alpha, beta) {
  if (n == 0) {
    return featureFxn(gameState);
  } else {
    var possibleMoves = gameState.moves();
    if (possibleMoves.length === 0) return featureFxn(gameState);
    var currentMin = 9999;
    for (var i = 0; i < possibleMoves.length; i++) {
      game.move(possibleMoves[i]);
      currentMin = Math.min(maxMove(game, n-1, alpha, beta),currentMin);
      game.undo();
      if (currentMin <= alpha) {
        return currentMin;
      }
      beta = Math.min(beta, currentMin);
    }
    return currentMin;
  }
}

function maxMove(gameState, n, alpha, beta) {
  if (n == 0) {
    return featureFxn(gameState);
  } else {
    var possibleMoves = gameState.moves();
    if (possibleMoves.length === 0) return featureFxn(gameState);
    var currentMax = -9999;
    for (var i = 0; i < possibleMoves.length; i++) {
      game.move(possibleMoves[i]);
      currentMax = Math.max(minMove(game, n-1, alpha, beta), currentMax);
      game.undo();
      if (currentMax >= beta) {
        return currentMax
      }
      alpha = Math.max(alpha, currentMax);
    }
    return currentMax;
  }
}


/* ============ FEATURE EVAL FUNCTIONS ================= */

var featurePoints = function(gameBoard) {
  /* Takes care of any edge cases where gameBoard is over */
  if (gameBoard.in_checkmate() && gameBoard.turn() == 'light') {
    return -100;
  } else if (gameBoard.in_checkmate()) {
    return 100;
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
  /* Takes care of any edge cases where gameBoard is over */
  if (gameBoard.in_checkmate() && gameBoard.turn() == 'light') {
    return -100;
  } else if (gameBoard.in_checkmate()) {
    return 100;
  } else if (gameBoard.game_over()) {
    return 0;
  }
  
  var points = 0;
  var board_fen = (gameBoard.fen().split(" "))[0];
  var board = [];
  var temp = [];
  var i, j;
  for (i = 0; i < board_fen.length; i++) {
    if (board_fen[i] == "/") {
      board.push(temp);
      temp = [];
      continue;
    }
    if (!isNaN(parseInt(board_fen[i]))) {
      for (j = 0; j < parseInt(board_fen[i]); j++) {
        temp.push(0);
      }
    } else {
      switch(board_fen[i]) {
        case 'P':
          temp.push(1);
          break;
        case 'p':
          temp.push(-1);
          break;
        case 'N':
          temp.push(3);
          break;
        case 'n':
          temp.push(-3);
          break;
        case 'B':
          temp.push(3);
          break;
        case 'b':
          temp.push(-3);
          break;
        case 'R':
          temp.push(5);
          break;
        case 'r':
          temp.push(-5);
          break;
        case 'Q':
          temp.push(8);
          break;
        case 'q':
          temp.push(-8);
          break;
        case 'K':
          temp.push(-50);
          break;
        case 'k':
          temp.push(50);
          break;
      }
    }
  }
  board.push(temp);

  control_points = [
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,1,1,1,1,0,0],
    [0,0,1,2,2,1,0,0],
    [0,0,1,2,2,1,0,0],
    [0,0,1,1,1,1,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0]
  ];

  for (i = 0; i < 8; i++) {
    points += math.dot(control_points[i], board[i]);
  }

  return points;
}

var featureMixed = function(gameBoard) {
  /* Takes care of any edge cases where gameBoard is over */
  if (gameBoard.in_checkmate() && gameBoard.turn() == 'light') {
    return -100;
  } else if (gameBoard.in_checkmate()) {
    return 100;
  } else if (gameBoard.game_over()) {
    return 0;
  }
  
  var points = 0;
  points += $('input[name="points"]').val()*featurePoints(gameBoard);
  points += $('input[name="control"]').val()*featureControl(gameBoard);

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
      featureFxn = featureControl;
      break;
    case 'defense':
      featureFxn = featurePoints;
      break;
    case 'offense':
      featureFxn = featurePoints;
      break;
    case 'mixed':
      featureFxn = featureMixed;
      break;
    default:
      featureFxn = featurePoints;
  }

  window.setTimeout(minMaxMove, 250);
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
    selectedFeature = $('input[name="feature"]:checked').val();
  });
});