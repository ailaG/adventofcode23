import { getInput, trim } from './helpers.js';

function typesToString(type1:string, type2:string):string {
	[type1, type2] = [type1, type2].map(s=>s.replace('_','-')); // why not
	return `TYPESTR_${type1}_${type2}`
}

type range = {start:number, range?:number, end:number}

function rawNumsToRange(start:number, range:number):range {
	return {start, range, end: start+range -1 }
}

// INPUT
let input = getInput('./input-example.txt')
	.split('\n')

const typesOrder = ['seed', 'soil', 'fertilizer', 'water', 'light', 'temperature', 'humidity', 'location'];

let seeds:range[] = [];
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
		seeds = seeds.concat(
			seedsStr.trim()
				.match(/([0-9]+ [0-9]+)/g) // pairs
					?.map(pair => {
						const [start, range] = pair.split(' ').map(s=>Number(s));
						return { start, range, end: start+range - 1 }
					}) || []
		);
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
console.log('seeds', seeds);

console.log("START CONVERTING"); 

// Convert the ranges! Sources -> Targets
function prepareConversions(ids:range, fromType, toType, conversions):range[]|null {
	const key = typesToString(fromType, toType);
	const sources = [...conversions[key].sources];
	const targets = [...conversions[key].targets];
	//console.log('sources',sources);
	console.log('input to convert',ids)
	const sourcesConverted:range[] = [];
	const residues:range[] = [];

	//let mapped:range[] = [];
	//let is_clean_run = false; // did we do a whole run without using the sources>?
	//let mapped = sources.map((source, sourceInd):range|undefined => {
	//[mapped, residues].forEach((sourcesSet, setId) =>{
//	const convertStep = (sourcesSet:range[], targets:range[], opts:{write_to_mapped:boolean}={}):{mapped:range[], residues:range[]} => {
		// always writes to mapped because the task is taking me too long
	const convertStep = (ids:range, sources:range[], targets:range[]):{mapped:range[], residues:range[]} => {
		let mapped:range[]=[], residues:range[]=[];
		sources.forEach((source:range, sourceInd:number) => {
			let target = targets[sourceInd];
			let targetStartInd, targetEndInd;
			console.log('crossing src', source,'with ids', ids)
			// Not intersecting: source after ids or ids after source
			console.log('comp',(source.start > ids.end) , (ids.start > source.end), source.start , ids.end , ids.start , source.end)
			if (source.start > ids.end || ids.start > source.end) {
				console.log( 'not inter')
				residues.push(ids);
				return false;
			}

			// Intersecting, if we got so far.

			if (ids.start <= source.start) {
				targetStartInd = 0;
			} else {
				targetStartInd = ids.start - source.start;
			}

			if (source.end <= ids.end) { // or with range
				targetEndInd = source.end - 1
			} else {
				//targetEndInd = source.end - ids.end + 1 +
				targetEndInd = ids.end - source.start // ???
			}

			if (targetEndInd < targetStartInd) {
				console.log('whoops wait what', targetStartInd,'->', targetEndInd);
				throw ''
			}
			
			console.log('source',source,'target',target,'search',ids);
			console.log('got ', target.start + targetStartInd,'-', target.start + targetEndInd ,'(',targetStartInd,'-',targetEndInd,')')
			console.log('target:',target);
			const res = {
				start: target.start + targetStartInd,
				end: target.start + targetEndInd, 
				range: targetEndInd - targetStartInd - 1
			}

			sourcesConverted.push({start: source.start + targetStartInd, end: source.start + targetEndInd});
			console.log('pushed to sources arr', sourcesConverted, targetStartInd, targetEndInd)
			
			let residue:range|null;
			if (res.start > ids.start) {
				residue = {start: ids.start, end: res.start - 1}
				// is the residue anywhere else in the sources?
			//	residue = convertStep(residue, sources, targets)['residues'].pop() || null;
			//	if (residue)
			//		mapped.push(residue) // identity func
				//residues.push({start: ids.start, end: res.start - 1})
				residues.push(residue);
			}
			if (res.end < ids.end) {
				residue = {start: res.end + 1, end: ids.end, range: ids.end - res.end}
				//residues.push({start: res.end + 1, end: ids.end, range: ids.end - res.end})
			//	residue = convertStep(residue, sources, targets)['residues'].pop() || null;
			//	if (residue)
			//		mapped.push(residue) // identity func
				residues.push(residue);
			}
			mapped = mapped.filter(e=>e && e != null)
			residues = residues.map(e=>e && e != null)

		})
		return { mapped, residues };

	};
	let mapped = convertStep(ids, sources, targets)['mapped'];

	// Handle residues, things that didn't fit some conversions.
	// Did they find other conv's or do they need an id?
	// There MUST have been a better way to do this. Iterables maybe. Intersection w each other and pruning that.
	// But at this point I just want this to be over this.
	/*while (residues.length > 0) {
		const residue = residues.pop();
		if (!residue) continue;

		// see which parts of the residue aren't in the sources
		// map those that aren't
		sources.forEach((source:range) => {
			console.log('source in loop', source, 'res', residue)



			
			if (residue.end >= source.start && residue.start <= source.end) {
				// completely in the source.
				console.log('res inside the source', residue, source)
				// nothing to do
			} else if (residue.end >= source.start && residue.start <= source.start) {
					// residue a bit before source
					console.log('res before the source', residue, source)
					if (source.start <= residue.end) {
						mapped.push({start: source.start, end: residue.end })
						residues.push({start: residue.start, end: residue.end - 1})
				} else if (residue.end >= source.end && residue.start >= source.start) {
					// residue a bit after source
					console.log('res after the source', residue, source)
					if (residue.start <= source.end) {
						mapped.push({start: residue.start, end: source.end });
						residues.push({start: source.start, end: residue.start - 1})
					}
				} else {
					console.log('outside. source', source, 'residue', residue);
					mapped.push(residue)
					//throw 'error intersecting residue'
				}
			}

			return;

		});
	} */
	return mapped;
}

let toProcess = typesOrder.slice(0, -1)
	.map((value, index) => [value, typesOrder[index+1]]);

state.source = seeds;

while (toProcess.length > 0) {
	const [from, to] = toProcess.shift();
	const key = typesToString(from, to);
	console.log('processing',from,to, state.source)

// console.log('return source','seeds',seeds,'from',from,'to',to,'=',state.source.map(seedIds => {
// 	//console.log('handling',source)
// 	return convert(seedIds, from, to, conversions)
// }))

	let mapping = state.source.map(sourceIds => {
		return prepareConversions(sourceIds, from, to, conversions)
	}).filter(e=>e && e.length>0)
	let targetRanges = getMatches(mapping)
	console.log('mapping returend', targetRanges)
	state.source = targetRanges.reduce((acc,curr)=>acc.concat(curr), []);
	console.log('===== next source', state.source);
	console.log('=====done with',from,to);
	console.log('=============================')

}

console.log('results',state.source);

console.log('final result', Math.min(...state.source))