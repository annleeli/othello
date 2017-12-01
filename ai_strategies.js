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

// corners = 5
// edges = 4
// inner = 3
// c-square = 2
// x-square = 1
const position_vals = [[10,-3,5,5,5,5,-3,10],
					   [-3,-5,3,3,3,3,-5,-3],
					   [5,3,3,3,3,3,3,5],
					   [5,3,3,3,3,3,3,5],
					   [5,3,3,3,3,3,3,5],
					   [5,3,3,3,3,3,3,5],
					   [-3,-5,3,3,3,3,-5,-3],
					   [10,-3,5,5,5,5,-3,10]];
	 		   		 
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
	var score = 0;

	for (let i=0; i<8; i++) {
		for (let j=0; j<8; j++) {
			if (node.state[i][j] == piece) {
				score += position_vals[i][j];
			}
		}
	}
	return score;
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

function isTerminal(children) {
	// console.log("terminal")
	return children.length == 0;
}

function minimax(node, depth, eval, max, player, alpha, beta) {
	let children = successor(node, player);

	if (depth == 0 || isTerminal(children)) {
		// let index = minimaxMoves.push(node) - 1;
		let retVal = {val: eval(node, player), node: node};
		// console.log("leaf", retVal);
		return retVal;
	} else if (max) {
		let maxVal = null;
		for (let i=0; i < children.length; i++) {
			let cval = minimax(children[i], depth-1, eval, !max, !player);
			// console.log("max", cval, children[i])
			if (maxVal == null || cval.val > maxVal.val) {
				maxVal = {val: cval.val, node: children[i]};
			}
			if (maxVal.val >= beta) return maxVal;
			alpha = Math.max(alpha, maxVal.val);
		}
		// console.log("max",maxVal, children);
		return maxVal;
	} else {
		let minVal = null;
		for (let i=0; i < children.length; i++) {
			let cval = minimax(children[i], depth-1, eval, !max, !player);
			// console.log("min", cval, children[i])
			if (minVal == null || cval.val < minVal.val) {
				minVal = {val: cval.val, node: children[i]};
			}
			if (minVal.val <= alpha) return minVal;
			beta = Math.min(beta, minVal.val);
		}
		// console.log("min",minVal, children);
		return minVal;
	}
}

function simpleMinimax(board, player) {
	let rootNode = {state: cloneBoard(board), action: null};

	let maxVal = minimax(rootNode, 5, evalCount, true, player, Infinity, -Infinity);
	// console.log("simpleMinimax: ", maxVal);
	// console.log("simpleMinimax", minimaxMoves)
	return maxVal.node.action != null ? maxVal.node : false;
}