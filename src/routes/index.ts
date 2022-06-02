import { Router } from "express"
import { adminRouter } from "./admin"
import authRouter from "./auth"
import { userRouter } from "./user"

const routes = Router()

routes.use("/user", userRouter)
routes.use("/admin", adminRouter)
routes.use("/auth", authRouter)

export default routes
