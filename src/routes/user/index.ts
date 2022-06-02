import { Router } from "express"
import { profileRouter } from "./profile"
import { quizRouter } from "./quiz"

const router = Router()

router.use("/profile", profileRouter)
router.use("/quiz", quizRouter)

export { router as userRouter }
