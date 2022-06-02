import axios from "axios"
import React, { FC, useEffect, useState } from "react"
import { Button, Modal } from "react-daisyui"

interface Quiz {
	quiz_id: string
	quiz_subject: string
	quiz_url: string
	created_at: string
	title: string
}

interface QuizResults extends Quiz {
	data?: [
		{
			email: string
			fullname: string
			avatar: string
			score: number
		},
	]
	isLoading: boolean
}

const QuizList: FC<{ quizzes: { isLoading: boolean; data: Quiz[] }; getQuizzes: () => Promise<any> }> = ({
	quizzes,
	getQuizzes,
}) => {
	const getStudentResults = async (quiz: Quiz) => {
		try {
			setStudentResults({ ...quiz, isLoading: true })

			const { data } = await axios.get(`/api/admin/quiz/scores?quiz_id=${quiz.quiz_id}`, {
				withCredentials: true,
			})
			console.log(data)
			setStudentResults({ ...quiz, data, isLoading: false })
		} catch (error) {
			console.log(error)
		}
	}
	const [visible, setVisible] = useState(false)
	const [studentResults, setStudentResults] = useState<QuizResults | null>(null)
	const [deleteModalVisible, setDeleteModalVisible] = useState(false)
	const [deleteLoading, setDeleteLoading] = useState(false)
	const toggleVisible = () => {
		setVisible(!visible)
	}
	const getScores = async (quiz_id: string) => {
		try {
			await axios.put(`/api/admin/quiz/scores?quiz_id=${quiz_id}`, null, {
				withCredentials: true,
			})
			await getStudentResults(studentResults!)
		} catch (error) {
			console.log(error)
		}
	}
	const deleteQuiz = async (quiz_id: string) => {
		try {
			setDeleteLoading(true)
			await axios.delete(`/api/admin/quiz?quiz_id=${quiz_id}`, { withCredentials: true })
			await getQuizzes()
			setDeleteLoading(false)
			setDeleteModalVisible(false)
		} catch (error) {
			console.log(error)
			setDeleteLoading(false)
		}
	}
	return (
		<div>
			<h2>All Quizzes</h2>
			{quizzes.isLoading ? (
				<progress className="progress w-56"></progress>
			) : (
				<table className="table w-full">
					<thead>
						<tr>
							<th>#</th>
							<th>Title</th>
							<th>Subject</th>
							<th>Link</th>
							<th>Date added</th>
							{/* <th>Is open</th> */}
						</tr>
					</thead>
					<tbody>
						{quizzes.data.map((quiz, index) => (
							<tr key={quiz.quiz_id}>
								<th>{index + 1}</th>
								<td
									className="cursor-pointer font-bold"
									onClick={() => {
										setVisible(true)
										getStudentResults(quiz)
									}}>
									{quiz.title}
								</td>
								<td>{quiz.quiz_subject}</td>
								<td className="text-blue-500">
									<a className="max-w-xs overflow-hidden block" href={quiz.quiz_url} target="_blank">
										{quiz.quiz_url}
									</a>
								</td>
								<td>{new Date(Number(quiz.created_at)).toLocaleString()}</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
			<Modal open={deleteModalVisible} onClickBackdrop={() => setDeleteModalVisible(prev => !prev)}>
				<Modal.Header>Delete {studentResults?.title}?</Modal.Header>

				<Modal.Actions>
					<Button
						disabled={deleteLoading}
						onClick={() => setDeleteModalVisible(false)}
						className="btn btn-outline btn-sm">
						Calcel
					</Button>
					<Button
						onClick={() => deleteQuiz(studentResults?.quiz_id!)}
						disabled={deleteLoading}
						className="btn btn-error btn-sm">
						Delete
					</Button>
				</Modal.Actions>
			</Modal>
			<Modal open={visible} onClickBackdrop={toggleVisible}>
				<Modal.Header className="flex justify-between items-end">
					{studentResults?.title}
					<Button
						onClick={() => {
							setVisible(false)
							setDeleteModalVisible(true)
						}}
						className="btn-error btn-outline btn-xs">
						Delete
					</Button>
				</Modal.Header>

				<Modal.Body>
					{studentResults?.isLoading ? (
						"Loading..."
					) : (
						<table>
							<thead>
								<tr>
									<th>Name</th>
									<th>Email</th>
									<th>Score</th>
								</tr>
							</thead>
							<tbody>
								{studentResults?.data?.map(res => (
									<tr key={res.email}>
										<td>{res.fullname}</td>
										<td>{res.email}</td>
										<td>{res.score}</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</Modal.Body>
				<Modal.Actions>
					<Button onClick={() => getScores(studentResults?.quiz_id!)} className="btn-accent">
						Refresh
					</Button>
					<Button onClick={toggleVisible}>Close</Button>
				</Modal.Actions>
			</Modal>
		</div>
	)
}

export default QuizList
