import { Router } from "express"
import { GoogleSpreadsheet } from "google-spreadsheet"
import config from "../../config"
import pool from "../../db"
import { verifyAuth } from "../../middlewares/auth"

const router = Router()

router.get("/", verifyAuth, async (req, res) => {
	try {
		const { rows } = await pool.query("SELECT * FROM quizzes WHERE is_deleted = FALSE")
		res.json(rows)
	} catch (error) {
		console.log("/quiz GET", error)
		res.status(500).json({ message: "Something went wrong. Try again!" })
	}
})
router.get("/score/all", verifyAuth, async (req, res) => {
	try {
		const { rows } = await pool.query(
			`	SELECT quizzes.quiz_id, quizzes.title, quiz_url, quiz_subject, created_at, score
			FROM quizzes LEFT JOIN scores ON scores.quiz_id = quizzes.quiz_id AND scores.email = $1 WHERE quizzes.is_deleted = FALSE
		`,
			[res.locals.user.email],
		)
		console.log(rows)

		res.json(rows)
	} catch (error) {
		console.log("/quiz/score/all GET", error)
		res.status(500).json({ message: "Something went wrong. Try again!" })
	}
})

router.get("/score", verifyAuth, async (req, res) => {
	try {
		const { quiz_id } = req.query
		if (!quiz_id) {
			return res.status(400).json({ message: "Include quiz id" })
		}
		const result = await pool.query("SELECT * FROM scores WHERE quiz_id = $1 AND email = $2", [
			quiz_id,
			res.locals.user.email,
		])
		if (result.rows.length) {
			return res.json({ score: result.rows[0].score })
		}
		const result2 = await pool.query("SELECT sheet_url FROM quizzes WHERE quiz_id = $1", [quiz_id])

		const sheet_url = result2.rows[0].sheet_url!
		if (!sheet_url) {
			return res.status(400).json({ message: "Quiz not found" })
		}
		const gid: string = sheet_url.split("gid=")[1]

		const doc = new GoogleSpreadsheet(config.SPREADSHEET_ID!)
		await doc.useServiceAccountAuth({
			client_email: config.CLIENT_EMAIL!,
			private_key: config.GOOGLE_PRIVATE_KEY!,
		})

		await doc.loadInfo()

		const sheet = doc.sheetsById[gid]
		const rawRows = await sheet.getRows()
		if (!rawRows.length) {
			throw new Error("Quiz answer not found.")
		}
		const rows = rawRows
			.map(row => row._rawData)
			.filter(arr => arr.length)
			.map(row =>
				row.map((cell: any) => {
					if (cell[0] === "`") {
						cell = cell.split("`,").map((word: string) => word.replaceAll("`", "").trim())
					}
					return cell
				}),
			)

		const ansRow = [0, ...rows[0]]
		const studentRow = rows.filter(row => row[1] === res.locals.user.email)[0]
		if (!studentRow) {
			return res.status(404).json({ message: "Quiz not found." })
		}

		studentRow.unshift(0)
		for (let i = 4; i < studentRow.length; i++) {
			// Single answer
			if (typeof studentRow[i] === "string") {
				if (studentRow[i] === ansRow[i]) {
					studentRow[0] = studentRow[0] + 1
				}
			}
			// Multiple answer
			else {
				let correctAnsCount = 0
				studentRow[i].forEach((option: string) => {
					ansRow[i].forEach((corrOpton: string) => {
						if (option === corrOpton) {
							correctAnsCount++
						}
					})
				})
				if (correctAnsCount === 0 || studentRow[i].length > 4) {
					continue
				}
				// General check for 2 points
				if (ansRow[i].length === studentRow[i].length && ansRow[i].length === correctAnsCount) {
					studentRow[0] = studentRow[0] + 2
					continue
				}
				if (ansRow[i].length === 1) {
					if (correctAnsCount === 1 && studentRow[i].length === 2) {
						studentRow[0] = studentRow[0] + 1
						continue
					}
				} else if (ansRow[i].length == 2) {
					if (correctAnsCount == 1 && (studentRow[i].length === 1 || studentRow[i].length === 2)) {
						studentRow[0] = studentRow[0] + 1
						continue
					}
					if (correctAnsCount == 2 && studentRow[i].length === 3) {
						studentRow[0] = studentRow[0] + 1
						continue
					}
				} else if (ansRow[i].length === 3) {
					if (
						(correctAnsCount === 2 && studentRow[i].length === 3) ||
						(correctAnsCount === 3 && studentRow[i].length === 4)
					) {
						studentRow[0] = studentRow[0] + 1
						continue
					}
				}
			}
		}
		await pool.query("INSERT INTO scores (email, quiz_id, score) VALUES ($1, $2, $3)", [
			res.locals.user.email,
			quiz_id,
			studentRow[0],
		])

		res.json(studentRow[0])
	} catch (error) {
		console.log("/quiz/score GET", error)
		res.status(500).json({ message: "Something went wrong. Try again!" })
	}
})

export { router as quizRouter }
