import { useState, useEffect, useRef } from "react";
import Head from "next/head";

const STEPS = [
  {
    id: "nom",
    label: "Votre nom complet",
    placeholder: "Rechercher ou entrer votre nom...",
    type: "search",
    color: "#6B1A2A",
  },
  {
    id: "built",
    label: "Qu'avez-vous construit aujourd'hui ?",
    placeholder: "Décrivez ce que vous avez construit...",
    type: "textarea",
    color: "#6B1A2A",
  },
  {
    id: "working",
    label: "Quelles sont les fonctionnalités qui marchent ?",
    placeholder: "Listez les fonctionnalités qui fonctionnent...",
    type: "textarea",
    color: "#6B1A2A",
    sub: {
      id: "validated",
      label: "Apprentissages validés",
      placeholder: "Qu'avez-vous validé comme apprentissage ?",
    },
  },
  {
    id: "notWorking",
    label: "Quelles sont les fonctionnalités qui ne marchent pas ?",
    placeholder: "Listez les fonctionnalités bloquées...",
    type: "textarea",
    color: "#6B1A2A",
    sub: {
      id: "toLearn",
      label: "Que devez-vous apprendre pour avancer ?",
      placeholder: "Identifiez les apprentissages nécessaires...",
    },
  },
  {
    id: "learned",
    label: "Qu'avez-vous appris ?",
    placeholder: "Partagez vos apprentissages du jour...",
    type: "textarea",
    color: "#6B1A2A",
  },
  {
    id: "tomorrow",
    label: "Qu'allez-vous construire demain ?",
    placeholder: "Décrivez vos objectifs pour demain...",
    type: "textarea",
    color: "#6B1A2A",
  },
];

export default function Home() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState("");
  const [subCurrent, setSubCurrent] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const currentStep = STEPS[step];
  const totalSteps = STEPS.length;
  const progress = ((step) / totalSteps) * 100;

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
    setCurrent(answers[currentStep.id] || "");
    setSubCurrent(currentStep.sub ? (answers[currentStep.sub.id] || "") : "");
  }, [step]);

  async function searchNames(query) {
    if (!query || query.length < 2) { setSuggestions([]); return; }
    try {
      const res = await fetch(`/api/names?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSuggestions(data.names || []);
      setShowSuggestions(true);
    } catch { setSuggestions([]); }
  }

  function handleNext() {
    if (!current.trim()) return;
    const updated = { ...answers, [currentStep.id]: current.trim() };
    if (currentStep.sub) updated[currentStep.sub.id] = subCurrent.trim();
    setAnswers(updated);
    setSubCurrent("");
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit(updated);
    }
  }

  function handleBack() {
    if (step > 0) {
      setStep(step - 1);
    }
  }

async function handleSubmit(finalAnswers) {
  setLoading(true);
  setError("");
  try {
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nom: finalAnswers.nom,
        built: finalAnswers.built,
        working: finalAnswers.working,
        validated: finalAnswers.validated || "",
        notWorking: finalAnswers.notWorking,
        toLearn: finalAnswers.toLearn || "",
        learned: finalAnswers.learned,
        tomorrow: finalAnswers.tomorrow,
      }),
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
    if (e.key === "Enter" && !e.shiftKey && currentStep.type !== "textarea") {
      e.preventDefault();
      handleNext();
    }
  }

  if (submitted) return (
    <>
      <Head><title>Rapport envoyé</title></Head>
      <div style={styles.container}>
        <div style={styles.successCard}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={styles.successTitle}>Rapport envoyé</h2>
          <p style={styles.successText}>Votre rapport journalier a bien été enregistré.</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Head>
        <title>Rapport Journalier</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <div style={styles.container}>
        <div style={styles.card}>

          {/* Progress */}
          <div style={styles.progressWrap}>
            <div style={styles.progressTrack}>
              <div style={{ ...styles.progressFill, width: `${progress}%` }} />
            </div>
            <span style={styles.progressLabel}>{step + 1} / {totalSteps}</span>
          </div>

          {/* Question */}
          <div style={styles.questionWrap}>
            <p style={styles.stepNum}>Question {step + 1}</p>
            <h2 style={styles.question}>{currentStep.label}</h2>
          </div>

          {/* Input */}
          {currentStep.id === "nom" ? (
            <div style={{ position: "relative" }}>
              <input
                ref={inputRef}
                type="text"
                value={current}
                onChange={e => { setCurrent(e.target.value); searchNames(e.target.value); }}
                onKeyDown={handleKeyDown}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder={currentStep.placeholder}
                style={styles.input}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div style={styles.suggestions}>
                  {suggestions.map(name => (
                    <div
                      key={name}
                      style={styles.suggestion}
                      onMouseDown={() => { setCurrent(name); setShowSuggestions(false); }}
                    >
                      {name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <textarea
              ref={inputRef}
              value={current}
              onChange={e => setCurrent(e.target.value)}
              placeholder={currentStep.placeholder}
              style={styles.textarea}
              rows={4}
            />
          )}

          {/* Sub question */}
          {currentStep.sub && (
            <div style={styles.subWrap}>
              <p style={styles.subLabel}>{currentStep.sub.label}</p>
              <textarea
                value={subCurrent}
                onChange={e => setSubCurrent(e.target.value)}
                placeholder={currentStep.sub.placeholder}
                style={{ ...styles.textarea, marginTop: 0 }}
                rows={3}
              />
            </div>
          )}

          {error && <p style={styles.error}>{error}</p>}

          {/* Actions */}
          <div style={styles.actions}>
            {step > 0 && (
              <button onClick={handleBack} style={styles.backBtn}>
                ← Retour
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!current.trim() || loading}
              style={{
                ...styles.nextBtn,
                opacity: current.trim() ? 1 : 0.4,
                cursor: current.trim() ? "pointer" : "not-allowed",
                marginLeft: step > 0 ? 12 : 0,
              }}
            >
              {loading ? "Envoi..." : step < STEPS.length - 1 ? "Continuer" : "Envoyer le rapport"}
            </button>
          </div>

          {/* Date */}
          <p style={styles.date}>{new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>

        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#F5F2ED",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    fontFamily: "'Inter', sans-serif",
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: "48px 44px",
    width: "100%",
    maxWidth: 580,
    boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
  },
  progressWrap: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 40,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    background: "rgba(0,0,0,0.08)",
    borderRadius: 99,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "#6B1A2A",
    borderRadius: 99,
    transition: "width 0.4s ease",
  },
  progressLabel: {
    fontSize: 13,
    color: "#666",
    fontWeight: 500,
    whiteSpace: "nowrap",
  },
  questionWrap: {
    marginBottom: 28,
  },
  stepNum: {
    fontSize: 12,
    color: "#6B1A2A",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    margin: "0 0 10px",
  },
  question: {
    fontSize: 22,
    fontWeight: 600,
    color: "#1A1A1A",
    margin: 0,
    lineHeight: 1.4,
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    border: "1.5px solid rgba(0,0,0,0.1)",
    borderRadius: 10,
    fontSize: 16,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 400,
    color: "#1A1A1A",
    background: "#FAFAF9",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  textarea: {
    width: "100%",
    padding: "14px 16px",
    border: "1.5px solid rgba(0,0,0,0.1)",
    borderRadius: 10,
    fontSize: 16,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 400,
    color: "#1A1A1A",
    background: "#FAFAF9",
    outline: "none",
    resize: "vertical",
    lineHeight: 1.6,
    boxSizing: "border-box",
    marginTop: 0,
  },
  subWrap: {
    marginTop: 20,
    paddingTop: 20,
    borderTop: "1px solid rgba(0,0,0,0.06)",
  },
  subLabel: {
    fontSize: 14,
    fontWeight: 500,
    color: "#666",
    margin: "0 0 10px",
  },
  suggestions: {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    right: 0,
    background: "#fff",
    border: "1.5px solid rgba(0,0,0,0.1)",
    borderRadius: 10,
    zIndex: 100,
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    overflow: "hidden",
  },
  suggestion: {
    padding: "12px 16px",
    fontSize: 15,
    color: "#1A1A1A",
    cursor: "pointer",
    transition: "background 0.15s",
  },
  actions: {
    display: "flex",
    marginTop: 28,
  },
  backBtn: {
    padding: "13px 20px",
    border: "1.5px solid rgba(0,0,0,0.12)",
    borderRadius: 10,
    fontSize: 15,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    color: "#666",
    background: "transparent",
    cursor: "pointer",
  },
  nextBtn: {
    flex: 1,
    padding: "13px 24px",
    border: "none",
    borderRadius: 10,
    fontSize: 15,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    color: "#fff",
    background: "#6B1A2A",
    transition: "opacity 0.2s",
  },
  error: {
    color: "#ef4444",
    fontSize: 13,
    marginTop: 10,
  },
  date: {
    marginTop: 24,
    fontSize: 13,
    color: "#999",
    textAlign: "center",
  },
  successCard: {
    background: "#fff",
    borderRadius: 16,
    padding: "64px 44px",
    width: "100%",
    maxWidth: 480,
    textAlign: "center",
    boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
  },
  successIcon: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "#6B1A2A",
    color: "#fff",
    fontSize: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 600,
    color: "#1A1A1A",
    margin: "0 0 10px",
  },
  successText: {
    fontSize: 15,
    color: "#666",
    margin: 0,
  },
};