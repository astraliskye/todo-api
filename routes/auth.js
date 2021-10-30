const argon2 = require("argon2");
const {Router} = require("express");
const { createUser, getUserByEmail } = require("../db");
const verifiers = require("../verifiers");
const {asyncWrapper} = require("../util");

const authRouter = Router();

authRouter.post("/register",
	verifiers.register,
	verifiers.uniqueEmail,
	asyncWrapper(async (req, res) => {
		req.body.password = await argon2.hash(req.body.password);
		const user = await createUser(req.body);
		user.password = undefined;
		req.session.user = user;

		res.json(user);
	}));

authRouter.post("/login",
	verifiers.login,
	asyncWrapper(async (req, res) => {
		const user = await getUserByEmail(req.body.email);

		if (user && await argon2.verify(user.password, req.body.password)) {
			user.password = undefined;
			req.session.user = user;
			res.json(user);
		}
		else {
			res.status(401).json({message: "login unsuccessful"});
		}
	}));

authRouter.post("/logout", (req, res) => {
	if (req.session.user)
		req.session.user = null;

	res.json({message: "logout success"});
});

authRouter.get("/me", (req, res) => {
	if (req.session.user && verifiers.validateUser(req.session.user))
		res.json(req.session.user);
	else
		res.status(401).json({message: "unauthenticated"});
});

module.exports = authRouter;
