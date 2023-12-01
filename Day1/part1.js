// Assuming good input ffs

import { getInput } from './helpers.mjs';

const input = getInput('./input1.txt').split('\n');

console.log('Input:',input);

console.log (
	input	.map(line => line.match(/[\d]/g).join(''))
			.map(line=> Number(String(line.at(0)) + String(line.at(-1))) )
			.reduce((sofar,curr) => sofar+curr)
);