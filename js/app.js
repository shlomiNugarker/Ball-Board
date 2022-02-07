var WALL = 'WALL';
var FLOOR = 'FLOOR';
var BALL = 'BALL';
var GAMER = 'GAMER';
var GLUE = 'GLUE';

var GAMER_IMG = '<img src="img/gamer.png" />';
var BALL_IMG = '<img src="img/ball.png" />';
var GLUE_IMG = '🧲'

var sound = new Audio('sound/pop.mp3')

var gBoard;
var gGamerPos;
var intervalId;
var intervalId2;
var allCurrBalls;
var currBalls;
var isStepOnGlue = false;
var lastGluePos = []


function addBall() {
	var i = getRandomInt(1, 8)
	var j = getRandomInt(1, 10)
	var randCell = {i: i, j: j}
	if(randCell.i === gGamerPos.i && randCell.j === gGamerPos.j) return;
	gBoard[randCell.i][randCell.j].gameElement = BALL;
	currBalls++;
	renderCell(randCell, BALL_IMG);
}

function addGlue() {
	if(lastGluePos[0]) {
		currGlue = lastGluePos[lastGluePos.length-1]
		gBoard[currGlue.i][currGlue.j].gameElement = null
		renderCell(lastGluePos[lastGluePos.length-1], '')
		lastGluePos.pop();
	}
	var i = getRandomInt(1, 8)
	var j = getRandomInt(1, 10)
	var randCell = {i: i, j: j}
	lastGluePos.push(randCell)
	if(randCell.i === gGamerPos.i && randCell.j === gGamerPos.j) return;
	gBoard[randCell.i][randCell.j].gameElement = GLUE;
	renderCell(randCell, GLUE_IMG);


}

function initGame() {
	gGamerPos = { i: 2, j: 9 };
	gBoard = buildBoard();
	renderBoard(gBoard);
	allCurrBalls = 0;
	currBalls = 2;
	document.querySelector('.score').innerHTML = allCurrBalls;
	document.querySelector('.game-over').innerText = ''
	document.querySelector('.restart').style.display = 'none';
	intervalId = setInterval(addBall, 4000)
	intervalId2 = setInterval(addGlue, 5000)
	
}

function buildBoard() {
	// Create the Matrix
	var board = createMat(10, 12)

	// Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			// Put FLOOR in a regular cell
			var cell = { type: FLOOR, gameElement: null };

			// Place Walls at edges
			// if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
			// 	cell.type = WALL;
			// }
			if((i === 0  && j !== 5) || (j === 0 && i !== 4) || (i === 9 && j !== 5) || (i !== 4 && j === 11)  ) {
				cell.type = WALL
			}

			// Add created cell to The game board
			board[i][j] = cell;
		}
	}

	// Place the gamer at selected position
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

	// Place the Balls (currently randomly chosen positions)
	board[3][8].gameElement = BALL;
	board[7][4].gameElement = BALL;

	return board;
}

// Render the board to an HTML table
function renderBoard(board) {

	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];

			var cellClass = getClassName({ i: i, j: j })

			// TODO - change to short if statement
			// if (currCell.type === FLOOR) cellClass += ' floor';
			// else if (currCell.type === WALL) cellClass += ' wall';

			cellClass += currCell.type === FLOOR? ' floor': ' wall';

			//TODO - Change To template string
			// strHTML += '\t<td class="cell ' + cellClass +'"  onclick="moveTo(' + i + ',' + j + ')" >\n';

			strHTML += `\t<td class="cell ${cellClass}" onclick="moveTo(${i},${j})">`	

			// TODO - change to switch case statement
			// if (currCell.gameElement === GAMER) {
			// 	strHTML += GAMER_IMG;
			// } else if (currCell.gameElement === BALL) {
			// 	strHTML += BALL_IMG;
			// }

			switch(currCell.gameElement) {
				case GAMER:
					strHTML += GAMER_IMG;
					break;
				case BALL:
					strHTML += BALL_IMG;
					break;
			}

			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';
	}

	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {
	if(isStepOnGlue) return

	console.log(i, j);
	if(i === -1) i =  9
	if(j === 12) j = 0
	if(i === 10) i = 0
	if(j === -1) j = 11


	var targetCell = gBoard[i][j];
	if (targetCell.type === WALL) return;

	// Calculate distance to make sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	var jAbsDiff = Math.abs(j - gGamerPos.j);

	// If the clicked Cell is one of the four allowed
	// if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {
		if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)
		||( iAbsDiff === 9 || jAbsDiff === 11) || (iAbsDiff === 0) || (jAbsDiff === 0) ) {

		if (targetCell.gameElement === BALL) {
			sound.play()
			allCurrBalls++;
			currBalls--
			document.querySelector('.score').innerHTML = allCurrBalls;
			if(currBalls === 0) {
				console.log('finsh');
				clearInterval(intervalId);
				clearInterval(intervalId2)
				document.querySelector('.restart').style.display = 'block';
				document.querySelector('.game-over').style.display = 'block';
				document.querySelector('.game-over').innerText = 'game over';
			} 
		}
		if (targetCell.gameElement === GLUE) {
			isStepOnGlue = true;
			setTimeout(() => {
				isStepOnGlue = false;
			},3000)
		}

		// MOVING from current position
		// Model:
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
		// Dom:
		renderCell(gGamerPos, '');

		// MOVING to selected position
		// Model:
		gGamerPos.i = i;
		gGamerPos.j = j;
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
		// DOM:
		renderCell(gGamerPos, GAMER_IMG);

	} // else console.log('TOO FAR', iAbsDiff, jAbsDiff);

}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {

	var i = gGamerPos.i;
	var j = gGamerPos.j;

	switch (event.key) {
		case 'ArrowLeft':
			moveTo(i, j - 1);
			break;
		case 'ArrowRight':
			moveTo(i, j + 1);
			break;
		case 'ArrowUp':
			moveTo(i - 1, j);
			break;
		case 'ArrowDown':
			moveTo(i + 1, j);
			break;

	}


}

// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}

