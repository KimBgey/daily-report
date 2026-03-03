import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  const { q } = req.query;
  if (!q) return res.status(200).json({ names: [] });

  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`
      SELECT DISTINCT nom FROM rapports
      WHERE nom ILIKE ${"%" + q + "%"}
      ORDER BY nom ASC
      LIMIT 5
    `;
    return res.status(200).json({ names: rows.map(r => r.nom) });
  } catch (e) {
    return res.status(200).json({ names: [] });
  }
}