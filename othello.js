const initial_gameboard = [[0,0,0,0,0,0,0,0],
				 		   [0,0,0,0,0,0,0,0],
				  		   [0,0,0,0,0,0,0,0],
						   [0,0,0,1,2,0,0,0],
						   [0,0,0,2,1,0,0,0],
						   [0,0,0,0,0,0,0,0],
						   [0,0,0,0,0,0,0,0],
						   [0,0,0,0,0,0,0,0]]

var gameboard = cloneBoard(initial_gameboard);
var possibleBoard;
var possibleMoves = [];

const htmlGame = 'game-table';

const DARK = 2;
const LIGHT = 1;
const BLANK = 0;
const POSSIBLE = -1;


var darkPlayer = true;	// dark
var inGame = false;
var humanMode = true;

//
// UTILITY FUNCTIONS
//

function cloneBoard(board) {
	var newBoard = [];
	for (var i = 0; i < board.length; i++)
    	newBoard[i] = board[i].slice();
	return newBoard;
}


// initial html game board creation
function createGameTable() {
	var gametable = document.getElementById(htmlGame);

	for (let i=0; i < 8; i++) {
		let row = document.createElement("tr");

		 // create cells 
		for (let j=0; j < 8; j++) {
			let cell = gameboard[i][j];
			let htmlCell = document.createElement("td");
			let button = document.createElement("button");

			button.innerHTML = "&#9679";
			button.className = getButtonClassName(cell);
			button.disabled = true;
			button.onclick = () => { doMove(button, i, j) };

			htmlCell.appendChild(button);
      		row.appendChild(htmlCell);
		}

		gametable.appendChild(row);
	}
}

function getButtonClassName(value) {
	if (value == BLANK) {
		return "button button-blank";
	} else if (value == LIGHT) {
		return "button button-light";
	} else if (value == DARK) {
		return "button button-dark";
	} else {
		if (darkPlayer) {
			return "button button-possible-dark";
		} else {
			return "button button-possible-light";
		}
	}
}

function isDisabled(value) {
	return value != POSSIBLE;
}

function getPlayerPiece(player) {
	return player ? DARK : LIGHT;
}

function getOpponentPiece(player) {
	return player ? LIGHT : DARK;
}


// returns the number of blank spaces
function blankSpaces(board) {
	var count = 0;
	for (let i=0; i < 8; i++)  {
		for (let j=0; j<8; j++) {
			if (board[i][j] == BLANK) {
				count++;
			}
		}
	}
	return count;
}

// updates current view of game 
function refreshGameBoard(board) {
	var gametable = document.getElementById(htmlGame);

	for (let i=0; i < 8; i++) {
		for (let j=0; j < 8; j++) {
			let value = board[i][j];
			let button = gametable.rows[i].cells[j].firstChild;
			button.className = getButtonClassName(value);
			button.disabled = isDisabled(value);
		}
	}
}

function getScores() {
	var lscore = 0;
	var dscore = 0;
	for (let i=0; i<8; i++) {
		for (let j=0; j<8; j++) {
			let value = gameboard[i][j];
			if (value == DARK) {
				dscore++;
			} else if (value == LIGHT) {
				lscore++;
			}
		}
	}
	return {light: lscore, dark: dscore};
}


// update the internal and visual score keeping 
function updateScores() {
	var lscore = document.getElementById('light-score');
	var dscore = document.getElementById('dark-score');
	var scores = getScores();

	lscore.innerHTML = scores.light;
	dscore.innerHTML = scores.dark;
}

function getPlayerName(player) {
	return player ? "Dark" : "Light";
}

function updatePlayer(player) {
	var turn = document.getElementById('turn');
	turn.innerHTML = getPlayerName(player) + " Player's turn";
}

function getWinner(scores) {
	if (scores.light > scores.dark) {
		return "Light";
	} else if (scores.light < scores.dark) {
		return "Dark";
	} else {
		return "Tie";
	}
}

//
// GAME ENGINE
//

// board where piece not placed yet at (i,j)
function flipPieces(board,i,j,player) {
	if (board[i][j] != BLANK) return false;
	let flipped = cloneBoard(board);
	
	// assign the pieces for each player
	var A = getPlayerPiece(player);
	var B = getOpponentPiece(player);

	let validCount = 0;

	// 8 directions to check
	var dir = [[0,1], [1,0], [0,-1], [-1,0], [1,1], [-1,-1], [1,-1], [-1,1]];

	for (let h=0; h<8; h++) {
		let k = i + dir[h][0];
		let l = j + dir[h][1];
	
		let valid = false;
		let count = 0;
		// count how many opponent pieces are between the next blank or player piece
		while (k >= 0 && k < 8 && l >=0 && l < 8 && board[k][l] != BLANK ) {
			if (board[k][l] == B) {
				count++;
				k += dir[h][0];
				l += dir[h][1];
			} else if (board[k][l] == A) {
				if (count >= 1) {
					valid = true;
					validCount++;
				}
				break;
			}
		}
	
		// if valid direction, flip the pieces on the board
		if (valid) {
			k = i + dir[h][0];
			l = j + dir[h][1];
			for (let g = 0; g < count; g++) {
				flipped[k][l] = A;
				k += dir[h][0];
				l += dir[h][1];
			}
		}

	}
	if (validCount > 0) {
		flipped[i][j] = A;
		return flipped;	
	} else {
		return false;
	}

}

// get all possible moves by searching each blank spot if it is valid
function getPossibleMoves(board, player) {
	let possible = cloneBoard(board);
	let moves = [];
	for (let i=0; i < 8; i++)  {
		for (let j=0; j<8; j++) {
			if (possible[i][j] == BLANK) {
				var flipped = flipPieces(board, i, j, player);
				if (flipped) {
					moves.push({state: flipped, action: [i,j]});
					possible[i][j] = POSSIBLE;
				}
			}
		}
	}

	return {board: possible, moves: moves};
}


// with at least 1 human player
function startGame(human) {
	var ingame = document.getElementById('ingame');
	ingame.className = "";

	gameboard = cloneBoard(initial_gameboard);

	darkPlayer = true;
	updatePlayer(darkPlayer);

	updateScores();

	possibleMoves = getPossibleMoves(gameboard, darkPlayer);
	possibleBoard = possibleMoves.board;
	refreshGameBoard(possibleBoard);

	inGame = true;
	humanMode = human;

}



async function doMove(button, i, j) {
	console.log(i, j, darkPlayer);
	if (!inGame) return;

	if(possibleBoard[i][j] == POSSIBLE) {
		// place their move
		gameboard = flipPieces(gameboard, i,j,darkPlayer);
		refreshGameBoard(gameboard);

		// change to white player
		darkPlayer = !darkPlayer;
		updatePlayer(darkPlayer);


		if (!humanMode) {	
			let numPlayerMoves;
			do {
				console.log("AIs turn!")
				possibleMoves = getPossibleMoves(gameboard, darkPlayer)
				refreshGameBoard(possibleMoves.board);
				await sleep(400);	
	
				// let ai_move = randomMove(gameboard, darkPlayer);
				let ai_move = simpleMinimax(gameboard, darkPlayer);
	
				if (ai_move) {
					// show ai's move
					gameboard[ai_move.action[0]][ai_move.action[1]] = getPlayerPiece(darkPlayer);
					refreshGameBoard(gameboard);
		
					await sleep(300);
					gameboard = ai_move.state;
				} else {
					console.log("NO MOVES")
					break;
				}
					darkPlayer = !darkPlayer;
					updatePlayer(darkPlayer);

					// check if human has moves
					possibleMoves = getPossibleMoves(gameboard, darkPlayer)
					refreshGameBoard(possibleMoves.board)
					numPlayerMoves = possibleMoves.moves.length;
					console.log("HUMAN HAS ", numPlayerMoves)
					if (numPlayerMoves == 0) {
						console.log("NO MOVES")
						darkPlayer = !darkPlayer;
						updatePlayer(darkPlayer);
					}
			} while (numPlayerMoves == 0);
			
		}

		console.log("HUMAN TURN")

		// set up for next player
		possibleMoves = getPossibleMoves(gameboard, darkPlayer)

		// if current player is out of moves
		if (possibleMoves.moves.length == 0) {
			console.log("NO MOVES")
			// switch players
			darkPlayer = !darkPlayer;
			updatePlayer(darkPlayer);

			possibleMoves = getPossibleMoves(gameboard, darkPlayer);

			// neither players have any more moves, game over
			if (possibleMoves.moves.length == 0) {
				console.log("NO MOVES")
				// game over 
				inGame = false;
				gameOver();
			}
		} 
		// still in game, then continue setting up for next player
		if (inGame) {
			possibleBoard = possibleMoves.board;
			refreshGameBoard(possibleBoard);
			updateScores();
		}
	}
}

async function watchAi() {
	var ingame = document.getElementById('ingame');
	ingame.className = "";

	gameboard = cloneBoard(initial_gameboard);

	console.log("random", getPlayerName(!darkPlayer))
	console.log("minimax", getPlayerName(darkPlayer))

	darkPlayer = true;
	updatePlayer(darkPlayer);

	refreshGameBoard(gameboard);
	updateScores();

	await sleep(300);

	let ableToMove = false;
	inGame = true;

	while (inGame) {
		let ai_move;
		if (!darkPlayer) {
			ai_move = randomMove(gameboard, darkPlayer);
		} else {
			ai_move = simpleMinimax(gameboard, darkPlayer);
		}
		
		if (!ai_move && !ableToMove) {
			inGame = false;
			break;
		}
		if (ai_move) {
			// show ai's move
			gameboard[ai_move.action[0]][ai_move.action[1]] = getPlayerPiece(darkPlayer);
			refreshGameBoard(gameboard);

			await sleep(1);
			gameboard = ai_move.state;
			refreshGameBoard(gameboard);
			ableToMove = true;
		} else {
			ableToMove = false;
		}
		
		darkPlayer = !darkPlayer;
		updatePlayer(darkPlayer);
		updateScores();
	}

	if (!inGame) gameOver();
}

function gameOver() {	
	updateScores();
	console.log("game over");	
	console.log("winner", getWinner(getScores()))	

	var turn = document.getElementById('turn');
	turn.innerHTML = "Winner: " + getWinner(getScores());

}


function simulation(runs) {
	let stats = {
		winner: {
			dark: 0,
			light: 0,
			tie: 0
		},
		scores: [],
		avgScoreDiff: 0
	}

	for (var i=0; i<runs; i++) {
		gameboard = cloneBoard(initial_gameboard);

		darkPlayer = true;
		console.log("minimax", getPlayerName(darkPlayer), "random", getPlayerName(!darkPlayer))


		let ableToMove = false;

		inGame = true;

		while (inGame) {
			let ai_move;
			if (!darkPlayer) {
				ai_move = randomMove(gameboard, darkPlayer);
			} else {
				ai_move = simpleMinimax(gameboard, darkPlayer);
			}
			
			if (!ai_move && !ableToMove) {
				inGame = false;
				break;
			}
			if (ai_move) {
				gameboard = ai_move.state;
				ableToMove = true;
			} else {
				ableToMove = false;
			}
			
			darkPlayer = !darkPlayer;
		}
		if (!inGame) {
			var scores = getScores();
			if (scores.dark > scores.light) {
				stats.winner.dark++;
			} else if (scores.dark < scores.light) {
				stats.winner.light++;
			} else {
				stats.winner.tie++;
			}
			console.log("winner", getWinner(scores))
			console.log("scores", scores)
			stats.scores.push(scores.dark-scores.light)
		}
	}
	let average = (array) => array.reduce((a, b) => a + b) / array.length;
	stats.avgScoreDiff = average(stats.scores);
	console.log("stats", stats)
	

}

window.onload = createGameTable();
