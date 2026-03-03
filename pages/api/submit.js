import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { nom, built, working, validated, notWorking, toLearn, learned, tomorrow } = req.body;

  if (!nom || !built || !working || !notWorking || !learned || !tomorrow) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    await sql`
      INSERT INTO rapports (nom, work, good, bad, learned, tomorrow, built, working, validated, not_working, to_learn)
      VALUES (${nom}, ${built}, ${working}, ${notWorking}, ${learned}, ${tomorrow}, ${built}, ${working}, ${validated || ""}, ${notWorking}, ${toLearn || ""})
    `;

    // Notification Slack au boss
    const BOSS_SLACK_ID = process.env.BOSS_SLACK_ID;
    const DASHBOARD_URL = "https://daily-report-lemon.vercel.app/dashboard";
    const message = `📥 *${nom}* vient de soumettre son rapport !\n\n🔨 ${built}\n\n🔗 ${DASHBOARD_URL}`;

    const openRes = await fetch("https://slack.com/api/conversations.open", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.SLACK_TOKEN}`
      },
      body: JSON.stringify({ users: BOSS_SLACK_ID })
    });
    const openData = await openRes.json();

    if (openData.ok) {
      await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.SLACK_TOKEN}`
        },
        body: JSON.stringify({ channel: openData.channel.id, text: message, mrkdwn: true })
      });
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}