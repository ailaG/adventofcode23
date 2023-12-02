// Assuming good input ffs

import { start } from 'repl';
import { getInput } from './helpers.mjs';

const input = getInput('./input.txt').split('\n');

function getFirstAndLast(line) {
	// AHA they had an overlap!
	const integers = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
	let indices = []; // tuples: [index, value]
	const base = integers.length; // For the heck of it
	integers.concat(new Array(base).fill().map((val,ind)=>ind)) // all our needles, at indices that fit their value when % base
		.forEach((name, index_in_dict) => {
			// name e.g 5 or five
			// index_in_dict eg 8 or 18 for 'eight' or 8
			// value is a number only. '4' for 'four'.
			const value = String(index_in_dict % base);
			const [firstInd, lastInd] = [
				line.indexOf(name),
				line.lastIndexOf(name)
			]
			indices.push([firstInd, value], [lastInd, value]);
		});
	indices = indices.filter(item => Number.isInteger(item[0]) && Number(item[0]) != -1) // remove those it didn't find
	indices.sort((a, b) => a[0] - b[0]);
	return [indices.at(0)[1], indices.at(-1)[1]];
	
}


console.log('Input:',input);

console.log ( 'Result:', 
	input
		.map(line => getFirstAndLast(line).join(''))
			.reduce((sofar,curr) => Number(sofar)+Number(curr))
	)