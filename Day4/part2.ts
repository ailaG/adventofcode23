// Assuming good input ffs

import { BasicThingClass, getInput, trim } from './helpers.js';

class Card extends BasicThingClass {
	hits: Card[]; // CHANGED FROM P1
	num_cards_added: number|null = null;
	constructor(args: {
			id: number,
			have: number[],
			winning: number[]
		}) {
		super(args)
		this.calculateHits();
	}
	calculateHits() {
		this.hits =
			this.winning
				.filter(val => this.have.includes(val))
		return this.hits.length;
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

const base_deck = input.map(line =>
	parseInputLine(line)
)

function howMuchIsCardAdding(card):number {
	if (card.num_cards_added != null) {
		return 1 + card.num_cards_added; // 1 = itself
	} else if (card.hits.length == 0) {
		return 1; // itself
	} else {
		const nexts = base_deck.slice(card.id, card.id + card.hits.length);
		const addToDeckCount = nexts
			.map(card => howMuchIsCardAdding(card))  // R E C U R S I O N
			.reduce((p,c) =>p+c, 0);
		card.num_cards_added = addToDeckCount;
		return addToDeckCount + 1;
	}
}

const res = base_deck
	.map(card=>howMuchIsCardAdding(card))
	.reduce((p,c)=>p+c,0);

console.log('Result: ', res);
	
////////////////////
// NAIVE APPROACH //
////////////////////
// Of course I started with that. Want to see my code for it?
// Works fine, but its complexity is too high so the actual input takes too long.

/*

// LETS PLAY

let stack_length = stack.length;
for (let stack_ind=0; stack_ind < stack.length; stack_ind++) {
	const curr = stack[stack_ind];
	if (curr.num_cards_added !== null)
		stack_length += curr.num_cards_added;
	else {
	
		const num_wins = curr.hits.length;
		console.log('processing', curr.id);
		for (let delta=1; delta <= num_wins; delta++) {
			const currInd = String(Number(curr.id) + delta);
			stack.push({...cardDict[currInd]})
			console.log('pushed ', currInd, 'delta', delta, 'card', cardDict[currInd]);
		}
	}
}
*/
//const res = stack_length;
//console.log('Result: ', res);