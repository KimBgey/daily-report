import { neon } from "@neondatabase/serverless";

const MEMBRES = {
  U0AJ3BMRAPN: "André",
  U0AHW68A4R3: "Djoni",
  U0AJ3810R4L: "Aristide",
};

const BOSS_SLACK_ID = "U0AHW68A4R3"; // à remplacer par le vrai ID du boss
const SLACK_TOKEN = process.env.SLACK_TOKEN;
const DASHBOARD_URL = "https://daily-report-lemon.vercel.app/dashboard";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId, work, good, bad, learned, tomorrow } = req.body;

  if (!userId || !work || !good || !bad || !learned || !tomorrow) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  const nom = MEMBRES[userId] || "Inconnu";

  try {
    // 1. Sauvegarde dans Neon
    const sql = neon(process.env.DATABASE_URL);
    await sql`
      INSERT INTO rapports (user_id, nom, work, good, bad, learned, tomorrow)
      VALUES (${userId}, ${nom}, ${work}, ${good}, ${bad}, ${learned}, ${tomorrow})
    `;

    // 2. Notification Slack au boss
    const message = `📥 *${nom}* vient de soumettre son rapport journalier !\n\n📋 ${work}\n\nConsulte tous les rapports ici :\n🔗 ${DASHBOARD_URL}`;

    await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SLACK_TOKEN}`
      },
      body: JSON.stringify({ channel: BOSS_SLACK_ID, text: message, mrkdwn: true })
    });

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}