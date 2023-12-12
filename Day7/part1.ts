// Assuming good input ffs


import { getInput } from './helpers.js';


// CLASS
class Hand {
	readonly bid: number;
	readonly cards: string[];
	// re ordering cards. Messy but we're messy in AoC huh
	readonly cardsUnsorted: string[]; // bc I noticed we need that at the last minute
	readonly groups;
	readonly groupTuples;

	constructor(cards:string[], bid: number, compareCardsFunc:(a: string, b: string) => number) {
		this.bid = bid;
		
		// Handle cards
		this.cardsUnsorted = cards;
		this.cards = [...cards].sort(compareCardsFunc);
		this.groups = {};
		this.cards.forEach(card => {
			if (!this.groups[card])
				this.groups[card] = 0;
			this.groups[card]++;
		})
		this.groupTuples = Object.entries(this.groups);
	}
}


// CUSTOM ORDERING
const cardLabelsOrder = new Array(8).fill('')
	.map((dummy, ind) => String(ind + 2))
	.concat(['T', 'J', 'Q', 'K', 'A']);


function compareCards(c1:string, c2:string):number {
	// output ready for arr.filter(). neg / 0 / pos
	return cardLabelsOrder.indexOf(c2) - cardLabelsOrder.indexOf(c1);
}

const testsOrder: ((hand:Hand)=>boolean)[] = [
	/* High Card */ (hand) => (hand.groupTuples.length == 5),
	NOfAKind(2),
	/* 2 pairs */ NOfAKind(2,2),
	NOfAKind(3),
	/* Full House */ (hand) => {
		const test2 = NOfAKind(2).call(null, hand);
		const test3 = NOfAKind(3).call(null, hand);
		return (test2 !== false && test3 !== false)
	},
	NOfAKind(4),
	NOfAKind(5),
]


// HELPER FUNCTIONS
function NOfAKind(n:number, amount?:number|undefined) {
	// generates a FUNCTION (e.g. 4 of a kind == NOfAKind(4). 2 pairs == NOfAKind(2,2))
	return (hand:Hand):boolean => {
		// returns the highest card for which there are (n) of, or false if there aren't any
		// theoretically good for the class, but we're sorting by them so :shrug:
		const passing = hand.groupTuples.filter(c => c[1] == n);
		if (passing.length == 0)
			return false;
		if (amount !== undefined)
			if (passing.length != amount)
				return false;
		return true
	}
}

function tieBreaker(gameResult1, gameResult2):number {
	let cards1 = gameResult1.hand.cardsUnsorted, cards2 = gameResult2.hand.cardsUnsorted;
	let compResult:number;

	for (let cardInd=0; cardInd<cards1.length; cardInd++) { // could also be a recursion
		compResult = cardLabelsOrder.indexOf(cards2[cardInd]) - cardLabelsOrder.indexOf(cards1[cardInd]);
		if (compResult != 0)
			return compResult;
	}
	throw 'tiebreaker not solved???'
}


// SETUP
const input = getInput('./input.txt')
	.split('\n')
	.map(line => line.split(' '));
const hands = input.map(line => new Hand(line[0].split(''), Number(line[1]), compareCards));

// GO GO GO
let gameResults = hands.map(hand => {
	const testResults = testsOrder.map(test => test.call(null, hand));
	const win:string = testResults.filter(r => r !== false).pop();
	const winType = testResults.lastIndexOf(win);
	// It says every hand is one type
	return {
		hand,
		winType
	}
})



gameResults = gameResults
	.sort(tieBreaker)
	.sort((r1, r2) => r2.winType - r1.winType);

let res = [...gameResults]
	.reverse()
	.map((result, resultIndex) => result.hand.bid * (resultIndex + 1))
	.reduce((acc,cur) => acc+cur, 0);

// OUT
console.log('Result: ', res);

// YES, all camelCase
