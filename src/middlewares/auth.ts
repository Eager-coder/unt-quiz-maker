import { Router } from "express"
import { OAuth2Client } from "google-auth-library"
import axios from "axios"
import pool from "../db"
import config from "../config"

const router = Router()
const oAuth2Client = new OAuth2Client(config.CLIENT_ID, config.CLIENT_SECRET, "http://localhost:3000")

router.use("/", async (req, res, next) => {
	const { id_token, refresh_token, access_token } = req.cookies

	try {
		const ticket = await oAuth2Client.verifyIdToken({
			idToken: id_token,
			audience: config.CLIENT_ID,
		})
		res.locals.user = ticket.getPayload()
		if (!res.locals.user.access_token) {
			res.locals.user.access_token = access_token
		}
		next()
	} catch (error) {
		console.log("authMiddleware 1", error)
		try {
			const { data } = await axios.post("https://www.googleapis.com/oauth2/v4/token", {
				client_id: config.CLIENT_ID,
				client_secret: config.CLIENT_SECRET,
				refresh_token: refresh_token,
				grant_type: "refresh_token",
			})
			const ticket = await oAuth2Client.verifyIdToken({
				idToken: data.id_token,
				audience: config.CLIENT_ID,
			})

			res.locals.user = ticket.getPayload()

			res.cookie("id_token", data.id_token, { maxAge: 3600 * 1000, httpOnly: true, sameSite: "lax" })
			res.cookie("access_token", data.access_token, { maxAge: 3600 * 1000, httpOnly: true, sameSite: "lax" })
			next()
		} catch (error) {
			console.log("authMiddleware 2", error)
			res.status(401).json()
		}
	}
})

const adminRouter = Router()

adminRouter.use("/", async (req, res, next) => {
	try {
		const { email } = res.locals.user
		const { rows } = await pool.query("SELECT email FROM users WHERE email = $1 AND is_admin = TRUE", [email])
		if (!rows.length) {
			return res.status(401).json({ message: "You are not authorized for this action" })
		}
		next()
	} catch (error) {
		console.log("/adminRouter", error)
		res.status(500).json({ message: "Something went wrong. Try again." })
	}
})
export { router as verifyAuth, adminRouter as verifyAdmin }
