import { readFileSync} from 'fs';


class BasicThingClass {
	// I probably should use a ts interface but I'll keep options open easily
	constructor(args={}) {
		for (let key of Object.keys(args)) {
			this[key] = args[key];
		}
	}
}
export {BasicThingClass};



function getInput(filename) {
	return readFileSync(filename,'utf8', e=>console.log('err',e));
}
export {getInput};



function trim(str:string) {
	try {
		return str.trim();
	} catch(err) { 
		console.log('error',err,'str',str);
	}
}
export {trim}
