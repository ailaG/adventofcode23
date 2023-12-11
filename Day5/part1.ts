import { getInput, trim } from './helpers.js';

function typesToString(type1:string, type2:string):string {
	[type1, type2] = [type1, type2].map(s=>s.replace('_','-')); // why not
	return `TYPESTR_${type1}_${type2}`
}

function rawNumsToRange(start:number, range:number):{start:number, range:number, end:number} {
	return {start, range, end: start+range+1}
}

// INPUT
let input = getInput('./input.txt')
	.split('\n')

const typesOrder = ['seed', 'soil', 'fertilizer', 'water', 'light', 'temperature', 'humidity', 'location'];

let seeds: number[] = []
let conversions = {} // key: types hash, val: array of range arrays eg [[10,11], [20,21,22]]
let state = {
	from: '',
	to: '',
	source: []
}


while (input.length > 0) {
	const line = input.shift();
	// unhandled blank lines
	if (line == undefined || line == '') continue;

	// Seeds
	if (line.startsWith('seeds: ')) {
		const seedsStr = line.split(':').at(-1);
		if (!seedsStr)
			throw 'Bad seed line!' + line + 'was split to' + String(seedsStr);
		seeds = seedsStr.trim()
			.split(' ')
			.map(s=>Number(s));
		continue;
	}

	if (!line.includes('map:')) 
		throw `Could not read input line ${line}`;

	// now handle maps
	[state.from, state.to] = line
		.replace(' map:', '') // eg 'seeds-to-soil'
		.split('-')
		.map(trim)
		.filter(s=>s!='to') // eg ['seeds', 'soil']
	const key = typesToString(state.from, state.to);
	conversions[key] = {sources:[], targets:[]};
	if (!state.from || !state.to)
		throw 'currResources bad!' + state.valueOf();

	let mapLine:string|undefined;
	while ((mapLine = input.shift()) && mapLine.length > 0) {
		// I could also put this in the main loop but it's upgrade bug prone
		const [targetStart, sourceStart, range] = mapLine
			.split(' ')
			.map(n=>Number(n));
		conversions[key].sources.push(rawNumsToRange(sourceStart, range)),
		conversions[key].targets.push(rawNumsToRange(targetStart, range))
	} 

}


// Convert the ranges! Source -> Target
function convert(id, fromType, toType, conversions):number {
	const key = typesToString(fromType, toType);
	const sources = [...conversions[key].sources];
	const targets = [...conversions[key].targets];

	for (let ind=0; ind<sources.length; ind++) {
		let currSource = sources[ind], 
			currTarget = targets[ind];
		if (currSource.start <= id && id <= currSource.end) {
			return currTarget.start + (id - currSource.start);
		}
	}


	return id;
}

let toProcess = typesOrder.slice(0, -1)
	.map((value, index) => [value, typesOrder[index+1]]);

state.source = seeds;

while (toProcess.length > 0) {
	const [from, to] = toProcess.shift();
	const targetRanges = state.source.map(seed => {
		return convert(seed, from, to, conversions)
	})
	state.source = targetRanges;
}

console.log('results',state.source);

console.log('final result', Math.min(...state.source))