const {Router} = require('express')
const { getTodosByUserId, createTodo, updateTodo, deleteTodo } = require('../db')
const verifiers = require('../verifiers')
const {asyncWrapper} = require("../util")

const todosRouter = Router()

todosRouter.get("/",
        verifiers.validCurrentUser,
        asyncWrapper(async (req, res) => {
    const todos = await getTodosByUserId(req.session.user.id)
    res.json(todos)
}))

todosRouter.post("/",
        verifiers.createTodo,
        verifiers.validCurrentUser,
        asyncWrapper(async (req, res) => {
    const todo = await createTodo(req.session.user.id, req.body)
    res.json(todo)
}))

todosRouter.patch("/:id",
        verifiers.idParam,
        verifiers.updateTodo,
        verifiers.validCurrentUser,
        asyncWrapper(async (req, res) => {
    const todo = await updateTodo(req.params.id, req.body)
    res.json(todo)
}))

todosRouter.delete("/:id",
        verifiers.idParam,
        verifiers.validCurrentUser,
        asyncWrapper(async (req, res) => {
    await deleteTodo(req.params.id)
    res.json({message: "successfully deleted todo"})
}))

module.exports = todosRouter
