import { Pool } from "pg";

const pool = new Pool({
  user: "sharmaji",
  host: "localhost",
  database: "postgresql",
  password: "sharmaji",
  port: 5432,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
