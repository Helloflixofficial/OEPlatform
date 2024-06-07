import type { NextApiRequest, NextApiResponse } from "next";
import { query } from "../utils/db";

type Data = {
  id: number;
  name: string;
}[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const result = await query("SELECT * FROM users");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error querying database", error);
    res.status(500).end();
  }
}
