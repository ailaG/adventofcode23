// Assuming good input ffs

import { getInput } from './helpers.mjs';

class Game {
	id?: string
	sets: GameSet[] = []
}
class GameSet { // eg [blue:1,green:2]
	blue: number = 0
	green: number = 0
	red: number = 0
}


function processInput(raw_input_arr:string[]):Game[] {
	const trim = s=>s.trim();
	const processLine = (rawLine:string):Game => {
		const game = new Game();
		game.id = rawLine.substring('Game '.length, rawLine.indexOf(':'));
		game.sets = rawLine.substring(rawLine.indexOf(':')+1)
			.split(';').map(trim)
			.map(line=>processSet(line));
		return game;
	}
	const processSet = (rawSet:string):GameSet => {
		const gameSet:GameSet = new GameSet()
		rawSet.split(',').map(trim)
			.forEach(color_raw => {
				const [count, color] = color_raw.split(' ').map(trim);
				gameSet[color] = Number(count);
		})
		return gameSet;
	}
	return raw_input_arr
		.map(line => processLine(line));
	
}

const input = getInput('./input.txt').split('\n');
function minimumCubes(game) {
	let res = new GameSet();
	for (const set of game.sets) {
		for (const [color, value] of Object.entries(set)) {
			if (value > res[color])
				res[color] = value;
		}
	}
	return res;
}

function power(set:GameSet):number {
	let res = 1;
	for (const [color, value] of Object.entries(set)) {
		res *= Number(value);
	}
	return res;
}

const games = processInput(input);

// games.forEach(game =>{
// 	const isPossible:boolean|number = testColorAgainstGame(test, game);
// 	if (isPossible) {
// 		res+= Number(game.id);
// 	}
// })

const powers = games
	.map(game => minimumCubes(game))
	.map(minSetForGame => power(minSetForGame))

console.log( 'Result: ',  
	powers.reduce((prev, curr) => prev+curr, 0) 
);