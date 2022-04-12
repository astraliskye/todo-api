const Joi = require("joi");
const validator = require("express-joi-validation").createValidator({});
const { query } = require("./db");
const { emailRegex, uuidRegex } = require("./util");

const registerSchema = Joi.object({
	displayName: Joi.string().required(),
	email: Joi.string().regex(emailRegex).required(),
	password: Joi.string().required()
});

const loginSchema = Joi.object({
	email: Joi.string().required(),
	password: Joi.string().required()
});

const postTodoSchema = Joi.object({
	task: Joi.string().required(),
	description: Joi.string(),
	isComplete: Joi.bool().required()
});

const patchTodoSchema = Joi.object({
	task: Joi.string(),
	description: Joi.string(),
	isComplete: Joi.bool()
});

const paramIdSchema = Joi.object({
	id: Joi.string().regex(uuidRegex).required()
});

async function validUserSession(req, res, next) {
	const { userId } = req.session;
	const { rows } = await query("SELECT * FROM users WHERE id=$1", [userId]);

	if (rows.length === 1)
		next();
	else
		res.status(400).send({ message: "no valid user session" });
}

function noUserSession(req, res, next) {
	const { userId } = req.session;

	if (!userId || userId === "")
		next();
	else
		res.status(400).send({
			message: "there is already a user session, try logging out first"
		});
}

module.exports = {
	registerValidator: validator.body(registerSchema),
	loginValidator: validator.body(loginSchema),
	postTodoValidator: validator.body(postTodoSchema),
	patchTodoValidator: validator.body(patchTodoSchema),
	paramIdValidator: validator.params(paramIdSchema),
	validUserSession,
	noUserSession
};
