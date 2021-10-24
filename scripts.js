const gameboard = (function() {
	// initialize data
	maxGrid = {'x':3, 'y':3};
	grid = new Array(maxGrid.x).fill(null).map(() => new Array(maxGrid.y).fill(null));
	let player = 'O'

	// get DOM elements
	const gameboard = document.querySelector('.gameboard');
	const button = document.querySelector('.newGameBtn');

	// add event listeners
	button.addEventListener('click', () => newGame() )
	gameboard.addEventListener('click', makeMove)

	function _render() {
		while(gameboard.firstElementChild){
			gameboard.removeChild(gameboard.firstElementChild)
		}
		for (let y = 0; y < maxGrid.y; y++){
			for (let x = 0; x < maxGrid.x; x++){
				const square = document.createElement('div')
				square.classList.add('gameboard__square')
				square.dataset.x = x
				square.dataset.y = y
				if (grid[x][y] === 'X') square.innerText = 'X'
				else if (grid[x][y] === 'O') square.innerText = 'O'
				gameboard.appendChild(square);
			}
		}
	}

	function makeMove(value) {
		let x;
		let y;

		if (typeof value === 'number') {
			if (value < 10) { x = 0; y = value}
			else { x = value.toString()[0]; y = value.toString()[1] }
		}

		else {
			x = value.target.dataset.x
			y = value.target.dataset.y
		}

		if (grid[x][y] === null){
			grid[x][y] = player
			_render()
			player = player === 'O' ? 'X' : 'O'
			if (checkWin() !== undefined) { handleWin(checkWin()) }
			else if (checkTie() === true) { handleTie() }
		}
	}

	function checkWin(){
		// checks for three in a row
		let countX = 0;
		let countO = 0;

		// horizontal
		for (let y = 0; y < maxGrid.y; y++){
			for (let x = 0; x < maxGrid.x; x++){
				if (grid[x][y] === 'O') { countO++ }
				else if (grid[x][y] === 'X') { countX++ }
			}
			if (countO === 3) { return 'O' }
			else if (countX === 3) { return 'X' }
			countX = 0;
			countO = 0;
		}

		// vertical
		for (let x = 0; x < maxGrid.x; x++){
			for (let y = 0; y < maxGrid.y; y++){
				if (grid[x][y] === 'O') { countO++ }
				else if (grid[x][y] === 'X') { countX++ }
			}
			if (countO === 3) { return 'O' }
			else if (countX === 3) { return 'X' }
			countX = 0;
			countO = 0;
		}

		// diagonal
		if 			(grid[0][0] === 'O' && grid[1][1] === 'O' && grid[2][2] === 'O') { return 'O' }
		else if (grid[0][0] === 'X' && grid[1][1] === 'X' && grid[2][2] === 'X') { return 'X' }
		else if (grid[2][0] === 'O' && grid[1][1] === 'O' && grid[0][2] === 'O') { return 'O' }
		else if (grid[2][0] === 'X' && grid[1][1] === 'X' && grid[0][2] === 'X') { return 'X' }
	}

	function handleWin(winner) {
		alert(winner + ' wins!')
		gameboard.removeEventListener('click', makeMove)
	}

	function handleTie() {
		alert('Tie!')
		gameboard.removeEventListener('click', makeMove)
	}

	function checkTie(){
		for (let y = 0; y < maxGrid.y; y++){
			for (let x = 0; x < maxGrid.x; x++){
				if (grid[x][y] === null){ return false }
			}
		}
		return true
	}

	function newGame() {
		grid = new Array(maxGrid.x).fill(null).map(() => new Array(maxGrid.y).fill(null));
		gameboard.addEventListener('click', makeMove)
		_render();
	}

	// initialize DOM
	_render();

	// expose methods
	return {
		makeMove,
	}
})();