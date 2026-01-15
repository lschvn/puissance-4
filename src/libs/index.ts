console.log("./libs/index.ts loaded");

interface Turn {
	id: string;
	player: string;
	y: number;
}

class Puissance4 {
	private turns: Turn[];

	constructor() {}

	public getTurns() {
		return this.turns;
	}

	public setTurns(turns: Turn[]) {
		this.turns = turns;
		return this.getTurns();
	}
}
