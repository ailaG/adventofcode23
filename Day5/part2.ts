import { getInput, trim } from './helpers.js';


function typesToString(type1:string, type2:string):string {
	[type1, type2] = [type1, type2].map(s=>s.replace('_','-')); // why not
	return `TYPESTR_${type1}_${type2}`
}

type range = {start:number, end:number, range?: number}

function rawNumsToRange(start?:number, range?:number, end?:number):range {
	if (!range)
		range = end - start;
	if (end<start) return false;
	return {start, end: start+range -1 }
}

// INPUT
let input = getInput('./input.txt')
	.split('\n')

const typesOrder = ['seed', 'soil', 'fertilizer', 'water', 'light', 'temperature', 'humidity', 'location'];

let seeds:range[] = [];
let conversions = {} // key: types hash
let state = {
	from:'',
	to:'',
	//source
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
		seeds = seeds.concat(
			seedsStr.trim()
				.match(/([0-9]+ [0-9]+)/g) // pairs
					?.map(pair => {
						const [start, range] = pair.split(' ').map(s=>Number(s));
						return { start, end: start+range - 1 }
					}) || []
		);
		continue;
	}

	if (!line.includes('map:')) 
		throw `Could not read input line ${line}`;

	// now handle maps
	[state['from'], state['to']] = line
		.replace(' map:', '') // eg 'seeds-to-soil'
		.split('-')
		.map(trim)
		.filter(s=>s!='to') // eg ['seeds', 'soil']
	const key = typesToString(state.from, state.to);
	conversions[key] = []//{sources:[], targets:[]};
	if (!state.from || !state.to)
		throw 'currResources bad!' + state.valueOf();
	let mapLine:string|undefined;
	while ((mapLine = input.shift()) && mapLine.length > 0) {
		// I could also put this in the main loop but it's upgrade bug prone
		const [targetStart, sourceStart, rangeSize] = mapLine
			.split(' ')
			.map(n=>Number(n));
		conversions[key].push({
			source: rawNumsToRange(sourceStart, rangeSize),
			target: rawNumsToRange(targetStart, rangeSize)
		})
	} 

}


console.log("START CONVERTING"); 

function convertIds(idRange:range, conversionsR) {
	// assumptions: conversion sources don't overlap
	let conversions = [...conversionsR].sort((c1,c2)=>c1.source.start-c2.source.start);
	let result:range[] = []
	let currIds:range|null = idRange; // I'll eat at its beginning
	let currConversion = null;
	// before source start
	console.log('convert', idRange, conversions.length);
	while (conversions.length > 0) {
		if (!currConversion || !currIds ||  currConversion.source.end < currIds.start)
			currConversion = conversions.shift();
		//if (currIds === null) console.log('currIds null');
		if (currIds === null) continue;
		if (!currConversion) throw 'wat';

		const currSource = currConversion.source;
		
		if (currSource.end < currIds.start) {
			// too small, let's get a higher one
			//console.log('* source end < ids start, skipping');
			continue;
		}
		console.log('doing source',currSource, 'ids', currIds, 'target', currConversion.target);

		if (currSource.start > currIds.end) {
			// source > everything
			// so all remaining ids are identity
			console.log('* source start > ids end, pushing', currIds);
			result.push(currIds);
			if (currIds.end < currIds.start) throw 'wtf end<start';
			currIds = null;
			continue;
		}

		if (currSource.start == currIds.start && currSource.end == currIds.end) {
			console.log('* source > everything, so push  everything', currIds);
			result.push(currIds);
			if (currIds.end < currIds.start) throw 'wtf end<start';
			currIds = null;
			continue;
		}
		
		// now we know that source is inside IDs
		const match:range = { 
			start: currIds.start,
			end: (currSource.end <= currIds.end) ? currSource.end : currIds.end
		}
		const delta = currConversion.target.start - currConversion.source.start;
		console.log('* match',match,  'delta', delta);

		if (match.end < match.start ) throw 'wtf1';
		
		// All the IDs between start and source go as identity
		const before:range = { start: currIds.start, end: match.start - 1 };
		if (before.start <= before.end) {
			result.push(before)
			console.log('* before went in', before)
		}

		// match goes in
		result.push({ start: match.start + delta, end: match.end + delta })
		if (match.end < match.start) {
			console.log('match BAD', match);
			throw '';
		}
		if (match.end == currIds.end) {
			currIds = null;
			continue;
		}
		// find more matches
		currIds.start = match.end + 1;

		// after goes in
		const after:range = { start: match.end + 1, end: currIds.end };
		if (after.start <= after.end) {
			currIds = after;
		} else {
			currIds = null;
		}
	}

	// push remaining IDs after sources are done
	if (currIds !== null) {
		result.push(currIds);
		currIds = null;
	}

	return result
		.filter(e=>e)
		.filter(e => e !== null)

}



const typesKeys = typesOrder.slice(0, -1)
	.map((value, index) => typesToString(value, typesOrder[index+1]))

let results:range[]=[];
let currTypeIds:range[] = seeds;
typesKeys.forEach(key => {
	let currConversions = conversions[key];
	results = [];

	currConversions.sort((c1, c2) => c1.source.start - c2.source.start);
	currTypeIds.sort((c1:range, c2:range) => c1.start - c2.start);

	currTypeIds.forEach((ids:range) => {
		if (currConversions.length == 0) {
			console.log(key);
			throw 'no conversions???'
		}
			const res:range[]|undefined = convertIds(ids, currConversions);
		console.log('processed, got', res);
		if (res)
			results = results.concat(res);
	});
	results = [...results].sort((a,b) => a.start - b.start)
	currTypeIds = results;
});


console.log('results', results);
console.log('result!!', results[0]['start']);


