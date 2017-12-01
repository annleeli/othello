const initial_gameboard = [[0,0,0,0,0,0,0,0],
				 		   [0,0,0,0,0,0,0,0],
				  		   [0,0,0,0,0,0,0,0],
						   [0,0,0,1,2,0,0,0],
						   [0,0,0,2,1,0,0,0],
						   [0,0,0,0,0,0,0,0],
						   [0,0,0,0,0,0,0,0],
						   [0,0,0,0,0,0,0,0]]

let gameboard;
let lightPieces = [];
let darkPieces = [];
let lightScore = 0;
let darkScore = 0;
let possibleMoves = new Set([]);

const htmlGame = 'game-table';

const DARK = 2;
const LIGHT = 1;
const BLANK = 0;
// const POSSIBLE = -1;


let darkPlayer = true;	// dark
let inGame = false;
let AI = false;

class Cell {
	constructor(value, row, col) {
		this.value = value;
		this.row = row;
		this.col = col;
		this.isPossible = false
	}

	// returns each cell's class name based game state
	get buttonClassName() {
		if (this.value == BLANK) {
			if (this.isPossible) {
				if (darkPlayer) {
					return "button-possible-dark";
				} else {
					return "button-possible-light";
				}
			} else {
				return "button-blank";
			}
		} else if (this.value == LIGHT) {
			return "button-light";
		} else if (this.value == DARK) {
			return "button-dark";
		} 
	}

	get disabled() {
		return !this.isPossible
	}

}

// creates the initial game board
function createGameBoard() {
	gameboard = [];
	for (let i=0; i < 8; i++) {
		gameboard.push([]);
		for (let j=0; j < 8; j++) {
			let cell = new Cell(initial_gameboard[i][j], i, j);
			gameboard[i].push(cell);
			if (cell.value == DARK) {
				darkPieces.push(cell);
			} else if (cell.value == LIGHT) {
				lightPieces.push(cell);
			}
		}
	}
	console.log(darkPieces,lightPieces)
}


// initial game board creation
function createGameTable() {
	var gametable = document.getElementById(htmlGame);
	createGameBoard();

	for (let i=0; i < 8; i++) {
		let row = document.createElement("tr");

		 // create cells 
		for (let j=0; j < 8; j++) {
			let cell = gameboard[i][j];
			let htmlCell = document.createElement("td");
			let button = document.createElement("button");

			button.innerHTML = cell.value;
			button.className = cell.buttonClassName;
			button.disabled = true;
			button.onclick = () => { doMove(button, i, j) };

			htmlCell.appendChild(button);
      		row.appendChild(htmlCell);
		}

		gametable.appendChild(row);
	}
}

// updates current view of game 
function refreshGameBoard(board) {
	var gametable = document.getElementById(htmlGame);

	for (let i=0; i < 8; i++) {
		for (let j=0; j < 8; j++) {
			let cell = board[i][j];
			let button = gametable.rows[i].cells[j].firstChild;
			button.innerHTML = cell.value;
			button.className = cell.buttonClassName;
			button.disabled = cell.disabled;
		}
	}
}


// update the internal and visual score keeping 
function updateScores() {
	var lscore = document.getElementById('light-score');
	var dscore = document.getElementById('dark-score');
	
	lightScore = lightPieces.length;
	darkScore = darkPieces.length;

	lscore.innerHTML = lightScore;
	dscore.innerHTML = darkScore;

}


// GAME 

function startGame() {
	var scores = document.getElementById('scores');
	scores.className = "";

	var playBtn = document.getElementById('play-button');
	playBtn.className = "hidden";

	darkPlayer = true;

	possibleMoves = getPossibleMoves(gameboard, darkPlayer)
	refreshGameBoard(gameboard);
	updateScores();

	inGame = true;
	

}

function getPossibleMoves(board, player) {
	let moves = [];
	// for (let i=0; i < 8; i++)  {
	// 	for (let j=0; j<8; j++) {
	// 		let cell = board[i][j];
	// 		if (cell.value == BLANK) {
	// 			cell.isPossible = true;
	// 			moves.push(cell);
	// 		}
	// 	}
	// }

	let pieces = player ? darkPieces : lightPieces;

	

	return moves;
}


function doMove(button, i, j) {
	console.log(i, j, darkPlayer);
	let cell = gameboard[i][j];

	if(cell.isPossible) {
		// place their move
		cell.value = darkPlayer ? DARK : LIGHT;
		if (darkPlayer) {
			darkPieces.push(cell);
		} else {
			lightPieces.push(cell);
		}

		// update with their move applied
		let flippedBoard = flipPieces(i,j,darkPlayer);
		refreshGameBoard(flippedBoard);

		// change to white player
		darkPlayer = !darkPlayer;


		if (AI) {	
			// get white moves 
			// apply the chosen move
			// timer for 0.5s so player can see their move
			// refresh game with their moves applied + possible moves for player
		}

		possibleMoves = getPossibleMoves(gameboard, darkPlayer)
		refreshGameBoard(gameboard);
		updateScores();
	}
}

function flipPieces(i,j,player) {
	// clean out the old possible moves
	possibleMoves.forEach((cell) => {
		cell.isPossible = false;
	})
	possibleMoves = new Set([]);

	// flip the pieces based on newly placed piece

	return gameboard;

}

window.onload = createGameTable();
