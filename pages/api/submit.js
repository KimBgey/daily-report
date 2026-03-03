import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { nom, work, good, bad, learned, tomorrow } = req.body;

  if (!nom || !work || !good || !bad || !learned || !tomorrow) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  try {
    // 1. Sauvegarde dans Neon
    const sql = neon(process.env.DATABASE_URL);
    await sql`
      INSERT INTO rapports (nom, work, good, bad, learned, tomorrow)
      VALUES (${nom}, ${work}, ${good}, ${bad}, ${learned}, ${tomorrow})
    `;

    // 2.canal DM avec le boss
    const BOSS_SLACK_ID = "U0AJC9AJFT3";
    const DASHBOARD_URL = "https://daily-report-lemon.vercel.app/dashboard";
    const message = `📥 *${nom}* vient de soumettre son rapport !\n\n📋 ${work}\n\n🔗 ${DASHBOARD_URL}`;

    const openRes = await fetch("https://slack.com/api/conversations.open", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.SLACK_TOKEN}`
      },
      body: JSON.stringify({ users: BOSS_SLACK_ID })
    });
    const openData = await openRes.json();
    console.log("Open DM:", JSON.stringify(openData));

    if (openData.ok) {
      const slackRes = await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.SLACK_TOKEN}`
        },
        body: JSON.stringify({ channel: openData.channel.id, text: message, mrkdwn: true })
      });
      const slackData = await slackRes.json();
      console.log("Slack response:", JSON.stringify(slackData));
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}