const { query } = require("../db");
const { Router } = require("express");
const {
	validUserSession, postTodoValidator, paramIdValidator, patchTodoValidator
} = require("../validation");
const { v4: uuidV4 } = require("uuid");

const todosRouter = Router();

todosRouter.get("/",
	validUserSession, async (req, res) => {
		const { userId } = req.session;
    
		// Get all todos for a specific user
		const { rows: todos } = await query(`
      SELECT *
      FROM todos
      WHERE userId=$1
      ORDER BY createdAt DESC, task
    `, [userId]);

		return res.send(todos);
	}
);

todosRouter.post("/",
	postTodoValidator,
	validUserSession, async (req, res) => {
		const { task, description, isComplete } = req.body;
		const { userId } = req.session;

		// Insert new todo
		const { rows: [todo] } = await query(`
      INSERT INTO todos (id, task, description, isComplete, userId)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, task, description, isComplete, userId
    `, [uuidV4(), task, description, isComplete, userId]);
    
		return res.send(todo);
	}
);

todosRouter.patch("/:id",
	paramIdValidator,
	patchTodoValidator,
	validUserSession, async (req, res) => {
		const { id } = req.params;
		const { task, description, isComplete } = req.body;

		// Check if todo exists, then update todo if it does
		const { rows } = await query(`
      SELECT *
      FROM todos
      WHERE id=$1
    `, [id]);

		if (rows.length !== 1)
			return res.status(404).send({ message: "todo not found" });

		if (rows[0].userId !== req.session.userId)
			return res.status(401).json({ message: "unauthorized" });

		const { rows: [todo] } = await query(`
      UPDATE todos
      SET task=$12, description=$3, isComplete=$4
      WHERE id=$1
    `, [id, task, description, isComplete]);

		return res.send(todo);
	}
);

todosRouter.delete("/:id",
	paramIdValidator,
	validUserSession, async (req, res) => {
		const { id } = req.params;

		// Delete todo if it exists
		const { rows } = await query(`
      SELECT *
      FROM todos
      WHERE id=$1
    `, [id]);

		if (rows.length !== 1)
			res.status(404).send({ message: "todo not found" });

		if (rows[0].userId !== req.session.user.id)
			return res.status(401).json({ message: "unauthorized" });

		await query(`
      DELETE FROM todos
      WHERE id=$1
    `, [id]);

		return res.send({ message: "successfully deleted todo" });
	}
);

module.exports = todosRouter;
