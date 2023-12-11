import { couldStartTrivia } from 'typescript';
import { getInput, trim } from './helpers.js';
import { toUSVString } from 'util';

function typesToString(type1:string, type2:string):string {
	[type1, type2] = [type1, type2].map(s=>s.replace('_','-')); // why not
	return `TYPESTR_${type1}_${type2}`
}

type range = {start:number, end:number}

function rawNumsToRange(start:number, range:number):range {
	return {start, end: start+range -1 }
}

// INPUT
let input = getInput('./input-example.txt')
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
		// conversions[key].sources.push(rawNumsToRange(sourceStart, rangeSize)),
		// conversions[key].targets.push(rawNumsToRange(targetStart, rangeSize))
		conversions[key].push({
			source: rawNumsToRange(sourceStart, rangeSize),
			target: rawNumsToRange(targetStart, rangeSize)
		})
	} 

}


console.log("START CONVERTING"); 

function checkSingleConversion ( idRange:range, conversion ): {before?:range, match?:range, after?:range }|false  {
	const {source, target} = conversion;
	let result = {}

	let targetStartInd, targetEndInd;
	if (source.start > idRange.end || idRange.start > source.end) {
		// not in range
		return false;
	}
	
	const matchSource:range, matchTarget:range;

	if (idRange.start <= source.start) {
		//targetStartInd = 0;
		
	} else {
		targetStartInd = idRange.start - source.start;
	}

	if (source.end <= idRange.end) {
		targetEndInd = source.end - source.start
	} else {
		targetEndInd = idRange.end - source.start
	}

	if (targetEndInd < targetStartInd) {
		console.log('whoops wait what', targetStartInd,'->', targetEndInd);
	//	throw ''
	}

	// const matchSource = {
	// 	start: source.start + targetStartInd,
	// 	end: source.end + targetEndInd
	// }

	// const matchTarget = {
	// 	start: target.start + targetStartInd,
	// 	end: target.start + targetEndInd
	// }

	// split the IDs to 3: idRange.start ... matchSource.start ... matchSource.end ... idRange.end
	//	and convert the middle one


	if (idRange.start < matchSource.start) // && matchSource.start < idRange.end) {
		result['before'] = { start: idRange.start, end: matchSource.start - 1 }

	if (matchSource.start <= matchSource.end)
		result['match'] = matchTarget;

	if (matchSource.end < idRange.end) 
		result['after'] = { start: matchSource.end + 1, end: idRange.end }
	
	console.log('XXXXXX',result,idRange, source, targetStartInd, targetEndInd);
	return result;
}


// Convert the ranges! Sources -> Targets
function getConvertedValues(idRange:range, conversions):range[] {
	let results:range[] = [];
	//let carries:range[] = []
	
	conversions.forEach((conversion):void => {
		//let newCarries:range[] = [];
		let carry:range|null = null
		console.log('checking conv',conversion,' for IDs:', [carry, idRange]);
		
		if (carry !== null) {
			if (carry.end >= idRange.end) {
				// don't overlap
				carry.end = idRange.end - 1;
				if (carry.end < carry.start)
					carry = null
			}
			// if (carry.end < idRange.start) {
			// 	// it was in the prev one, and 
			// }
		}

		[carry, idRange].forEach(idRange => {
			if (idRange == null)
				return;
			const cross = checkSingleConversion(idRange, conversion);
			console.log('XX cross ids',idRange,'conv source',conversion.source,'res',cross);
			if (cross === false) {
				if (idRange.end < conversion['source'].start)
					results.push(idRange);
				else 
					carry = idRange;
				return;
			}
			if (cross['before'] !== undefined)
				carry = cross['before'];
				//console.log('before = not included', carry);
			if (cross['match'])
				results.push(cross['match']);
			if (cross['after']) {
				carry = cross['after'];
			}
			//if ((carry !== null && carry.end == 0) || results.at(-1).end == 0)
			//	throw '';
			for (let result in results) if (result.end == 0) throw '';
			console.log('tmp results', results, 'carry', carry)
		});
		//carries = newCarries;
		if (carry !== null)
			results.push(carry);
		console.log('NOW CARRY IS', carry, 'RESULTS', results);
	});
	//console.log('carries final',carries);
	//results = results.concat(carries);
	results = results.sort((r1, r2) => r1.start - r2.start);

	console.log('XXXX cross res', results);
	//if (results[0].start == 0) throw '';
	return results; 

}

const typesKeys = typesOrder.slice(0, -1)
	.map((value, index) => typesToString(value, typesOrder[index+1]))

let results=[];
let currIds:range[] = seeds;
typesKeys.forEach(key => {
	if (typesToString('soil', 'fertilizer') == key) throw '';
	let currConversions = conversions[key];
	currConversions.sort((c1, c2) => c1.source.start - c2.source.start);
	currIds.sort((c1:range, c2:range) => c1.start - c2.start);
	console.log('KEY', key);
	let mapping:range[] = currIds.map(sourceIds => {
			return getConvertedValues(sourceIds, currConversions)
		})
		.reduce((acc,cur)=>acc.concat(cur), [])
	currIds = mapping;
	console.log('=====done with',key, currIds);
	console.log('=============================')
	console.log('WAS', [...mapping].sort((a,b) => a.start - b.start));
	results = mapping;
//	console.log('should be 57-69 81-94')
//	throw '';
});

console.log('results', results);
console.log('result!!', results[0]['start']);
console.log('test!!', results[1]['start']);


//console.log('final result', Math.min(...results))

// input is ranges. they CANT overlap. sources can't either.
// therefore we need to cast the sources upon the input
// split each INPUT by source