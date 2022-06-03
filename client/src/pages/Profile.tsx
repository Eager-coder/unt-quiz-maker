import axios from "axios"
import React, { FC, useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import AppCtx from "../Context"

interface Quiz {
	quiz_id: string
	quiz_subject: string
	quiz_url: string
	title: string
	created_at: string
	score: number | null
}

const Profile = () => {
	const { profile } = useContext(AppCtx)
	const [isLoading, setIsLoading] = useState(true)
	const [quizzes, setQuizzes] = useState<Quiz[]>([])
	const navigate = useNavigate()
	useEffect(() => {
		if (!profile.isLoading && !profile.isLoggedIn) {
			navigate("/")
		}
	}, [profile])

	useEffect(() => {
		axios.get("/api/user/quiz/score/all", { withCredentials: true }).then(({ data }) => {
			console.log(data)
			setQuizzes(data)
			setIsLoading(false)
		})
	}, [])
	return (
		<div>
			<h1>Profile</h1>
			<h2>Your quizzes</h2>
			{quizzes.length && !isLoading ? (
				<table className="table w-full">
					<thead>
						<tr>
							<th>#</th>
							<th>Title</th>
							<th>Subject</th>
							<th>Link</th>
							<th>Date added</th>
							<th>Score</th>
						</tr>
					</thead>
					<tbody>
						{quizzes.map((quiz, index) => (
							<QuizRow quiz={quiz} rowCount={index + 1} key={quiz.quiz_id} />
						))}
					</tbody>
				</table>
			) : (
				"No data"
			)}
		</div>
	)
}

const QuizRow: FC<{ quiz: Quiz; rowCount: number }> = ({ quiz, rowCount }) => {
	const [isLoading, setIsLoading] = useState(false)
	const [score, setScore] = useState(quiz.score)
	const getScore = async () => {
		try {
			setIsLoading(true)
			const res = await axios.get(`/api/user/quiz/score?quiz_id=${quiz.quiz_id}`, {
				withCredentials: true,
			})
			console.log("data: ", res.data)
			setScore(res.data)
		} catch (error) {
			console.log(error)
		} finally {
			setIsLoading(false)
		}
	}
	return (
		<tr key={quiz.quiz_id}>
			<th>{rowCount}</th>
			<td>{quiz.title}</td>
			<td>{quiz.quiz_subject}</td>
			<td className="block text-blue-500 max-w-sm">
				<div className="max-w-sm">
					<a className="block break-words w-full" href={quiz.quiz_url} target="_blank">
						Link
					</a>
				</div>
			</td>
			<td>{new Date(Number(quiz.created_at)).toLocaleString()}</td>
			<td>
				{<span className="bg-cyan-100 py-1 px-4 font-semibold rounded-lg">{score}</span> || (
					<div>
						<span className="block">No score</span>
						<button disabled={isLoading} onClick={getScore} className="btn btn-xs">
							Update
						</button>
					</div>
				)}
			</td>
		</tr>
	)
}

export default Profile
