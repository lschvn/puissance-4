const server = Bun.serve({
	port: 6767,
	async fetch(req) {
		const url = new URL(req.url);
		let pathname = url.pathname;

		switch (pathname) {
			case "/":
				pathname = "/index.html";
				break;
			case "/history":
				pathname = "/history";
				break;
			case "/replay":
				pathname = "/replay.html";
				break;
			case "/game":
				pathname = "/game.html";
				break;
		}

		const path = `./public${pathname}`;
		const file = Bun.file(path);
		if (!file.exists()) {
			return new Response("Page Not Found", { status: 404 });
		}
		return new Response(file);
	},
});

console.log(`Listen on http://localhost:${server.port}`);
