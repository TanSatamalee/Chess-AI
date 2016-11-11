
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

/* Actual AI Implementation */
var makeRandomMove = function() {
  var possibleMoves = game.moves();

  /* Game Over */
  if (possibleMoves.length === 0) return;

  var randomIndex = Math.floor(Math.random() * possibleMoves.length);
  game.move(possibleMoves[randomIndex]);
  board.position(game.fen());
};

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

  /* Selection for AI */
  window.setTimeout(makeRandomMove, 250);
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

return board = ChessBoard('board', cfg);

};

$(document).ready(function() {

	board = createBoard();

	$('#resetBtn').on('click', function() {
		board = createBoard();
	});
});