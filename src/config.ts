import findConfig from "find-config"
import dotenv from "dotenv"

dotenv.config({ path: findConfig(".env")! })

const config = {
	PG_URI: process.env.PG_URI!,
	CLIENT_EMAIL: process.env.CLIENT_EMAIL!,
	SPREADSHEET_ID: process.env.SPREADSHEET_ID!,
	GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY!,
	CLIENT_ID: process.env.CLIENT_ID!,
	CLIENT_SECRET: process.env.CLIENT_SECRET!,
	GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN!,
	ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET!,
	PORT: process.env.PORT!,
}
export default config
