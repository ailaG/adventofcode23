
type resourceMapType = { 
	resource?: {
		from: resourceType, 
		to: resourceType
	},
	source?: {
		start: number, 
		range: number
	},
	target?: {
		start: number, 
		range: number
	},
}

type resourceType = "seed" | "soil" | "fertilizer" | "water" | "light" | "temperature" | "humidity" | "location";

class Resource { // extend if necessary
	id: number;
	mapsTo: {
		start: number,
		end: number,
		type: resourceType
	}
	type: resourceType;
}

export { Resource, resourceMapType, resourceType }