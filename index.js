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

const PORT = process.env.PORT || 6969;

const app = express();

app.use(express.json());
app.use(cors({
	credentials: true,
	origin: isProd ? process.env.CLIENT_URL : true
}));

app.use(morgan("tiny"));

app.enable("trust proxy");

app.use(
	session({
		store: new pgSession({
			pool,
			tableName: "todo_sessions",
		}),
		secret: process.env.COOKIE_SECRET,
		resave: false,
		cookie: {
			maxAge: 365 * 24 * 60 * 60 * 1000,
			domain: isProd ? ".herokuapp.com" : "localhost"
		},
		secure: isProd,
		name: "sessionID",
		httpOnly: true,
		saveUninitialized: false,
	})
);

app.use((req, res, next) => {
	console.log("===ENV===", process.env);
	console.log("===DEBUG===", process.env.DEBUG);
	console.log("===Headers===", req.headers);
	console.log("===Session===", req.session);
	console.log("===Body===", req.body);
	next();
});

app.get("/", (_req, res) => {
	res.send(`
    <head>
      <style>
        * {
          font-family: Gill Sans, Gill Sans MT, Calibri, sans-serif;
          box-sizing: border-box;
          margin: 0;
        }

        h1, p {
          text-align: center;
        }

        h1 {
          padding: 20px;
        }

        p {
          padding-bottom: 40px;
        }

        table {
          width: 500px;
          margin: 0 auto;
          border-spacing: 0;
          box-shadow: 0px 4px 10px #d4d8db;
        }

        td {
          background-color: #f4f8fb;
          padding: 10px;
        }

        th {
          background-color: #34383b;
          color: white;
          padding: 20px;
        }

        td:nth-child(2) {
          text-align: center;
        }

        code {
          	font-family: Courier New, Courier, Lucida Sans Typewriter, Lucida Typewriter, monospace;
        }

        .fullscreen {
          width: 100vw;
          max-width: 100vw;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
      </style>
    </head>
    <body>
      <div class="fullscreen">
        <h1>Welcome!</h1>
        <p>This is a simple api for storing and tracking a list of tasks</p>
        <table>
          <tr>
            <th>route</th>
            <th>expected body (JSON)</th>
          </tr>
          <tr>
            <td>POST /register</td>
            <td><code>{ email, displayName, password }</code></td>
          </tr>
          <tr>
            <td>POST /login</td>
            <td><code>{ email, password }</code></td>
          </tr>
          <tr>
            <td>POST /logout</td>
            <td><code>{ email, password }</code></td>
          </tr>
          <tr>
            <td>GET /me</td>
            <td>none</td>
          </tr>
          <tr>
            <td>GET /todos</td>
            <td>none</td>
          </tr>
          <tr>
            <td>POST /todos</td>
            <td><code>{ task, description, isComplete }</code></td>
          </tr>
          <tr>
            <td>PATCH /todos/:id</td>
            <td><code>{ task, description, isComplete }</code></td>
          </tr>
          <tr>
            <td>DELETE /todos/:id</td>
            <td>none</td>
          </tr>
        </table>
      </div>
    </body>
  `);
});

app.use("/", authRouter);
app.use("/todos", todosRouter);

app.use((req, res) => {
	res.status(404).json({message: "route inaccessible or does not exist"});
});

app.use((err, req, res, next) => {
	console.error(err.message);
	res.status(500).json({error: {message: "something went wrong"}});
});

app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}...`);
});
