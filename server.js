require("dotenv").config();

const express = require("express");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const morgan = require("morgan");
const cors = require("cors");
const { pool } = require("./db");
const todosRouter = require("./routes/todos");
const authRouter = require("./routes/auth");
const { isProd } = require("./util");

const app = express();

const corsConfig = {
	credentials: true,
	origin: true
};

const sessionConfig = {
	store: new pgSession({
		pool,
		tableName: "todo_sessions",
	}),
	secret: process.env.COOKIE_SECRET,
	resave: false,
	cookie: {
		maxAge: 365 * 24 * 60 * 60 * 1000,
	},
	secure: isProd,
	name: "sessionID",
	saveUninitialized: false,
};

app.use(express.json());
app.use(cors(corsConfig));
app.use(morgan("tiny"));
app.enable("trust proxy");
app.use(session(sessionConfig));

app.get("/", (_req, res) => {
	res.send({ message: "Hello world" });
});

app.use("/", authRouter);
app.use("/todos", todosRouter);

app.use((req, res) => {
	res.status(404).json({ message: "route inaccessible or does not exist" });
});

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ error: { message: "something went wrong" } });
});

module.exports = app;
