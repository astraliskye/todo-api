const argon2 = require("argon2");
const { Router } = require("express");
const { query } = require("../db");
const {
	registerValidator, loginValidator, validUserSession
} = require("../validation");
const { v4: uuidV4 } = require("uuid");

const authRouter = Router();

authRouter.post("/register",
	registerValidator, async (req, res) => {
		const { displayName, email, password } = req.body;
		const hashedPassword = await argon2.hash(password);

		// Insert new user and return user info to app (without password)
		const { rows: [user] } = await query(`
      INSERT INTO users (id, displayName, email, password)
      VALUES ($1, $2, $3, $4)
      RETURNING id, displayName, email, createdAt
    `, [uuidV4(), displayName, email, hashedPassword]);
    
		req.session.userId = user.id;
		return res.send(user);
	} 
);

authRouter.post("/login",
	loginValidator, async (req, res) => {
		const { password } = req.body;
		const { rows } = await query("SELECT * FROM users WHERE email=$1");

		// If only one user exists for the given email and the password
		// matches, the user is authenticated and the user's info is sent to
		// the app (without the password)
		if (rows.length === 1
      && await argon2.verify(rows[0].password, password)) {
			rows[0].password = undefined;
			req.session.userId = rows[0].id;
			return res.send(rows[0]);
		} else {
			return res.status(401).send({ message: "login unsuccessful" });
		}
	}
);

authRouter.post("/logout", (req, res) => {
	req.session.userId = null;
	return res.send({ message: "logout success" });
});

authRouter.get("/me", validUserSession, (req, res) => {
	const {
		rows: [user]
	} = query("SELECT * FROM users WHERE id=$1", [req.session.userId]);
	user.password = undefined;
	return res.send(user);
});

module.exports = authRouter;
