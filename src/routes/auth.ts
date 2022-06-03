import { Router } from "express"
import { OAuth2Client } from "google-auth-library"
import axios from "axios"
import pool from "../db"
import config from "../config"

const router = Router()

router.post("/", async (req, res) => {
	try {
		const { code } = req.body

		const oAuth2Client = new OAuth2Client(config.CLIENT_ID, config.CLIENT_SECRET, "postmessage")
		const { tokens } = await oAuth2Client.getToken(code)

		res.cookie("id_token", tokens.id_token, { maxAge: 3600 * 1000, httpOnly: true, sameSite: "lax" })
		res.cookie("access_token", tokens.access_token, { maxAge: 3600 * 1000, httpOnly: true, sameSite: "lax" })
		res.cookie("refresh_token", tokens.refresh_token, { maxAge: 14 * 86400 * 1000, httpOnly: true, sameSite: "lax" })

		const user = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokens.access_token}`)
		const { rows } = await pool.query("SELECT email, is_admin FROM users WHERE email = $1", [user.data.email])

		if (!rows.length) {
			await pool.query("INSERT INTO users (fullname, email, picture, is_admin) VALUES ($1, $2, $3, TRUE)", [
				user.data.name,
				user.data.email,
				user.data.picture,
			])
		} else {
			user.data.is_admin = rows[0].is_admin
		}

		res.json(user.data)
	} catch (error) {
		console.log("/auth", error)
		res.status(500).json({ message: "Something went wrong" })
	}
})

router.delete("/", async (req, res) => {
	res.clearCookie("id_token")
	res.clearCookie("access_token")
	res.clearCookie("refresh_token")
	res.json({ message: "Signed out" })
})

export default router
