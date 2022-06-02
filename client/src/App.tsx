import { useEffect, useState } from "react"
import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Admin from "./pages/Admin"
import { GoogleOAuthProvider } from "@react-oauth/google"
import AppCtx from "./Context"
import Profile from "./pages/Profile"
import Navbar from "./components/Navbar"
import axios from "axios"
function App() {
	const [profile, setProfile] = useState({
		name: null,
		email: null,
		isLoggedIn: false,
		isLoading: true,
		picture: null,
		isAdmin: false,
	})
	const getProfile = async () => {
		try {
			const { data } = await axios.get("/api/user/profile", { withCredentials: true })
			const { email, name, picture, is_admin } = data
			setProfile({ isAdmin: is_admin, name, email, picture, isLoading: false, isLoggedIn: true })
		} catch (error) {
			console.log(error)
			setProfile({ ...profile, isLoading: false })
		}
	}
	useEffect(() => {
		getProfile()
	}, [])
	return (
		<GoogleOAuthProvider clientId="132012283465-a8vs553bfm1g3241pr80dg2ehsktcndv.apps.googleusercontent.com">
			<AppCtx.Provider value={{ profile, setProfile }}>
				<div className="App max-w-none">
					<Navbar />
					<main className="max-w-5xl px-6 mx-auto prose">
						<Routes>
							<Route path="/" element={<Home />} />
							<Route path="/admin" element={<Admin />} />
							<Route path="/profile" element={<Profile />} />
						</Routes>
					</main>
				</div>
			</AppCtx.Provider>
		</GoogleOAuthProvider>
	)
}

export default App
