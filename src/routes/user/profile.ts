import axios from "axios"
import { Router } from "express"
import pool from "../../db"
import { verifyAuth } from "../../middlewares/auth"

const router = Router()

router.get("/", verifyAuth, async (req, res) => {
	try {
		let { email, name, picture } = res.locals.user
		if (!name || !picture) {
			const { data } = await axios.get(
				`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${res.locals.user.access_token}`,
			)
			name = data.name
			picture = data.picture
		}
		const { rows } = await pool.query("SELECT is_admin FROM users WHERE email = $1", [email])

		res.json({ email, name, picture, is_admin: rows[0].is_admin })
	} catch (error) {
		console.log("/profile GET", error)
		res.status(500).json({ message: "Something went wrong. Try again" })
	}
})

export { router as profileRouter }
