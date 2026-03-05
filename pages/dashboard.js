import { useState, useEffect } from "react";
import Head from "next/head";

export default function Dashboard() {
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtreMembre, setFiltreMembre] = useState("tous");
  const [filtreDate, setFiltreDate] = useState("");
  const [selected, setSelected] = useState(null);

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
  const today = new Date().toLocaleDateString("fr-FR");

  const filtered = rapports.filter(r => {
    const matchMembre = filtreMembre === "tous" || r.nom === filtreMembre;
    const matchDate = !filtreDate || new Date(r.created_at).toLocaleDateString("fr-FR") === filtreDate;
    return matchMembre && matchDate;
  });

  const rapportsAujourdhui = rapports.filter(r =>
    new Date(r.created_at).toLocaleDateString("fr-FR") === today
  );

  return (
    <>
      <Head>
        <title>Dashboard — Rapports Journaliers</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <div style={s.page}>

        {/* Sidebar */}
        <div style={s.sidebar}>
          <div style={s.logo}>Rapports<br /><span style={s.logoSub}>Journaliers</span></div>

          <div style={s.sideSection}>
            <p style={s.sideLabel}>Membres</p>
            {membres.map(m => (
              <button
                key={m}
                onClick={() => setFiltreMembre(m)}
                style={{ ...s.sideBtn, ...(filtreMembre === m ? s.sideBtnActive : {}) }}
              >
                {m === "tous" ? "Tous" : m}
              </button>
            ))}
          </div>

          <div style={s.sideSection}>
            <p style={s.sideLabel}>Dates</p>
            <button
              onClick={() => setFiltreDate("")}
              style={{ ...s.sideBtn, ...(filtreDate === "" ? s.sideBtnActive : {}) }}
            >
              Toutes
            </button>
            {dates.map(d => (
              <button
                key={d}
                onClick={() => setFiltreDate(d)}
                style={{ ...s.sideBtn, ...(filtreDate === d ? s.sideBtnActive : {}) }}
              >
                {d}
              </button>
            ))}
          </div>

          <button onClick={fetchRapports} style={s.refreshBtn}>Actualiser</button>
        </div>

        {/* Main */}
        <div style={s.main}>

          {/* Header */}
          <div style={s.header}>
            <div>
              <h1 style={s.title}>Vue d'ensemble</h1>
<a href="/dashboard-mockup.html">
  Voir la maquette
</a>
              <p style={s.subtitle}>{today}</p>
            </div>
            <div style={s.statsRow}>
              <div style={s.stat}>
                <span style={s.statNum}>{rapportsAujourdhui.length}</span>
                <span style={s.statLabel}>Aujourd'hui</span>
              </div>
              <div style={s.stat}>
                <span style={s.statNum}>{rapports.length}</span>
                <span style={s.statLabel}>Total</span>
              </div>
              <div style={s.stat}>
                <span style={s.statNum}>{membres.length - 1}</span>
                <span style={s.statLabel}>Membres</span>
              </div>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div style={s.empty}>Chargement...</div>
          ) : filtered.length === 0 ? (
            <div style={s.empty}>Aucun rapport trouvé.</div>
          ) : (
            <div style={s.grid}>
              {filtered.map(r => (
                <div
                  key={r.id}
                  style={{ ...s.card, ...(selected === r.id ? s.cardSelected : {}) }}
                  onClick={() => setSelected(selected === r.id ? null : r.id)}
                >
                  <div style={s.cardTop}>
                    <div>
                      <p style={s.cardName}>{r.nom}</p>
                      <p style={s.cardDate}>
                        {new Date(r.created_at).toLocaleDateString("fr-FR")} · {new Date(r.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <span style={s.chevron}>{selected === r.id ? "↑" : "↓"}</span>
                  </div>

                  {/* Preview */}
                  {selected !== r.id && (
                    <p style={s.preview}>{(r.built || r.work || "").substring(0, 100)}{(r.built || r.work || "").length > 100 ? "..." : ""}</p>
                  )}

                  {/* Expanded */}
                  {selected === r.id && (
                    <div style={s.expanded}>
                      <Field label="Construit aujourd'hui" value={r.built || r.work} />
                      <Field label="Fonctionnalités qui marchent" value={r.working || r.good} />
                      {r.validated && <Field label="Apprentissage validé" value={r.validated} sub />}
                      <Field label="Fonctionnalités bloquées" value={r.not_working || r.bad} />
                      {r.to_learn && <Field label="À apprendre pour avancer" value={r.to_learn} sub />}
                      <Field label="Appris" value={r.learned} />
                      <Field label="Construit demain" value={r.tomorrow} accent />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Field({ label, value, sub, accent }) {
  if (!value) return null;
  return (
    <div style={{ ...s.field, ...(sub ? s.fieldSub : {}), ...(accent ? s.fieldAccent : {}) }}>
      <p style={{ ...s.fieldLabel, ...(accent ? { color: "#6B1A2A" } : {}) }}>{label}</p>
      <p style={s.fieldValue}>{value}</p>
    </div>
  );
}

const s = {
  page: { display: "flex", minHeight: "100vh", background: "#F5F2ED", fontFamily: "'Inter', sans-serif" },
  sidebar: { width: 220, background: "#fff", borderRight: "1px solid rgba(0,0,0,0.07)", padding: "32px 20px", display: "flex", flexDirection: "column", gap: 0, position: "sticky", top: 0, height: "100vh", overflowY: "auto" },
  logo: { fontSize: 18, fontWeight: 600, color: "#1A1A1A", lineHeight: 1.3, marginBottom: 36 },
  logoSub: { fontSize: 13, fontWeight: 400, color: "#6B1A2A" },
  sideSection: { marginBottom: 28 },
  sideLabel: { fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" },
  sideBtn: { display: "block", width: "100%", textAlign: "left", padding: "8px 12px", border: "none", borderRadius: 8, fontSize: 14, fontFamily: "'Inter', sans-serif", color: "#666", background: "transparent", cursor: "pointer", marginBottom: 2 },
  sideBtnActive: { background: "#F5F2ED", color: "#6B1A2A", fontWeight: 500 },
  refreshBtn: { marginTop: "auto", padding: "10px 16px", border: "1.5px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: 13, fontFamily: "'Inter', sans-serif", color: "#666", background: "transparent", cursor: "pointer" },
  main: { flex: 1, padding: "40px 36px", overflowY: "auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16 },
  title: { fontSize: 26, fontWeight: 600, color: "#1A1A1A", margin: 0 },
  subtitle: { fontSize: 14, color: "#999", margin: "6px 0 0" },
  statsRow: { display: "flex", gap: 12 },
  stat: { background: "#fff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 12, padding: "14px 20px", textAlign: "center", minWidth: 80 },
  statNum: { display: "block", fontSize: 26, fontWeight: 600, color: "#6B1A2A" },
  statLabel: { fontSize: 12, color: "#999" },
  empty: { textAlign: "center", color: "#999", padding: 64, fontSize: 15 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 16 },
  card: { background: "#fff", borderRadius: 14, padding: "20px 24px", border: "1px solid rgba(0,0,0,0.07)", cursor: "pointer", transition: "box-shadow 0.2s" },
  cardSelected: { boxShadow: "0 4px 20px rgba(107,26,42,0.08)", border: "1px solid rgba(107,26,42,0.2)" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  cardName: { fontSize: 16, fontWeight: 600, color: "#1A1A1A", margin: 0 },
  cardDate: { fontSize: 13, color: "#999", margin: "4px 0 0" },
  chevron: { fontSize: 14, color: "#999" },
  preview: { fontSize: 14, color: "#666", margin: "12px 0 0", lineHeight: 1.6 },
  expanded: { marginTop: 20, display: "flex", flexDirection: "column", gap: 14, borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 20 },
  field: { },
  fieldSub: { paddingLeft: 16, borderLeft: "2px solid rgba(0,0,0,0.08)" },
  fieldAccent: { paddingLeft: 16, borderLeft: "2px solid #6B1A2A" },
  fieldLabel: { fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 4px" },
  fieldValue: { fontSize: 14, color: "#1A1A1A", margin: 0, lineHeight: 1.6 },
};