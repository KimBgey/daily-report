import { useState, useEffect } from "react";
import Head from "next/head";

export default function Dashboard() {
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtreMembre, setFiltreMembre] = useState("tous");
  const [filtreDate, setFiltreDate] = useState("");

  useEffect(() => { fetchRapports(); }, []);

  async function fetchRapports() {
    setLoading(true);
    const res = await fetch("/api/rapports");
    const data = await res.json();
    setRapports(data.rapports || []);
    setLoading(false);
  }

  const membres = ["tous", ...new Set(rapports.map(r => r.nom))];
  const dates = [...new Set(rapports.map(r => new Date(r.created_at).toLocaleDateString("fr-FR")))];

  const filtered = rapports.filter(r => {
    const matchMembre = filtreMembre === "tous" || r.nom === filtreMembre;
    const matchDate = !filtreDate || new Date(r.created_at).toLocaleDateString("fr-FR") === filtreDate;
    return matchMembre && matchDate;
  });

  const today = new Date().toLocaleDateString("fr-FR");
  const rapportsAujourdhui = rapports.filter(r => new Date(r.created_at).toLocaleDateString("fr-FR") === today);

  return (
    <>
      <Head>
        <title>Dashboard — Rapports Journaliers</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <div style={styles.page}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>📊 Rapports Journaliers</h1>
            <p style={styles.subtitle}>Vue d'ensemble de l'équipe</p>
          </div>
          <div style={styles.statsRow}>
            <div style={styles.statCard}>
              <span style={styles.statNum}>{rapportsAujourdhui.length}</span>
              <span style={styles.statLabel}>Aujourd'hui</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statNum}>{rapports.length}</span>
              <span style={styles.statLabel}>Total</span>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div style={styles.filtres}>
          <select style={styles.select} value={filtreMembre} onChange={e => setFiltreMembre(e.target.value)}>
            {membres.map(m => <option key={m} value={m}>{m === "tous" ? "👥 Tous les membres" : `👤 ${m}`}</option>)}
          </select>
          <select style={styles.select} value={filtreDate} onChange={e => setFiltreDate(e.target.value)}>
            <option value="">📅 Toutes les dates</option>
            {dates.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <button style={styles.refreshBtn} onClick={fetchRapports}>🔄 Actualiser</button>
        </div>

        {/* Rapports */}
        {loading ? (
          <div style={styles.loading}>Chargement...</div>
        ) : filtered.length === 0 ? (
          <div style={styles.empty}>Aucun rapport trouvé.</div>
        ) : (
          <div style={styles.grid}>
            {filtered.map(r => (
              <div key={r.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <span style={styles.nomBadge}>👤 {r.nom}</span>
                    <span style={styles.dateBadge}>{new Date(r.created_at).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <span style={styles.heure}>{new Date(r.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <div style={styles.cardBody}>
                  <RapportItem emoji="📋" label="Travail du jour" value={r.work} color="#6366f1" />
                  <RapportItem emoji="✅" label="Bien passé" value={r.good} color="#10b981" />
                  <RapportItem emoji="❌" label="Mal passé" value={r.bad} color="#ef4444" />
                  <RapportItem emoji="💡" label="Appris" value={r.learned} color="#f59e0b" />
                  <RapportItem emoji="🎯" label="Demain" value={r.tomorrow} color="#3b82f6" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function RapportItem({ emoji, label, value, color }) {
  return (
    <div style={styles.rapportItem}>
      <span style={{ ...styles.rapportEmoji, color }}>{emoji}</span>
      <div>
        <span style={styles.rapportLabel}>{label}</span>
        <p style={styles.rapportValue}>{value}</p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#faf9f7", padding: "32px 24px", fontFamily: "'DM Sans', sans-serif", maxWidth: 1100, margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16 },
  title: { fontFamily: "'DM Serif Display', serif", fontSize: 32, color: "#111827", margin: 0 },
  subtitle: { color: "#6b7280", fontSize: 14, margin: "6px 0 0" },
  statsRow: { display: "flex", gap: 12 },
  statCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "12px 20px", textAlign: "center", minWidth: 80 },
  statNum: { display: "block", fontSize: 28, fontWeight: 700, color: "#111827" },
  statLabel: { fontSize: 12, color: "#6b7280" },
  filtres: { display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" },
  select: { padding: "10px 16px", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: "#fff", color: "#374151", cursor: "pointer" },
  refreshBtn: { padding: "10px 16px", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: "#fff", cursor: "pointer", color: "#374151" },
  loading: { textAlign: "center", color: "#6b7280", padding: 48 },
  empty: { textAlign: "center", color: "#6b7280", padding: 48 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))", gap: 20 },
  card: { background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" },
  cardHeader: { padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" },
  nomBadge: { fontWeight: 600, fontSize: 15, color: "#111827", marginRight: 10 },
  dateBadge: { background: "#f3f4f6", color: "#6b7280", fontSize: 12, padding: "3px 10px", borderRadius: 20 },
  heure: { color: "#9ca3af", fontSize: 13 },
  cardBody: { padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 },
  rapportItem: { display: "flex", gap: 12, alignItems: "flex-start" },
  rapportEmoji: { fontSize: 18, marginTop: 2 },
  rapportLabel: { fontSize: 12, color: "#6b7280", fontWeight: 500 },
  rapportValue: { margin: "2px 0 0", fontSize: 14, color: "#374151", lineHeight: 1.5 },
};
