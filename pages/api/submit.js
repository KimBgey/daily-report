import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { nom, work, good, bad, learned, tomorrow } = req.body;

  if (!nom || !work || !good || !bad || !learned || !tomorrow) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    await sql`
      INSERT INTO rapports (nom, work, good, bad, learned, tomorrow)
      VALUES (${nom}, ${work}, ${good}, ${bad}, ${learned}, ${tomorrow})
    `;

    // Notification Slack au boss
    const BOSS_SLACK_ID = "D0AHSUTK49Z";
    const DASHBOARD_URL = "https://daily-report-lemon.vercel.app/dashboard";
    const message = `📥 *${nom}* vient de soumettre son rapport !\n\n📋 ${work}\n\n🔗 ${DASHBOARD_URL}`;

    await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.SLACK_TOKEN}`
      },
      body: JSON.stringify({ channel: BOSS_SLACK_ID, text: message, mrkdwn: true })
    });

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}