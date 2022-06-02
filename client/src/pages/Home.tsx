import React, { FC, useEffect } from "react"
import { Hero } from "react-daisyui"

export default function Home() {
	return (
		<div>
			{/* <h1 className="text-4xl">Home</h1> */}
			<div className="flex justify-between">
				<div className="self-center">
					<h1 className="text-5xl">Make UNT practice easier</h1>
					<p className="text-xl">
						Easily create and take quizzes that is seamlessly integreated with Google Forms and Speradsheets.
					</p>
				</div>
				<img className="w-2/5" src="hero.svg" alt="" />
			</div>
		</div>
	)
}
