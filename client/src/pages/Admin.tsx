import axios from "axios"
import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import AddQuizForm from "../components/admin/AddQuizForm"
import QuizList from "../components/admin/QuizList"
import AppCtx from "../Context"

const Admin = () => {
	const context = useContext(AppCtx)
	const navigate = useNavigate()

	const [quizzes, setQuizzes] = useState({ isLoading: true, data: [] })
	const getQuizzes = async () => {
		const { data } = await axios.get("/api/admin/quiz", { withCredentials: true })
		setQuizzes({ isLoading: false, data })
	}
	useEffect(() => {
		if (!context?.profile.isLoading && !context?.profile.isAdmin) {
			navigate("/")
		}
	}, [context])
	useEffect(() => {
		getQuizzes()
	}, [])

	if (context?.profile.isLoading) return <div>Loading...</div>
	return (
		<div className="">
			<h1>Admin Page</h1>
			<AddQuizForm getQuizzes={getQuizzes} />
			<QuizList quizzes={quizzes} getQuizzes={getQuizzes} />
		</div>
	)
}

export default Admin
