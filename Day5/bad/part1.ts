// Assuming good input ffs

import { resourceType } from './classes1.js';
import { getInput, trim } from './helpers.js';
import { parseInput } from './inputFuncs1.js';


// INPUT
const input = getInput('./input.txt')
	.split('\n')

parseInput(input);


// while (curr_input.length > 0) {
// 	const line = curr_input.shift();

// }




//console.log('Result: ', res);
