// ######################### GAMEBOARD MODULE #########################

const gameboard = (function() {
	// initialize data
	maxGrid = {'x':3, 'y':3};
	let playerUp;

	// get DOM elements
	const gameboard = document.querySelector('.gameboard');
	const button = document.querySelector('.newGameBtn');
	const radios = document.querySelectorAll('.newGameRadio--radio')

	// add event listeners
	button.addEventListener('click', () => newGame() )

	function _render() {
		while(gameboard.firstElementChild){
			gameboard.removeChild(gameboard.firstElementChild)
		}
		for (let y = 0; y < maxGrid.y; y++){
			for (let x = 0; x < maxGrid.x; x++){
				const square = document.createElement('div')
				square.classList.add('gameboard__square')
				if(x===1){square.classList.add('border-h')}
				if(y===1){square.classList.add('border-v')}
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
			grid[x][y] = playerUp
			_render()
			playerUp = playerUp === 'O' ? 'X' : 'O'
			events.emit("makeMove", playerUp)
			checkedWin = checkWin()
			if (checkedWin !== undefined) { handleWin(checkedWin) }
			else if (checkTie() === true) { handleTie() }
		}
	}

	function checkWin(){
		// checks for three in a row and returns the winning squares and the winning player
		let countX = 0;
		let countO = 0;
		let Osquares = [];
		let Xsquares = [];

		// horizontal
		for (let y = 0; y < maxGrid.y; y++){
			for (let x = 0; x < maxGrid.x; x++){
				if (grid[x][y] === 'O') { countO++; Osquares.push({x,y}) }
				else if (grid[x][y] === 'X') { countX++; Xsquares.push({x,y}) }
			}
			if (countO === 3) { return {'squares': Osquares, 'winner': 'O'} }
			else if (countX === 3) { return {'squares': Xsquares, 'winner': 'X'} }
			countX = 0;
			countO = 0;
			Osquares = [];
			Xsquares = [];
		}

		// vertical
		for (let x = 0; x < maxGrid.x; x++){
			for (let y = 0; y < maxGrid.y; y++){
				if (grid[x][y] === 'O') { countO++; Osquares.push({x,y}) }
				else if (grid[x][y] === 'X') { countX++; Xsquares.push({x,y}) }
			}
			if (countO === 3) { return {'squares': Osquares, 'winner': 'O'} }
			else if (countX === 3) { return {'squares': Xsquares, 'winner': 'X'} }
			countX = 0;
			countO = 0;
			Osquares = [];
			Xsquares = [];
		}

		// diagonal
		if 			(grid[0][0] === 'O' && grid[1][1] === 'O' && grid[2][2] === 'O') { return {'squares': [{x:0,y:0},{x:1,y:1},{x:2,y:2}], 'winner': 'O'} }
		else if (grid[0][0] === 'X' && grid[1][1] === 'X' && grid[2][2] === 'X') { return {'squares': [{x:0,y:0},{x:1,y:1},{x:2,y:2}], 'winner': 'X'} }
		else if (grid[2][0] === 'O' && grid[1][1] === 'O' && grid[0][2] === 'O') { return {'squares': [{x:2,y:0},{x:1,y:1},{x:0,y:2}], 'winner': 'O'} }
		else if (grid[2][0] === 'X' && grid[1][1] === 'X' && grid[0][2] === 'X') { return {'squares': [{x:2,y:0},{x:1,y:1},{x:0,y:2}], 'winner': 'X'} }
	}

	function checkTie(){
		for (let y = 0; y < maxGrid.y; y++){
			for (let x = 0; x < maxGrid.x; x++){
				if (grid[x][y] === null){ return false }
			}
		}
		return true
	}

	function handleWin(win) {
		for (square of win.squares){
			const squareEl = document.querySelector(`[data-x='${square["x"]}'][data-y='${square["y"]}']`);
			squareEl.classList.add('win')
		}
		events.emit("win", win.winner)
		gameboard.removeEventListener('click', makeMove)
	}

	function handleTie() {
		alert('Tie!')
		gameboard.removeEventListener('click', makeMove)
	}

	function newGame() {
		radios.forEach(radio => {
			if (radio.checked) {
				playerUp = radio.value
			}
		})
		grid = new Array(maxGrid.x).fill(null).map(() => new Array(maxGrid.y).fill(null));
		gameboard.addEventListener('click', makeMove)
		_render();
		setTimeout(function(){ events.emit("newGame", playerUp) }, 0);
	}

	// initialize
	newGame()

	// expose methods
	return {
		makeMove,
	}
})();


// ######################### PLAYERS FACTORY #########################
const player = (name) => {
	let state = {
		name,
		wins: 0,
	}

	const winner = (state) => ({
		win: () => ++state.wins,
		getWins: () => state.wins,
	})

	const person = (state) => ({
		sayName: () => state.name,
		changeName: (newName) => state.name = newName,
	})

	return Object.assign(
		{},
		winner(state),
		person(state),
	)
}


// ######################### PLAYERS MODULE #########################
let playersModule = (function () {

	// cache DOM
	const player1El = document.querySelector('.players__1--input');
	const player2El = document.querySelector('.players__2--input');

	// create the two initial players
	players = {
		'player1': Object.create(player(`${player1El.value}`)),
		'player2': Object.create(player(`${player2El.value}`)),
	}

	// add event listeners
	player1El.addEventListener('keyup', updateName)
	player2El.addEventListener('keyup', updateName)

	// update the player's name everywhere when the text field is changed
	function updateName(e){
		players[`${e.target.id}`].changeName(`${e.target.value}`)
		events.emit("nameChanged", {"player": e.target.id, "newName": e.target.value})
	}

})();


// ######################### SCOREBOARD MODULE #########################
let stats = (function () {

	let statsCount1 = document.querySelector('.statsModule__1--count');
	let statsCount2 = document.querySelector('.statsModule__2--count');

	events.on("win", updateScore)
	function updateScore(winner){
		winner === 'O' ? players.player1.win() : players.player2.win()
		_render()
	}

	function _render() {
		statsCount1.innerHTML = players.player1.getWins()
		statsCount2.innerHTML = players.player2.getWins()
	}

})();


// ######################### TURN MODULE #########################
let turn = (function () {
	const turnEl = document.querySelector('.turn');
	let turnName;
	let playerUp;

	function _render() {
		turnEl.innerText = playerUp
	}

	events.on("makeMove", updateTurn)
	events.on("newGame", updateTurn)
	function updateTurn(player){
		if (player === 'O'){
			playerUp = players.player1.sayName()
			turnName = 'O'
		}
		else{
			playerUp = players.player2.sayName()
			turnName = 'X'
		}
		_render(playerUp)
	}

	events.on("nameChanged", updateName)
	function updateName(value)
	{
		if (value.player === 'player1' && turnName === 'O'){
			playerUp = players.player1.sayName()
		}
		else if (value.player === 'player2' && turnName === 'X'){
			playerUp = players.player2.sayName()
		}
		_render()
	}

})();