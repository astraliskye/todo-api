const { Router } = require("express");
const {
	getTodosByUserId, createTodo, updateTodo, deleteTodo, getTodoById
} = require("../db");
const { asyncWrapper } = require("../util");
const {
	validUserSession, postTodoValidator, paramIdValidator, patchTodoValidator
} = require("../validation");

const todosRouter = Router();

todosRouter.get("/",
	validUserSession,
	asyncWrapper(async (req, res) => {
		const todos = await getTodosByUserId(req.session.user.id);
		res.json(todos);
	}));

todosRouter.post("/",
	postTodoValidator,
	validUserSession,
	asyncWrapper(async (req, res) => {
		const todo = await createTodo(req.session.user.id, req.body);
		res.json(todo);
	}));

todosRouter.patch("/:id",
	paramIdValidator,
	patchTodoValidator,
	validUserSession,
	asyncWrapper(async (req, res) => {
		const todoCheck = await getTodoById(req.params.id);

		if (todoCheck.userId !== req.session.user.id) {
			return res.status(401).json({ message: "unauthorized" });
		}

		const todo = await updateTodo(req.params.id, req.body);
		res.json(todo);
	}));

todosRouter.delete("/:id",
	paramIdValidator,
	validUserSession,
	asyncWrapper(async (req, res) => {
		const todoCheck = await getTodoById(req.params.id);

		if (todoCheck.userId !== req.session.user.id) {
			return res.status(401).json({ message: "unauthorized" });
		}

		await deleteTodo(req.params.id);
		res.json({ message: "successfully deleted todo" });
	}));

module.exports = todosRouter;
