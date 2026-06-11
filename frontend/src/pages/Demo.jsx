import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL;
const DEMO_SERIES_ID_KEY = "demo_series_id";

export default function Demo() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState("");

  const fetchInfo = () => {
    fetch(`${API}/demo/info`)
      .then(r => r.json())
      .then(setInfo)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchInfo(); }, []);

  const handleReset = async () => {
    if (!confirm("Reset the demo? All changes made by demo users will be lost.")) return;
    setResetting(true);
    try {
      const res = await fetch(`${API}/demo/reset?key=sailscore-demo-2026`, { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setResetMsg("Demo reset successfully!");
        fetchInfo();
        setTimeout(() => setResetMsg(""), 3000);
      }
    } catch (e) {
      setResetMsg("Reset failed. Try again.");
    } finally {
      setResetting(false);
    }
  };

  const enterDemo = () => {
    // Store demo credentials in sessionStorage for auto-login
    sessionStorage.setItem("demo_mode", "true");
    sessionStorage.setItem("demo_email", "demo@sailscore.app");
    sessionStorage.setItem("demo_password", "demo1234");
    window.location.href = "/";
  };

  return (
    <div style={s.page}>
      {/* Nav */}
      <nav style={s.nav}>
        <span style={s.brand}>⛵ SailScore</span>
        <a href="/landing" style={s.navLink}>← Back to overview</a>
      </nav>

      <div style={s.container}>
        {/* Hero */}
        <div style={s.hero}>
          <div style={s.heroBadge}>🎮 Interactive Demo</div>
          <h1 style={s.heroTitle}>Try SailScore — no signup required</h1>
          <p style={s.heroSub}>
            Explore a fully loaded demo regatta with real boats, scored races, and live standings.
            The demo resets every 24 hours so feel free to make changes.
          </p>
        </div>

        {/* Demo credentials card */}
        <div style={s.credCard}>
          <div style={s.credHeader}>
            <span style={s.credTitle}>Demo access</span>
            {!loading && info?.ready && (
              <span style={s.readyBadge}>✓ Ready</span>
            )}
          </div>
          <div style={s.credRow}>
            <div style={s.credItem}>
              <div style={s.credLabel}>Email</div>
              <div style={s.credValue}>demo@sailscore.app</div>
            </div>
            <div style={s.credItem}>
              <div style={s.credLabel}>Password</div>
              <div style={s.credValue}>demo1234</div>
            </div>
            <div style={s.credItem}>
              <div style={s.credLabel}>Series</div>
              <div style={s.credValue}>Lake Breeze Open 2026</div>
            </div>
          </div>
          <button style={s.enterBtn} onClick={enterDemo}>
            Enter Demo →
          </button>
        </div>

        {/* What's included */}
        <h2 style={s.sectionTitle}>What's in the demo</h2>
        <div style={s.includesGrid}>
          {[
            { icon: "⛵", title: "13 boats", desc: "Across FS, NFS, Distance and 1-Design fleets" },
            { icon: "🏁", title: "3 races", desc: "2 buoy races scored + 1 distance pursuit race" },
            { icon: "📊", title: "Live standings", desc: "Real corrected times, fleet standings, throwout applied" },
            { icon: "📋", title: "Fleet Manager", desc: "Edit boats, PHRF ratings, fleet assignments" },
            { icon: "⏱", title: "Pursuit calculator", desc: "TOD start times for the distance fleet" },
            { icon: "🌐", title: "Public results page", desc: "The public-facing regatta website with results" },
          ].map((item, i) => (
            <div key={i} style={s.includeCard}>
              <span style={s.includeIcon}>{item.icon}</span>
              <div>
                <div style={s.includeTitle}>{item.title}</div>
                <div style={s.includeDesc}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Things to try */}
        <h2 style={s.sectionTitle}>Things to try</h2>
        <div style={s.tryList}>
          {[
            "Go to Race Entry and add a finish time for a boat — watch standings update instantly",
            "Click 'Score All Fleets' to see corrected times calculated automatically",
            "Switch to Distance Race tab and try the Pursuit Start Calculator",
            "View the public Results page to see what competitors see",
            "Edit a boat's PHRF rating in Fleet Manager and re-score the race",
            "Export the registration list as CSV",
            "Register a new boat at /register?series=" + (info?.series_id || "DEMO_ID"),
          ].map((item, i) => (
            <div key={i} style={s.tryItem}>
              <span style={s.tryNum}>{i + 1}</span>
              <span style={s.tryText}>{item}</span>
            </div>
          ))}
        </div>

        {/* Reset section */}
        <div style={s.resetCard}>
          <div>
            <div style={s.resetTitle}>Reset the demo</div>
            <div style={s.resetDesc}>
              The demo resets automatically every 24 hours at midnight. You can also reset it manually at any time.
            </div>
            {resetMsg && <div style={s.resetMsg}>{resetMsg}</div>}
          </div>
          <button style={s.resetBtn} onClick={handleReset} disabled={resetting}>
            {resetting ? "Resetting..." : "🔄 Reset Now"}
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { fontFamily: "'Nunito', sans-serif", background: "#f0f4f8", minHeight: "100vh" },
  nav: { background: "white", borderBottom: "1px solid #e2e8f0", padding: "0.75rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 },
  brand: { fontFamily: "'Anton', sans-serif", fontSize: "1.4rem", color: "#FF6B35", letterSpacing: "0.1em" },
  navLink: { color: "#4a5568", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" },
  container: { maxWidth: "780px", margin: "0 auto", padding: "2rem 1.5rem" },
  hero: { textAlign: "center", marginBottom: "2rem" },
  heroBadge: { display: "inline-block", background: "rgba(255,107,53,0.1)", color: "#FF6B35", padding: "4px 14px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: 700, marginBottom: "1rem" },
  heroTitle: { fontFamily: "'Anton', sans-serif", fontSize: "2.2rem", color: "#1a365d", textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: "0.75rem" },
  heroSub: { fontSize: "1rem", color: "#718096", lineHeight: 1.7, maxWidth: "540px", margin: "0 auto" },
  credCard: { background: "white", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: "2rem", border: "2px solid #FF6B35" },
  credHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" },
  credTitle: { fontWeight: 800, fontSize: "1rem", color: "#1a365d" },
  readyBadge: { background: "#e6fffa", color: "#276749", padding: "3px 10px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700 },
  credRow: { display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "1.25rem" },
  credItem: {},
  credLabel: { fontSize: "0.75rem", color: "#718096", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" },
  credValue: { fontSize: "1rem", fontWeight: 700, color: "#2d3748", fontFamily: "monospace" },
  enterBtn: { width: "100%", padding: "0.9rem", background: "#FF6B35", color: "white", border: "none", borderRadius: "10px", fontSize: "1rem", fontWeight: 800, cursor: "pointer", letterSpacing: "0.02em" },
  sectionTitle: { fontFamily: "'Anton', sans-serif", fontSize: "1.2rem", color: "#1a365d", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" },
  includesGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem", marginBottom: "2rem" },
  includeCard: { background: "white", borderRadius: "12px", padding: "1rem", display: "flex", alignItems: "flex-start", gap: "0.75rem", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" },
  includeIcon: { fontSize: "1.5rem", flexShrink: 0 },
  includeTitle: { fontWeight: 800, fontSize: "0.9rem", color: "#2d3748", marginBottom: "2px" },
  includeDesc: { fontSize: "0.8rem", color: "#718096", lineHeight: 1.5 },
  tryList: { display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "2rem" },
  tryItem: { background: "white", borderRadius: "10px", padding: "0.9rem 1rem", display: "flex", alignItems: "flex-start", gap: "0.75rem", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" },
  tryNum: { background: "#1a365d", color: "white", width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800, flexShrink: 0 },
  tryText: { fontSize: "0.9rem", color: "#4a5568", lineHeight: 1.6 },
  resetCard: { background: "white", borderRadius: "12px", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", flexWrap: "wrap" },
  resetTitle: { fontWeight: 800, fontSize: "0.95rem", color: "#2d3748", marginBottom: "4px" },
  resetDesc: { fontSize: "0.85rem", color: "#718096", lineHeight: 1.6 },
  resetMsg: { marginTop: "6px", fontSize: "0.85rem", color: "#276749", fontWeight: 700 },
  resetBtn: { padding: "0.6rem 1.25rem", background: "#1a365d", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", whiteSpace: "nowrap" },
};
