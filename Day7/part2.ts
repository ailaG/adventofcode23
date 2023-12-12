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
	readonly jokersCount: number;

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
		this.jokersCount = this.groups['J'] || 0;
	}
}


// CUSTOM ORDERING
const cardLabelsOrder = 
	['J']
	.concat(new Array(8).fill('')
		.map((dummy, ind) => String(ind + 2))
	)
	.concat(['T', 'Q', 'K', 'A']);


function compareCards(c1:string, c2:string):number {
	// output ready for arr.filter(). neg / 0 / pos
	return cardLabelsOrder.indexOf(c2) - cardLabelsOrder.indexOf(c1);
}

const testsOrder: ((hand:Hand)=>boolean)[] = [
	/* High Card */ (hand) => (hand.groupTuples.length == 5), // because this is part 2 i'm assuming no new tests
	NOfAKind(2),
	/* 2 pairs */ (hand) => {
		const cardsWithoutJokers = hand.groupTuples.filter(g=>g[0] != 'J'), // groups
			jokersInHand = hand.jokersCount;
		if (jokersInHand >= 2) return true; // XYZJJ or better
		if (jokersInHand == 0) return (cardsWithoutJokers.filter(g=>g[1]>=2).length >= 2);
		if (jokersInHand == 1) return (cardsWithoutJokers.some(g=>g[1]>=2)); // At least one pair, then take any other and add the joker
		throw 'how did I get here?';
	},
	NOfAKind(3),
	/* Full House */ (hand) => {
		const cardsWithoutJokers = hand.groupTuples.filter(g=>g[0] != 'J'); // groups
		
		if (cardsWithoutJokers.length > 1 && cardsWithoutJokers.some( g => g[1] > 3))
			return false;
		if (cardsWithoutJokers.length >= 3)
			return false; // We have 3! So it's XYZ**
				
		return true;
	},
	NOfAKind(4),
	NOfAKind(5),
]


// HELPER FUNCTIONS
function NOfAKind(n:number) {
	// generates a FUNCTION (e.g. 4 of a kind == NOfAKind(4))
	// In part 2 checks if we have AT LEAST N of a kind. And no "amount" parm bc it's done separately
	return (hand:Hand):boolean => {
		// theoretically good for the class, but we're sorting by them so :shrug:
		const jokersCount = hand.jokersCount;
		if (jokersCount >= n) return true;
		const passing = hand.groupTuples.filter(c => c[0] !== 'J')
			.filter( c => c[1] + jokersCount >= n )
		return (passing.length > 0);
	}
}

function tieBreaker(gameResult1, gameResult2):number {
	let cards1 = gameResult1.hand.cardsUnsorted, cards2 = gameResult2.hand.cardsUnsorted;
	let compResult:number;

	for (let cardInd=0; cardInd<cards1.length; cardInd++) { // could also be a recursion
		compResult = cardLabelsOrder.indexOf(cards2[cardInd]) - cardLabelsOrder.indexOf(cards1[cardInd]);
		if (compResult != 0)
			return compResult;
		// else continue to the next index
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
