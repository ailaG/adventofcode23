// Assuming good input ffs

import { BasicThingClass, getInput, trim } from './helpers.js';

class Card extends BasicThingClass {
	constructor(args: {
			id: number,
			have: number[],
			winning: number[]
		}) {
		super(args)
	}
}

function parseInputLine(input:string):Card {
	const [id_raw, data_raw] = input.split(':');
	
	const id:number = Number(
		Number(id_raw.substring('Card '.length))
	)
	const [ winning, have ] = data_raw
		.split('|').map(s=>s.trim()) // ['1 2', '3 4']
		.map(side => side
			.split(' ') // [['1','2'],['3','4']]
			// now go into the items in each side
			.map(trim)
			.filter(a=>a) /// remove dups
			.map(item=>parseInt(item)) // [[1,2], [3,4]]
		);
	const card = new Card({id, have, winning});
	return card
}

// INPUT
const input = getInput('./input.txt')
	.split('\n')


const cards = input.map(line =>
	parseInputLine(line)
)

const scores = cards.map(card => 
	card.winning
		.filter(winner => card.have.includes(winner))
		.reduce((p,c)=>(p==0) ? 1 : p*2, 0) // Or I could avoid the ternary with 0.5 instead of 0 but BUGS and readability
)

const res = scores
	.reduce((p,c)=>p+c,0);



console.log('Result: ', res);
