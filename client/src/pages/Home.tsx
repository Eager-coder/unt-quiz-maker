export default function Home() {
	return (
		<div>
			{/* <h1 className="text-4xl">Home</h1> */}
			<div className="md:flex justify-between">
				<div className="self-center">
					<h1 className="lg:text-5xl md:text-4xl">Make UNT practice easier</h1>
					<p className="lg:text-xl md:text-base">
						Easily create and take quizzes that are seamlessly integreated with Google Forms and Speradsheets.
					</p>
				</div>
				<img className="md:w-2/5 w-4/5 mx-auto" src="hero.svg" alt="" />
			</div>
		</div>
	)
}
