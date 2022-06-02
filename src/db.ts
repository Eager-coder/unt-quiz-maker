import { Pool } from "pg"
import config from "./config"

const pool = new Pool({ connectionString: config.PG_URI, min: 2, max: 5 })

export default pool
