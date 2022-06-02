import { useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import AppCtx from "../Context"
import { useGoogleLogout, useGoogleLogin } from "react-google-login"
import axios from "axios"

const Navbar = () => {
	const { profile, setProfile } = useContext(AppCtx)
	let navigate = useNavigate()
	const logout = async () => {
		await axios.delete("/api/auth", { withCredentials: true })
		setProfile({ name: null, email: null, isLoggedIn: false, isLoading: false, picture: null })
		navigate("/login")
	}
	const responseGoogle = async (code: any) => {
		const { data } = await axios.post("/api/auth", code, {
			withCredentials: true,
		})
		setProfile({
			name: data.name,
			email: data.email,
			isLoggedIn: true,
			isLoading: false,
			isAdmin: data.is_admin,
			picture: data.picture,
		})
		navigate("/")
	}
	const { signOut } = useGoogleLogout({
		clientId: "132012283465-a8vs553bfm1g3241pr80dg2ehsktcndv.apps.googleusercontent.com",
		onLogoutSuccess: logout,
		onFailure: () => console.log("Sign out failure"),
	})
	const { signIn, loaded } = useGoogleLogin({
		clientId: "132012283465-a8vs553bfm1g3241pr80dg2ehsktcndv.apps.googleusercontent.com",
		onSuccess: responseGoogle,
		onFailure: res => console.log(res),
		responseType: "code",
		prompt: "consent",
	})

	return (
		<nav className="navbar max-w-5xl mx-auto bg-base-100">
			<div className="flex-1">
				<Link to="/" className="btn btn-ghost normal-case text-xl">
					Home
				</Link>
			</div>
			{profile.isLoading ? (
				"..."
			) : (
				<>
					{profile.isLoggedIn ? (
						<div className="flex-none gap-2">
							<div className="dropdown dropdown-end">
								<label tabIndex={0} className="btn btn-ghost btn-circle avatar">
									<div className="w-10 rounded-full">
										<img src={profile.picture!} />
									</div>
								</label>
								<ul
									tabIndex={0}
									className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52 no-underline">
									<li>
										<Link to={profile.isAdmin ? "/admin" : "/profile"} className="no-underline">
											{profile.isAdmin ? "Dashboard" : "Profile"}
										</Link>
									</li>
									<li>
										<a onClick={signOut} className="no-underline">
											Logout
										</a>
									</li>
								</ul>
							</div>
						</div>
					) : (
						<button onClick={signIn} disabled={!loaded}>
							Login
						</button>
					)}
				</>
			)}
		</nav>
	)
}

export default Navbar
