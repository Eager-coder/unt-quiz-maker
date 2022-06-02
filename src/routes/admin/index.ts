import { Router } from "express"
import { quizRouter } from "./quiz"

const router = Router()

router.use("/quiz", quizRouter)
export { router as adminRouter }
