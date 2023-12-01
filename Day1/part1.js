// Assuming good input ffs

import { getInput } from './helpers.mjs';

const input = getInput('./input-example.txt').split('\n');

console.log('Input:',input);


const numbers = input.map(line => line.match(/[\d]/g).join(''))
const sums = numbers.map(line=> Number(String(line.at(0)) + String(line.at(-1))) );
const res = sums.reduce((sofar,curr) => sofar+curr);

console.log(res);