import {readFile, readFileSync} from 'fs';

function getInput(filename) {
	return readFileSync(filename,'utf8', e=>console.log('err',e));
}

export {getInput};

