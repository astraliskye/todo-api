const app = require("./server");
const cluster = require("cluster");

const PORT = process.env.PORT || 6969;
const NUM_WORKERS = process.env.WORKERS || require("os").cpus().length;

// Master cluster creates child processes and
// automatically assigns requests to each
if (cluster.isMaster) {
	console.log(`Starting cluster with ${NUM_WORKERS} workers`);

	// Spawn child processes
	for (let i = 0; i < NUM_WORKERS; i++) {
		const worker = cluster.fork();
		console.log(`worker ${worker.process.pid} started`);
	}

	// Restart child processes when they terminate
	cluster.on("exit", (worker) => {
		console.log(`worker ${worker.process.pid} died. restart...`);
		const newWorker = cluster.fork();
		console.log(`worker ${newWorker.process.pid} started`);
	});
}
else {
	// Child process logic
	app.listen(PORT, () => {console.log(`Listening on port ${PORT}...`);});
}

// Print error and exit on uncaught error
process.on("uncaughtException", (err) => {
	console.error(`${(new Date).toUTCString()} uncaughtException:`);
	console.error(err.stack);
	process.exit(1);
});
