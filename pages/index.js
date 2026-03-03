import { useState } from "react";
import Head from "next/head";

const STEPS = [
  { id: "nom",      emoji: "👤", label: "Ton nom complet",            placeholder: "Ex: André Kim GBAGUIDI",                 color: "#8b5cf6" },
  { id: "work",     emoji: "📋", label: "Travail du jour",            placeholder: "Sur quoi as-tu travaillé aujourd'hui ?", color: "#6366f1" },
  { id: "good",     emoji: "✅", label: "Ce qui s'est bien passé",    placeholder: "Qu'est-ce qui s'est bien passé ?",        color: "#10b981" },
  { id: "bad",      emoji: "❌", label: "Ce qui s'est mal passé",     placeholder: "Qu'est-ce qui n'a pas bien marché ?",     color: "#ef4444" },
  { id: "learned",  emoji: "💡", label: "Ce que j'ai appris",         placeholder: "Qu'as-tu appris aujourd'hui ?",           color: "#f59e0b" },
  { id: "tomorrow", emoji: "🎯", label: "Objectifs de demain",        placeholder: "Quels sont tes objectifs pour demain ?",  color: "#3b82f6" },
];

export default function Home() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentStep = STEPS[step];
  const progress = (step / STEPS.length) * 100;

  function handleNext() {
    if (!current.trim()) return;
    const updated = { ...answers, [currentStep.id]: current.trim() };
    setAnswers(updated);
    setCurrent("");
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit(updated);
    }
  }

  async function handleSubmit(finalAnswers) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalAnswers),
      });
      const data = await res.json();
      if (data.success) setSubmitted(true);
      else setError(data.error || "Une erreur est survenue.");
    } catch (e) {
      setError("Impossible de soumettre le formulaire.");
    }
    setLoading(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleNext(); }
  }

  if (submitted) return (
    <>
      <Head><title>Rapport envoyé ✅</title></Head>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h1 style={{ ...styles.title, fontSize: 26 }}>Rapport envoyé !</h1>
          <p style={styles.subtitle}>Ton rapport journalier a bien été enregistré. À demain !</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Head>
        <title>Rapport Journalier</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <span style={styles.badge}>Rapport du {new Date().toLocaleDateString("fr-FR")}</span>
            <h1 style={styles.title}>Rapport Journalier</h1>
          </div>

          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${progress}%`, background: currentStep.color }} />
          </div>
          <p style={styles.progressText}>{step + 1} / {STEPS.length}</p>

          <div style={styles.stepContainer}>
            <div style={{ ...styles.stepEmoji, background: currentStep.color + "20", border: `2px solid ${currentStep.color}40` }}>
              {currentStep.emoji}
            </div>
            <h2 style={{ ...styles.stepLabel, color: currentStep.color }}>{currentStep.label}</h2>
            <textarea
              autoFocus
              value={current}
              onChange={e => setCurrent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={currentStep.placeholder}
              style={styles.textarea}
              rows={currentStep.id === "nom" ? 1 : 4}
            />
            {error && <p style={styles.error}>{error}</p>}
            <button
              onClick={handleNext}
              disabled={!current.trim() || loading}
              style={{ ...styles.button, background: current.trim() ? currentStep.color : "#d1d5db", cursor: current.trim() ? "pointer" : "not-allowed" }}
            >
              {loading ? "Envoi..." : step < STEPS.length - 1 ? "Suivant →" : "Envoyer le rapport ✓"}
            </button>
            <p style={styles.hint}>Appuie sur Entrée pour continuer</p>
          </div>

          {step > 0 && (
            <div style={styles.previousAnswers}>
              {STEPS.slice(0, step).map(s => (
                <div key={s.id} style={styles.prevItem}>
                  <span style={{ color: s.color }}>{s.emoji}</span>
                  <span style={styles.prevLabel}>{s.label} :</span>
                  <span style={styles.prevValue}>{answers[s.id]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#faf9f7", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", fontFamily: "'DM Sans', sans-serif" },
  card: { background: "#ffffff", borderRadius: 20, padding: "40px 36px", width: "100%", maxWidth: 560, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" },
  header: { marginBottom: 24 },
  badge: { background: "#f3f4f6", color: "#6b7280", fontSize: 12, padding: "4px 12px", borderRadius: 20, fontWeight: 500 },
  title: { fontFamily: "'DM Serif Display', serif", fontSize: 30, color: "#111827", margin: "12px 0 0" },
  subtitle: { color: "#6b7280", fontSize: 15, marginTop: 8, lineHeight: 1.6 },
  progressBar: { height: 6, background: "#f3f4f6", borderRadius: 99, overflow: "hidden", marginBottom: 8 },
  progressFill: { height: "100%", borderRadius: 99, transition: "width 0.4s ease, background 0.3s ease" },
  progressText: { color: "#9ca3af", fontSize: 12, textAlign: "right", margin: "0 0 28px" },
  stepContainer: { display: "flex", flexDirection: "column", alignItems: "flex-start" },
  stepEmoji: { fontSize: 32, width: 60, height: 60, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 14, marginBottom: 12 },
  stepLabel: { fontSize: 18, fontWeight: 600, margin: "0 0 16px" },
  textarea: { width: "100%", padding: "14px 16px", border: "2px solid #e5e7eb", borderRadius: 12, fontSize: 15, fontFamily: "'DM Sans', sans-serif", resize: "vertical", outline: "none", color: "#111827", lineHeight: 1.6, boxSizing: "border-box" },
  button: { marginTop: 16, padding: "14px 28px", border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", width: "100%" },
  hint: { color: "#9ca3af", fontSize: 12, marginTop: 8, textAlign: "center" },
  error: { color: "#ef4444", fontSize: 13, marginTop: 8 },
  previousAnswers: { marginTop: 28, borderTop: "1px solid #f3f4f6", paddingTop: 20, display: "flex", flexDirection: "column", gap: 8 },
  prevItem: { display: "flex", gap: 8, fontSize: 13, alignItems: "flex-start" },
  prevLabel: { color: "#6b7280", fontWeight: 500, whiteSpace: "nowrap" },
  prevValue: { color: "#374151" },
};