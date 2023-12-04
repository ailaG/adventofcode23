// Assuming good input ffs

import { getInput } from './helpers.mjs';

class Coord {
	row: number
	col: number
	value: string
	constructor(args={}) {
		for (let key of Object.keys(args)) {
			this[key] = args[key];
		}
	}
}

class GearLike extends Coord { // things that are asterisks
	partsTouching: {
		// key: coordToString(coord)
		// val: coord
	}
	constructor(args) {
		super(args);
		this.partsTouching = {}
	}
}

function getAdjacents(coord:Coord, schematic:string[][]):Coord[] {
	let adjacents:Coord[] = [];
	const schemSize = { height: schematic.length, width: schematic[0].length };
	for (let row = Math.max(0, coord.row -1); row <= Math.min(coord.row+1, schemSize.height-1); row++) {
		for (let col = Math.max(0, coord.col -1); col <= Math.min(coord.col+1, schemSize.width-1); col++) {
			const value = schematic[row][col];
			adjacents.push(new Coord({row,col,value}));
		}
	}
	return adjacents;
}

function isTouchingSymbol(coord:Coord, schematic:string[][]):boolean {
	const not_symbols = [0,1,2,3,4,5,6,7,8,9,'.'].map(i=>String(i)); // writing quotes is HARD
	const adjacents = getAdjacents(coord, schematic);
	const adjacents_valid = adjacents.filter(coord => !( not_symbols.join('').includes(coord.value)) )
	return (adjacents_valid.length > 0);
}

function asterisksTouching(coord:Coord, schematic:string[][]):Coord[] {
	const adjacents = getAdjacents(coord, schematic);
	const adjacents_valid = adjacents.filter(coord => coord.value == '*')
	return adjacents_valid;
}

function coordToStr(coord:Coord):string {
	return `R${coord.row}C${coord.col}`;
}

// INPUT
const input = getInput('./input.txt')
	.split('\n')
	.map(row => row.split(''))

console.log('input is'); console.table(input); console.log('end input');


// PAD
let empty_line = Array(input[0].length + 2).fill('.')
const schematic:string[][] = 
		[ empty_line ]
		.concat([...input].map(row => ['.'].concat(row).concat(['.'])))
		.concat([empty_line]);

const schemSize = { height: schematic.length, width: schematic[0].length };


// GET THE PART NUMS
let parts:string[] = []
let gearLikes = {
	// key: coordToString(coord)
	// val: gear
}

for (let row=0; row < schemSize.height; row++) {
	let accumulator:string=''
	let is_part_num:boolean=false;
	let curr_part_id: string = '';
	let gears_accumulator: Coord[] = [];
	const reset = ():void => {
		accumulator = '';
		curr_part_id = '';
		gears_accumulator = [];
		is_part_num = false;
	}
	reset();
	for (let col=0; col < schemSize.width; col++) {
		const value = schematic[row][col];
		const curr = new Coord({row,col,value});

		if (!isNaN(value)) {
			// number
			accumulator += value;
			if (isTouchingSymbol(curr, schematic)) {
				if (curr_part_id.length == 0)
					curr_part_id = coordToStr(curr);
				is_part_num = true;
				gears_accumulator = gears_accumulator.concat(asterisksTouching(curr, schematic));
			}
		}
		else {
			// Char
			if (accumulator.length > 0) {
				// End of number! (not a number + had a number going)
				if (is_part_num) {
					parts.push(accumulator);
					gears_accumulator.forEach((gearCoord:Coord) => {
						if (!gearLikes[coordToStr(gearCoord)]) gearLikes[coordToStr(gearCoord)] = new GearLike({});
						gearLikes[coordToStr(gearCoord)].partsTouching[coordToStr(curr)] = accumulator;
					})
				}
			}
			reset();
		}	
 
		// I'd add a condition somewhere for end of row, but I padded it instead. No numbers at the end of a row.
		
	}
}


// FINISH UP

let res = Object.values(gearLikes)
	// get the real gears
	.filter(gl => (Object.values(gl.partsTouching).length == 2) )
	// get ratios
	.map(gear => 
		Object.values(gear.partsTouching)
			.reduce((p,c)=> p * Number(c), 1)
	)
	// add up
	.reduce((p,c) => p+c, 0);



console.log('Result: ', res);
