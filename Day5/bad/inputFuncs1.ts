// bc it's a mess otherwise!

import { Resource, resourceMapType, resourceType } from './classes1.js';
import { trim } from './helpers.js';

function parseInput(raw: string[]):{maps:resourceMapType[],seeds:resourceType[]} {
	let maps:resourceMapType[]=[]
	let seeds:resourceType[]=[];
	let currResources: Partial<{
		from: resourceType,
		to: resourceType,
	}> = {}

	if (raw.length == 0) throw 'no raw';

	while (raw.length > 0) {
		const line = raw.shift();
		if (line == undefined || line == '') continue;

		if (line.startsWith('seeds: '))
			seeds = readSeeds(line);

		else if (!line.includes(' map:'))
			throw new Error('Could not read input line' +  line);

		else {
			[currResources['from'], currResources['to']] = line
				.replace(' map:', '') // eg 'seeds-to-soil'
				.split('-')
				.map(trim)
				.filter(s=>s!='to') // eg ['seeds', 'soil']
				.map(s=>s as resourceType);
			if (!currResources.from || !currResources.to)
				throw 'currResources bad!' + String(currResources.valueOf());
			let rLine:string = '123';
			do {
				rLine = raw.shift() || (()=>{throw "wtf blank line";})();
				if (rLine == undefined || rLine == '') continue;
				maps.push(
					readResourceMap(rLine, currResources)
				)

				
			} while (rLine.length > 0)
		}
	
	} // lines reader
	return { maps, seeds }
}

function readSeeds(line:string):resourceType[] {
	const seedStr = line
		.split(':').at(1);
	if (!seedStr)
		throw 'Bad seed line!' + line + 'was split to', String(seedStr);
	return seedStr
		.split(' ')
		.map(s=>Number(s))
}

function readResourceMap(line:string, resources): resourceMapType {
	let res:resourceMapType = {}
	res.resource = resources as typeof res.resource;
	const [targetStart, sourceStart, range] = line.split(' ').map(n=>Number(n));
	//res.source = {start: sourceStart, range: range};
	//res.target = {start: targetStart, range: range};
	return res;
}

export { parseInput }