const argon2 = require("argon2");
const { Router } = require("express");
const { createUser, getUserByEmail, query } = require("../db");
const {
	registerValidator, loginValidator, validUserSession
} = require("../validation");
const { asyncWrapper } = require("../util");

const authRouter = Router();

authRouter.post("/register",
	registerValidator,
	asyncWrapper(async (req, res) => {
		req.body.password = await argon2.hash(req.body.password);
		const user = await createUser(req.body);
		user.password = undefined;
		req.session.userId = user.id;

		res.json(user);
	}));

authRouter.post("/login",
	loginValidator,
	asyncWrapper(async (req, res) => {
		const user = await getUserByEmail(req.body.email);

		if (user && await argon2.verify(user.password, req.body.password)) {
			user.password = undefined;
			req.session.userId = user.id;
			res.json(user);
		}
		else {
			res.status(401).json({ message: "login unsuccessful" });
		}
	}));

authRouter.post("/logout", (req, res) => {
	req.session.userId = null;
	res.json({ message: "logout success" });
});

authRouter.get("/me", validUserSession, (req, res) => {
	const {
		rows: [user]
	} = query("SELECT * FROM users WHERE id=$1", [req.session.userId]);
	user.password = undefined;
	res.json(user);
});

module.exports = authRouter;
