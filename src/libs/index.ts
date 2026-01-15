console.log("./libs/index.ts loaded");

interface Turn {
	id: string;
	player: string;
	y: number;
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

	public getTurns() {
		return this.turns;
	}

	public setTurns(turns: Turn[]) {
		this.turns = turns;
		return this.getTurns();
	}

	public play(col: number) {
		const row = this.getLowestCol(col);

		// col is already full
		if (row === -1) {
			return;
		}

		this.state[row]![col] = this.player;

		const newTurn: Turn = {
			player: this.player,
			col: col,
			row: row,
		};
		this.turns.push(newTurn);

		this.board.colors(row, col, this.player);
		this.switch();
	}

	private getLowestCol(col: number): number {
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

	private id: string = "game";

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
