import express from "express"
import cors from "cors"
import router from "./routes/index"
import cookieParser from "cookie-parser"
import path from "path"
import config from "./config"

const app = express()
const PORT = config.PORT || 80

app.use(cors({ origin: "http://localhost:3000", credentials: true }))
app.use(express.json({ limit: "5mb" }))
app.use(cookieParser())

app.use("/api", router)

app.use(express.static("../client/build"))
app.get("/*", (req, res) => res.sendFile(path.join(__dirname, "../client/build/index.html")))

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
