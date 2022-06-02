import React, { FC, useState } from "react"
import cn from "classnames"
import axios from "axios"

const AddQuizForm: FC<{ getQuizzes: () => void }> = ({ getQuizzes }) => {
	const [quiz, setQuiz] = useState({ quiz_subject: "math", quiz_url: "", sheet_url: "", title: "" })
	const [isLoading, setIsLoading] = useState(false)
	const [message, setMessage] = useState<{ isError: boolean; text: string | null }>({ isError: false, text: null })
	const handleSubmit = async () => {
		try {
			if (!quiz.quiz_subject || !quiz.quiz_url || !quiz.title) {
				return setMessage({ isError: true, text: "Please fill all the fields!" })
			}
			setIsLoading(true)

			await axios.post("/api/admin/quiz", quiz, {
				withCredentials: true,
			})
			setIsLoading(false)

			setMessage({ isError: false, text: "Quiz added!" })
			setQuiz({ quiz_subject: "math", quiz_url: "", sheet_url: "", title: "" })
			getQuizzes()
		} catch (error) {
			console.log(error)
			setMessage({ isError: false, text: "Something went wrong" })
		}
	}
	return (
		<div className="">
			<h2>Add a new quiz</h2>
			<div className="flex flex-col w-full lg:flex-row">
				<div className="flex flex-grow card bg-base-300 rounded-box place-items-center p-4 gap-y-4">
					<div className="w-full flex gap-4">
						<div className="w-1/2">
							<select
								className="select select-bordered w-full"
								name="quiz"
								id=""
								defaultValue={quiz.quiz_subject}
								onChange={e => setQuiz(prev => ({ ...prev, quiz_subject: e.target.value }))}>
								<option value="math">Math</option>
								<option value="history">History</option>
								<option value="english">English</option>
							</select>
						</div>
						<div className="w-1/2">
							<input
								className="input input-bordered w-full"
								type="text"
								placeholder="Title"
								value={quiz.title}
								onChange={e => setQuiz(prev => ({ ...prev, title: e.target.value }))}
							/>
						</div>
					</div>
					<div className="w-full flex gap-4">
						<div className="w-1/2">
							<input
								className="input input-bordered w-full"
								type="text"
								placeholder="Quiz link"
								value={quiz.quiz_url}
								onChange={e => setQuiz(prev => ({ ...prev, quiz_url: e.target.value }))}
							/>
						</div>
						<div className="w-1/2">
							<input
								className="input input-bordered w-full"
								type="text"
								placeholder="Sheet link"
								value={quiz.sheet_url}
								onChange={e => setQuiz(prev => ({ ...prev, sheet_url: e.target.value }))}
							/>
						</div>
					</div>
					<button className="btn mb-4 w-1/5 self-start" onClick={handleSubmit} disabled={isLoading}>
						Add
					</button>
				</div>
			</div>

			{message.text && (
				<div className={cn("alert shadow-lg", { "alert-success": !message.isError, "alert-error": message.isError })}>
					{message.text}
				</div>
			)}
		</div>
	)
}

export default AddQuizForm
