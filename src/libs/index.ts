import confetti from "@hiseb/confetti";

console.log("./libs/index.ts loaded");

interface APITypes {
	START: {
		BODY: {
			p1: string;
			p2: string;
		};
		RES: {
			id: string;
			player_start: Player;
		};
	};
	TURN: {
		BODY: {
			gid: string;
			player: Player;
			x: number;
		};
		RES: {
			victory: string | "none";
			board: [];
		};
	};
}

const url = "http://eg0wkc0gkkcc00ooow0wkosw.51.38.236.154.sslip.io";
const endpoints = {
	START: {
		url: "/start_game",
		method: "POST",
	},
	TURN: {
		url: "/turn",
		method: "POST",
	},
};

class API {
	private url: string;

	constructor(url: string) {
		this.url = url;
	}

	async start(p1: string, p2: string) {
		const res = await fetch(this.url + endpoints.START.url, {
			method: endpoints.START.method,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ p1, p2 }),
		});
		return res.json();
	}

	async turn(gid: string, player: Player, x: number) {
		const res = await fetch(this.url + endpoints.TURN.url, {
			method: endpoints.TURN.method,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ gid, player, x }),
		});
		return res.json();
	}
}

const api = new API(url);

interface Turn {
	id?: string;
	player: string;
	x: number;
}

type Player = "red" | "yellow";

class Game {
	private turns: Turn[] = [];
	private player: Player = "red";
	private state: (Player | null)[][] = [];
	private board: Board;
	private gid: string = "";
	private started: boolean = false;

	constructor(board: Board) {
		this.board = board;

		// init null arr
		this.state = Array(6)
			.fill(null)
			.map(() => Array(7).fill(null));
	}

	public getPlayer() {
		return this.player;
	}

	public getTurns() {
		return this.turns;
	}

	public setTurns(turns: Turn[]) {
		this.turns = turns;
		return this.getTurns();
	}

	public async start(p1: string, p2: string) {
		const res = await api.start(p1, p2);
		this.gid = res.id;
		this.started = true;
		return res;
	}

	public play(col: number) {
		if (!this.started) {
			console.log("Game not started");
			return;
		}

		const row = this.getLowestRow(col);

		// col is already full
		if (row === -1) {
			return;
		}

		this.state[row]![col] = this.player;

		const turn: Turn = {
			player: this.player,
			x: col,
		};
		this.turns.push(turn);

		this.board.colors(row, col, this.player);

		// call api before the switch player
		api.turn(this.gid, this.player, col);

		this.switch();
		console.log(
			`${this.getPlayer()} played the following turn`,
			JSON.stringify(turn),
		);

		if (this.victory()) {
			console.log(`victory, player ${this.player} wins!`);
			return;
		}
	}

	private getLowestRow(col: number): number {
		for (let r = this.state.length - 1; r >= 0; r--) {
			if (this.state[r]![col] === null) {
				return r;
			}
		}
		return -1;
	}

	private switch() {
		this.player = this.player === "red" ? "yellow" : "red";
	}

	// check for the victory
	public victory(): boolean {
		const ROWS = 6;
		const COLS = 7;

		for (let r = 0; r < ROWS; r++) {
			for (let c = 0; c < COLS; c++) {
				const player = this.state[r]![c];
				if (!player) continue;

				// check horizontal (-)
				if (
					c + 3 < COLS &&
					player === this.state[r]![c + 1] &&
					player === this.state[r]![c + 2] &&
					player === this.state[r]![c + 3]
				) {
					return true;
				}

				// check vertical (|)
				if (
					r + 3 < ROWS &&
					player === this.state[r + 1]![c] &&
					player === this.state[r + 2]![c] &&
					player === this.state[r + 3]![c]
				) {
					return true;
				}

				// check diagonal down right (\)
				if (
					r + 3 < ROWS &&
					c + 3 < COLS &&
					player === this.state[r + 1]![c + 1] &&
					player === this.state[r + 2]![c + 2] &&
					player === this.state[r + 3]![c + 3]
				) {
					return true;
				}

				// check diagonal down left (/)
				if (
					r + 3 < ROWS &&
					c - 3 >= 0 &&
					player === this.state[r + 1]![c - 1] &&
					player === this.state[r + 2]![c - 2] &&
					player === this.state[r + 3]![c - 3]
				) {
					return true;
				}
			}
		}
		return false;
	}
}

class Board {
	private col: number = 7;
	private row: number = 6;

	private id: string = "app";

	public getId() {
		return this.id;
	}

	public build() {
		const container = document.getElementById(this.getId());
		if (!container) return;

		// create table
		const table = document.createElement("table");

		// create col and rows
		for (let r = 0; r < this.row; r++) {
			const tr = document.createElement("tr");
			for (let c = 0; c < this.col; c++) {
				const td = document.createElement("td");
				td.dataset.col = c.toString();
				td.dataset.row = r.toString();
				tr.appendChild(td);
			}
			table.appendChild(tr);
		}
		//container.innerHTML = "";
		document.querySelector(".board")!.appendChild(table);
	}

	// add color to a used cell
	public colors(row: number, col: number, player: Player) {
		console.log(`[DEGUB]: colors - ${row}, ${col}, ${player}`);
		const table = document.querySelector(
			`#${this.id} table`,
		) as HTMLTableElement;
		console.log(`[DEGUB]: colors - ${table}`);
		if (table) {
			const cell = table.rows[row]!.cells[col];
			console.log(`[DEGUB]: colors - ${cell}`);
			cell!.classList.add(player);
		}
	}
}

const board = new Board();
board.build();
const game = new Game(board);
game.start("p1", "p2");
const container = document.getElementById(board.getId());
console.log(container);

container?.addEventListener("click", (e: Event) => {
	const target = e.target as HTMLElement;

	if (target.tagName === "TD") {
		const col = parseInt(target.dataset.col || "0");
		game.play(col);
		if (game.victory()) {
			confetti({});
		}
	}
});
