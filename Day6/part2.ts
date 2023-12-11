// Assuming good input ffs

import { BasicThingClass, getInput } from './helpers.js';

class Race extends BasicThingClass {
	record: number;
	time_limit: number;
	constructor(args={}) {
		super();
		this.setArgs(args);
	}
}

class Prediction extends BasicThingClass {
	run_time: number;
	wait_time: number;
	constructor(args={}) {
		super();
		this.setArgs(args);
	}

	get score() {
		return this.run_time * this.speed;
	}

	get speed() {
		return this.wait_time * 1;
	}
}

function getNumbers(str:string):number[] {
	// Blah: 4 5 6 7 => [4,5,6,7]
	return [
		str.match(/\d+/g)
		?.reduce((acc,cur) => `${acc}${cur}`, '') // THE ONLY DIFFERENCE
	].map(s=>Number(s)) || [];
}

// SETUP
const input = getInput('./input.txt')
	.split('\n');
const [time_limits, records] = input.map(line => getNumbers(line));

const races:Race[] = time_limits.map((time_limit, raceInd) => {
	// how racist
	const record = records.at(raceInd);
	return new Race({time_limit, record});
});


// CALC
// all options are (I could take first and last if computation was hard)
const predictions = races.map(race => {
		const all = Array(race.time_limit + 1).fill('')
			.map((dummy, wait_time) => new Prediction({wait_time, run_time: race.time_limit - wait_time}))
		return { record: race.record, predictions: all };
	})

const recordBreaking = predictions
	.map(race => 
		race.predictions
			.filter(prediction => prediction.score > race.record)
	)


// OUT
const res = recordBreaking.reduce((acc,cur) => acc*= cur.length, 1);
console.log('Result: ', res);

/*
	Now, I was pondering using race.predictions.find(cond) then finding the last and assuming everything in the middle checks out
	Maybe even setting only them out

	While I did, it finished working. Just took a couple of secs :)
*/