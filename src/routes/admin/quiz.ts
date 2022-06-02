import { Router } from "express"
import { GoogleSpreadsheet } from "google-spreadsheet"
import { verifyAdmin, verifyAuth } from "../../middlewares/auth"
import pool from "../../db"
import crypto from "crypto"
import format from "pg-format"
import config from "../../config"

const router = Router()

router.post("/", verifyAuth, verifyAdmin, async (req, res) => {
	try {
		const { quiz_url, quiz_subject, sheet_url, title } = req.body

		await pool.query(
			"INSERT INTO quizzes (quiz_id, sheet_url, quiz_subject, quiz_url, title, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
			[crypto.randomUUID(), sheet_url, quiz_subject, quiz_url, title, Date.now()],
		)
		res.json({ message: "Quiz added!" })
	} catch (error) {
		console.log("/quiz post", error)
		res.status(500).json({ message: "Something went wrong. Try again." })
	}
})
router.get("/", verifyAuth, verifyAdmin, async (req, res) => {
	try {
		const { rows } = await pool.query("SELECT * FROM quizzes WHERE is_deleted = FALSE ORDER BY created_at")
		res.json(rows)
	} catch (error) {
		res.status(500).json({ message: "Something went wrong. Try again." })
	}
})

router.get("/scores", verifyAuth, verifyAdmin, async (req, res) => {
	try {
		const { quiz_id } = req.query

		const { rows } = await pool.query(
			`
		SELECT users.fullname, users.email, users.picture, 
		scores.score FROM scores LEFT JOIN users ON users.email = scores.email
		WHERE scores.quiz_id = $1
		`,
			[quiz_id],
		)
		console.log(rows)
		res.json(rows)
	} catch (error) {
		console.log("/admin/quiz/scores GET", error)

		res.status(500).json({ message: "Something went wrong. Try again." })
	}
})

router.delete("/", verifyAuth, verifyAdmin, async (req, res) => {
	try {
		const { quiz_id } = req.query
		if (!quiz_id) {
			return res.status(400).json({ message: "Quiz id not provided" })
		}
		await pool.query("UPDATE quizzes SET is_deleted = TRUE WHERE quiz_id = $1", [quiz_id])
		res.json({ message: "Quiz deleted" })
	} catch (error) {
		console.log("/admin/quiz/ DELETE", error)
		res.status(500).json({ message: "Something went wrong. Try again." })
	}
})

router.put("/scores", verifyAuth, verifyAdmin, async (req, res) => {
	try {
		const { quiz_id } = req.query
		if (!quiz_id) {
			return res.status(400).json({ message: "Quiz id not provided" })
		}
		const result = await pool.query("SELECT sheet_url FROM quizzes WHERE quiz_id = $1 AND is_deleted = FALSE", [
			quiz_id,
		])

		const sheet_url = result.rows[0].sheet_url!
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
			.map(row => {
				row.unshift(0)
				return row.map((cell: any) => {
					if (cell[0] === "`") {
						cell = cell.split("`,").map((word: string) => word.replaceAll("`", "").trim())
					}
					return cell
				})
			})
		const ansRow = rows[0]

		for (let studentRow of rows) {
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
		}
		const scores = rows.map((row: any) => [quiz_id, row[2], row[0]])

		await pool.query(
			format(
				`INSERT INTO scores (quiz_id, email, score) VALUES %L 
				ON CONFLICT (email, quiz_id) DO NOTHING`,
				scores,
			),
		)
		res.json({ message: "Updated" })
	} catch (error) {
		console.log("/admin/quiz/scores PUT", error)

		res.status(500).json({ message: "Something went wrong. Try again." })
	}
})
/*
router.get("/", async (req, res) => {
	await doc.useServiceAccountAuth({
		client_email: config.CLIENT_EMAIL!,
		private_key: config.GOOGLE_PRIVATE_KEY!,
	})

	await doc.loadInfo()

	const sheet = doc.sheetsByIndex[0]
	const rawRows = await sheet.getRows()
	const rows = rawRows
		.map(row => row._rawData)
		.filter(arr => arr.length)
		.map(row =>
			row.map((cell: any) => {
				cell = cell.split("`,").map((word: string) => word.replaceAll("`", "").trim())
				if (cell.length === 1) {
					cell = cell[0]
				}
				return cell
			}),
		)

	const ansRow = rows[0]
	rows.forEach(row => {
		// row.points = 0
		row.unshift(0)
		for (let i = 4; i < row.length; i++) {
			// Single answer
			if (typeof row[i] === "string") {
				if (row[i] === ansRow[i]) {
					// row.points++
					row[0] = row[0] + 1
				}
			}
			// Multiple answer
			else {
				let correctAnsCount = 0
				row[i].forEach((option: string) => {
					ansRow[i].forEach((corrOpton: string) => {
						if (option === corrOpton) {
							correctAnsCount++
						}
					})
				})
				if (correctAnsCount === 0 || row[i].length > 4) {
					continue
				}
				// General check for 2 points
				if (ansRow[i].length === row[i].length && ansRow[i].length === correctAnsCount) {
					// row.points += 2
					row[0] = row[0] + 2
					continue
				}
				if (ansRow[i].length === 1) {
					if (correctAnsCount === 1 && row[i].length === 2) {
						// row.points++
						row[0] = row[0] + 1
						continue
					}
				} else if (ansRow[i].length == 2) {
					if (correctAnsCount == 1 && (row[i].length === 1 || row[i].length === 2)) {
						// row.points++
						row[0] = row[0] + 1
						continue
					}
					if (correctAnsCount == 2 && row[i].length === 3) {
						// row.points++
						row[0] = row[0] + 1
						continue
					}
				} else if (ansRow[i].length === 3) {
					if ((correctAnsCount === 2 && row[i].length === 3) || (correctAnsCount === 3 && row[i].length === 4)) {
						// row.points++
						row[0] = row[0] + 1
						continue
					}
				}
			}
		}
	})
	console.log(rows)

	res.json(rows)
})
*/

export { router as quizRouter }
