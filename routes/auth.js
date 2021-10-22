const argon2 = require("argon2")
const {Router} = require("express");
const { createUser, getUserByEmail } = require("../db");
const verifiers = require("../verifiers");
const {asyncWrapper} = require("../util")

const authRouter = Router()

authRouter.post('/register',
        verifiers.noCurrentUser,
        verifiers.register,
        asyncWrapper(async (req, res, next) => {
    req.body.password = await argon2.hash(req.body.password)
    const user = await createUser(req.body);
    user.password = undefined;
    req.session.user = user;

    res.json({message: "registration successful"})
}))

authRouter.post('/login',
        verifiers.noCurrentUser,
        verifiers.login,
        asyncWrapper(async (req, res) => {
    const user = await getUserByEmail(req.body.email)

    if (user && await argon2.verify(user.password, req.body.password)) {
        user.password = undefined
        req.session.user = user
        res.json({message: "login successful"})
    }
    else {
        res.status(401).json({message: "login unsuccessful"})
    }
}))

authRouter.post("/logout", verifiers.validCurrentUser, (req, res) => {
    if (req.session.user) {
        req.session.user = null
        res.json({message: "logout successful"})
    }
    else {
        res.status(400).json({message: "no user in current session"})
    }
})

module.exports = authRouter
