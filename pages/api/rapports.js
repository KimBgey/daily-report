import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const sql = neon(process.env.DATABASE_URL);
    const rapports = await sql`
      SELECT * FROM rapports
      ORDER BY created_at DESC
      LIMIT 200
    `;
    return res.status(200).json({ success: true, rapports });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
