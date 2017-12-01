// AI Stratgies return {state: gameboard, action: [i,j]}

// Random Stratgey 
function randomMove(board, player) {
	var allMoves = getPossibleMoves(board, player);
	if (allMoves.moves.length == 0) return false;

	var randMove = getRandomInt(0, allMoves.moves.length-1);
	console.log(allMoves, randMove);
	return allMoves.moves[randMove];
}


// minimax algo
const position_vals = [[120,-20,20,5,5,20,-20,120],
					   [-20,-40,-5,-5,-5,-5,-40,-20],
					   [20,-5,15,3,3,15,-5,20],
					   [5,-5,3,3,3,3,-5,5],
					   [5,-5,3,3,3,3,-5,5],
					   [5,-5,3,3,3,3,-5,5],
					   [5,-5,3,3,3,3,-5,5],
					   [20,-5,15,3,3,15,-5,20],
					   [120,-20,20,5,5,20,-20,120]]


	 		   		 
let minimaxMoves = [];

class MMNode {
	constructor(state, action) {
		this.state = state;
		this.action = action;
	}
}


function evalCount(node, player) {
	// console.log("evalCount", node)
	var piece = getPlayerPiece(player);
	var oppPiece = getOpponentPiece(player);
	var score = 0;
	var oppScore = 0;


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
	return score - oppScore;
}

function sortedIndex(array, value) {
    var low = 0,
        high = array.length;

    while (low < high) {
        var mid = (low + high) >>> 1;
        if (array[mid] < value) low = mid + 1;
        else high = mid;
    }
    return low;
}

function successor(node, player) {
	// console.log("successor", node);
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
	// console.log("terminal")
	let opponent = successor(node, !player);
	return children.length == 0 && opponent.length == 0;
}

function minimax(node, depth, eval, max, player, alpha, beta) {
	let children = successor(node, player);

	if (depth == 0 || isTerminal(children, node, player)) {
		// let index = minimaxMoves.push(node) - 1;
		let retVal = {val: eval(node, player), node: node};
		// console.log("leaf", retVal);
		return retVal;
	} else if (children.length == 0) {
		// pass current board and change player if no moves for current player
		return minimax(node, depth-1, eval, !max, !player);
	} else if (max) {
		let maxVal = {val: -Infinity, node: null};
		let cvals = []
		for (let i=0; i < children.length; i++) {
			let cval = minimax(children[i], depth-1, eval, !max, !player);
			cvals.push(cval)
			// console.log("max", cval, children[i])
			if (cval.val > maxVal.val) {
				maxVal = {val: cval.val, node: children[i]};
			}
			if (maxVal.val >= beta) return maxVal;
			alpha = Math.max(alpha, maxVal.val);
		}
		return maxVal;
		// console.log("max",maxVal, children, cvals);
		
	} else {
		let minVal = {val: Infinity, node: null};
		let cvals = []
		for (let i=0; i < children.length; i++) {
			let cval = minimax(children[i], depth-1, eval, !max, !player);
			// console.log("min", cval, children[i])
			cvals.push(cval)
			if (cval.val < minVal.val) {
				minVal = {val: cval.val, node: children[i]};
			}
			if (minVal.val <= alpha) return minVal;
			beta = Math.min(beta, minVal.val);
		}
		// console.log("min",minVal, children, cvals);
		return minVal;
	}
}

function simpleMinimax(board, player) {
	let rootNode = {state: cloneBoard(board), action: null};

	let maxVal = minimax(rootNode, 4, evalCount, true, player, -Infinity, Infinity);
	// console.log("simpleMinimax: ", maxVal);
	// console.log("simpleMinimax", minimaxMoves)
	return maxVal.node.action != null ? maxVal.node : false;
}