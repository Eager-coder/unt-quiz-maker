import * as React from "react"

interface Context {
	profile: {
		name: string | null
		email: string | null
		isLoggedIn: boolean
		isLoading: boolean
		picture: string | null
		isAdmin: boolean
	}

	setProfile: (context: any) => void
}
const context: Context = {
	profile: {
		name: null,
		email: null,
		isLoggedIn: false,
		isLoading: true,
		picture: null,
		isAdmin: false,
	},

	setProfile: (context: Context) => {},
}
const AppCtx = React.createContext<Context>(context)

export default AppCtx
