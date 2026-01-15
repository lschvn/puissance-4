console.log("./libs/index.ts loaded");

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

	public play(col: number) {
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
		this.switch();
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
		container.innerHTML = "";
		container.appendChild(table);
	}

	// add color to a used cell
	public colors(row: number, col: number, player: Player) {
		const table = document.querySelector(
			`#${this.id} table`,
		) as HTMLTableElement;
		if (table) {
			const cell = table.rows[row]?.cells[col];
			if (cell) {
				cell.classList.add(player);
			}
		}
	}
}

const board = new Board();
board.build();
const game = new Game(board);
const container = document.getElementById(board.getId());

container?.addEventListener("click", (e: Event) => {
	const target = e.target as HTMLElement;

	if (target.tagName === "TD") {
		const col = parseInt(target.dataset.col || "0");
		game.play(col);
	}
});
