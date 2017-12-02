// AI Stratgies return {state: gameboard, action: [i,j]}

// Random Stratgey 
function randomMove(board, player) {
	var allMoves = getPossibleMoves(board, player);
	if (allMoves.moves.length == 0) return false;

	var randMove = getRandomInt(0, allMoves.moves.length-1);
	return allMoves.moves[randMove];
}

/*
 * minimax algo
 */


// const position_vals = [[120,-20,20,5,5,20,-20,120],
// 					   [-20,-40,-5,-5,-5,-5,-40,-20],
// 					   [20,-5,15,3,3,15,-5,20],
// 					   [5,-5,3,3,3,3,-5,5],
// 					   [5,-5,3,3,3,3,-5,5],
// 					   [20,-5,15,3,3,15,-5,20],
// 					   [-20,-40,-5,-5,-5,-5,-40,-20],
// 					   [120,-20,20,5,5,20,-20,120]]

const position_vals = [[12,-6,3,2,2,3,-6,12],
					   [-6,-40,-5,-5,-5,-5,-40,-6],
					   [3,-5,15,3,3,15,-5,3],
					   [2,-5,3,3,3,3,-5,2],
					   [2,-5,3,3,3,3,-5,2],
					   [3,-5,15,3,3,15,-5,3],
					   [-6,-40,-5,-5,-5,-5,-40,-6],
					   [12,-6,3,2,2,3,-6,12]]



// evaluation function with weighted squares strategy, mobility heuristics 
function evalCount(node, player) {
	// console.log("evalCount", node)
	var piece = getPlayerPiece(player);
	var oppPiece = getOpponentPiece(player);
	var score = 0;
	var oppScore = 0;

	// how many moves the player would have next
	var mobility = successor(node, player).length;

	// position values
	for (let i=0; i<8; i++) {
		for (let j=0; j<8; j++) {
			if (node.state[i][j] == piece) {
				score += position_vals[i][j];
			} else if (node.state[i][j] == oppPiece) {
				oppScore += position_vals[i][j];
			}
		}
	}
	return 1*(score - oppScore) + 1.25*mobility;
}


// evaluation function with weighted squares strategy, mobility and stability heuristics 
function evalWithMobilityAndStability(node, player) {
	// console.log("evalCount", node)
	var piece = getPlayerPiece(player);
	var oppPiece = getOpponentPiece(player);
	var score = 0;
	var oppScore = 0;
	var stable = 0;
	var oppStable = 0;
	// how many moves the player would have next
	var mobility = successor(node, player).length;
	var oppMobility = successor(node, !player).length;
	var rowFull=[];
	var columnFull=[];
	var diagonalFull=[];
	// position values
	for (let i=0; i<8; i++) {
		rowFull[i] = true;
		for (let j=0; j<8; j++) {
			columnFull[j] = true;
			if (node.state[i][j] == piece) {
				rowFull[i] = false;
				columnFull[j] = false;
				score += position_vals[i][j];
			} else if (node.state[i][j] == oppPiece) {
				rowFull[i] = false;
				columnFull[j] = false;
				oppScore += position_vals[i][j];
			}
		}
	}

	// stable pieces
	for (let x=0;x<16;x++){
		diagonalFull[x] = true;
		for (let y=0;y<=x;y++){
			var i = x-y;
			if (i < 8 && y < 8){
				if (node.state[i][y] == piece) {
					diagonalFull[i] = false;
				} else if (node.state[i][y] == oppPiece) {
					diagonalFull[i] = false;
				}
			}

		}
	}

	for (let x=0;x<8;x++){
		for (let y=0;y<8;y++){
			if (node.state[x][y] == piece) {
				// Corner piece
				if ((x==0 && y ==0) || (x==7 && y==7) || (x ==0 && y==7) || (x==7 &&y==0)){
					stable++;
				}
				else if (rowFull[x] == true && columnFull[y] == true && diagonalFull[x]== true){
					stable++;
				}
			} else if (node.state[x][y] == oppPiece) {
				if ((x==0 && y ==0) || (x==7 && y==7) || (x ==0 && y==7) || (x==7 &&y==0)){
					oppStable++;
				}
				else if (rowFull[x] == true && columnFull[y] == true && diagonalFull[x]== true){
					oppStable++;
				}
			}			
		}
	}
	return 10* (score - oppScore) + 5*(mobility - oppMobility) + 40*(stable - oppStable);
}

function successor(node, player) {
	let moves = [];
	for (let i=0; i < 8; i++)  {
		for (let j=0; j<8; j++) {
			if (node.state[i][j] == BLANK) {
				var flipped = flipPieces(node.state, i, j, player);
				if (flipped) {
					moves.push({state: flipped, action: [i,j]});
				}
			}
		}
	}
	return moves;
}

function isTerminal(children, node, player) {
	let opponent = successor(node, !player);
	return children.length == 0 && opponent.length == 0;
}

function minimax(node, depth, eval, max, player, alpha, beta) {
	let children = successor(node, player);

	if (depth == 0 || isTerminal(children, node, player)) {
		return {val: eval(node, player), node: node};
	} else if (children.length == 0) {
		// pass current board and change player if no moves for current player
		return minimax(node, depth-1, eval, !max, !player, alpha, beta);
	} else if (max) {
		let maxVal = {val: -Infinity, node: null};
		for (let i=0; i < children.length; i++) {
			let cval = minimax(children[i], depth-1, eval, false, !player, alpha, beta);
			if (cval.val > maxVal.val) {
				maxVal = {val: cval.val, node: children[i]};
			}
			if (maxVal.val >= beta) return maxVal;
			alpha = Math.max(alpha, maxVal.val);
		}
		return maxVal;
		
	} else {
		let minVal = {val: Infinity, node: null};
		for (let i=0; i < children.length; i++) {
			let cval = minimax(children[i], depth-1, eval, true, !player, alpha, beta);
			if (cval.val < minVal.val) {
				minVal = {val: cval.val, node: children[i]};
			}
			if (minVal.val <= alpha) return minVal;
			beta = Math.min(beta, minVal.val);
		}
		return minVal;
	}
}

function simpleMinimax(board, player) {
	let rootNode = {state: cloneBoard(board), action: null};
	minimaxMoves = [];

	var depth = blankSpaces(board) > 7 ? 5 : Infinity;

	let maxVal = minimax(rootNode, depth, evalWithMobilityAndStability, true, player, -Infinity, Infinity);
	return maxVal.node.action != null ? maxVal.node : false;
}