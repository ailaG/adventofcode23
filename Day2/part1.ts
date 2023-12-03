// Assuming good input ffs

import { getInput } from './helpers.mjs';

class Game {
	id?: string
	sets: GameSet[] = []
}
class GameSet { // eg [blue:1,green:2]
	count: number
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

const input = getInput('./input1.txt').split('\n');
const test = { 'red': 12, 'green': 13, 'blue': 14 }

function testColorAgainstGame(testColorsData, game:Game):boolean|number {
	try {
		game.sets.forEach(set => {
			// loop over the parts of the game, eg "6 red, 1 blue, 3 green;"
			Object.entries(set) // eg [[red,1],[blue,2]]
				.forEach(gameColorData => {
					const testColor = gameColorData[0];
					const testValue = Number(testColorsData[testColor]);
					const gameValue = Number(gameColorData[1]);
					if (testValue < gameValue) {
						throw new Error('game failed');
					}
				}
			)
		});
		return Number(game.id);
	} catch(err) {
		if (err != 'Error: game failed')
			console.log('wtf, errored on ', err);
		return false;
	}
}

let res=0;
const games = processInput(input);

games.forEach(game =>{
	const isPossible:boolean|number = testColorAgainstGame(test, game);
	if (isPossible) {
		res+= Number(game.id);
	}
})

console.log('Result: ', res);