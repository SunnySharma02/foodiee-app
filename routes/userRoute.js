import express from 'express'
import { loginUser, registerUser, verifyUser } from '../controllers/userController.js'

const userRouter = express.Router()

userRouter.post("/register", registerUser)
userRouter.post("/login", loginUser)
userRouter.get("/confirm/:token", verifyUser)

export default userRouter