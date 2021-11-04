const {getUserByEmail} = require("./db");

const uuidRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;

// a number, a lowercase letter, an uppercase letter,
//  and at least 8 characters long
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

const timestampRegex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$/;

function idParam(req, res, next) {
	const {id} = req.params;

	if (!uuidRegex.test(id))
		res.status(400).json({message: "invalid id"});
	else
		next();
}

async function uniqueEmail(req, res, next) {
	const user = await getUserByEmail(req.body.email);

	if (user)
		return res.status(400).json({message: "email already in use"});

	next();
}

function validCurrentUser(req, res, next) {
	const {user} = req.session;

	if (!user) {
		res.status(400).json({message: "no user is logged in"});
	}
	else if (!uuidRegex.test(user.id) ||
            typeof user.email !== "string" ||
            user.email === "" ||
            typeof user.displayName !== "string" ||
            user.displayName === "" ||
            !timestampRegex.test(user.createdAt)) {
		console.log(uuidRegex.test(user.id));
		console.log(user);
		res.status(400).json({message: "current user in session is invalid, try logging out"});
	}
	else {
		next();
	}
}

function noCurrentUser(req, res, next) {
	if (!req.session.user) {
		next();
	}
	else {
		res.status(400).json({message: "a user is already tied to this session"});
	}
}

function login(req, res, next) {
	const {email, password} = req.body;

	if (typeof email !== "string" || email === "")
		res.status(400).send({message: "invalid email"});
	else if (typeof password !== "string" || password === "")
		res.status(400).send({message: "invalid password"});
	else {
		req.body = {
			email,
			password
		};

		next();
	}
}

function register(req, res, next) {
	const {displayName, email, password} = req.body;

	if (typeof displayName !== "string" || displayName === "")
		res.status(400).send({message: "invalid displayName"});
	else if (!emailRegex.test(email))
		res.status(400).send({message: "invalid email"});
	else if (typeof password !== "string" && password === "")
		res.status(400).send({message: "invalid password"});
	else {
		req.body = {
			displayName,
			email,
			password
		};

		next();
	}
}

function createTodo(req, res, next) {
	const {task, description} = req.body;

	if (typeof task !== "string" || task === "")
		res.status(400).send({message: "invalid task"});
	else {
		req.body = {
			task,
			description,
			isComplete: false
		};

		next();
	}
}

function updateTodo(req, res, next) {
	const {task, description, isComplete} = req.body;

	if (typeof task !== "string" || task === "")
		res.status(400).send({message: "invalid task"});
	else if (typeof isComplete !== "boolean")
		res.status(400).send({message: "invalid isComplete"});
	else {
		req.body = {
			task,
			description,
			isComplete
		};

		next();
	}
}

function validateUser(user) {
	if (!uuidRegex.test(user.id) ||
            typeof user.email !== "string" ||
            user.email === "" ||
            typeof user.displayName !== "string" ||
            user.displayName === "" ||
            !timestampRegex.test(user.createdAt)) {
		console.log(uuidRegex.test(user.id));
		console.log(user);
		return false;
	}

	return true;
}

module.exports = {
	idParam,
	uniqueEmail,
	validCurrentUser,
	noCurrentUser,
	register,
	login,
	createTodo,
	updateTodo,
	validateUser
};
