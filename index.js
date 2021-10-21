const express = require('express')
const session = require('express-session')
const pgSession = require("connect-pg-simple")(session)
const morgan = require('morgan')
const cors = require('cors')
const { pool } = require('./db')
const todosRouter = require("./routes/todos")
const authRouter = require("./routes/auth")

const PORT = process.env.PORT || 6969;

const app = express();

app.use(express.json());
app.use(cors());

app.use(morgan("combined"));

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
    },
    saveUninitialized: false,
  })
);

app.get("/", (req, res) => {
  res.json({message: "Hello world!"})
})

app.use("/", authRouter);
app.use("/todos", todosRouter);

app.use((err, req, res, next) => {
  console.error(err.message)
  res.status(500).json({error: {message: "something went wrong"}})
})

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
