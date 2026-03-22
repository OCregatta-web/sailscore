// ── NOTICE BOARD ─────────────────────────────────────────────────────────────
// To add a notice, add an entry to the NOTICES array below.
// Types: "announcement" | "schedule" | "results" | "weather" | "document"
// docUrl is optional — link to a PDF or external document

const NOTICES = [
  {
    type: "announcement",
    date: "March 20, 2026",
    title: "Registration is Now Open!",
    message: "Online registration is now open for the 2026 Oakville Club Open Regatta. Register at ocregatta.com. Limited to 50 boats — first come, first served.",
    docUrl: null,
  },
  {
    type: "document",
    date: "March 20, 2026",
    title: "Notice of Race Available",
    message: "The Notice of Race for the 2026 OC Regatta is now available. Please review all sections carefully before race day.",
    docUrl: "/nor",
  },
];

// ─────────────────────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  announcement: { label: "Announcement", color: "#2b6cb0", bg: "#ebf8ff", icon: "📢" },
  schedule:     { label: "Schedule",     color: "#276749", bg: "#f0fff4", icon: "🗓" },
  results:      { label: "Results",      color: "#744210", bg: "#fffff0", icon: "🏆" },
  weather:      { label: "Weather",      color: "#7b341e", bg: "#fff5f5", icon: "🌬" },
  document:     { label: "Document",     color: "#553c9a", bg: "#faf5ff", icon: "📄" },
};

export default function Noticeboard() {
  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <span style={s.navBrand}>⛵ OCOR 2026</span>
        <a href="/regatta" style={s.navBack}>← Back to Regatta</a>
      </nav>

      <div style={s.container}>
        <div style={s.header}>
          <div style={s.headerIcon}>📋</div>
          <div>
            <h1 style={s.title}>Official Notice Board</h1>
            <p style={s.subtitle}>Oakville Club Open Regatta 2026</p>
          </div>
        </div>

        <p style={s.note}>All official notices for the regatta are posted here. Check back regularly for updates.</p>

        {NOTICES.length === 0 ? (
          <div style={s.empty}>No notices posted yet. Check back closer to race day.</div>
        ) : (
          <div style={s.list}>
            {[...NOTICES].reverse().map((n, i) => {
              const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.announcement;
              return (
                <div key={i} style={{ ...s.card, borderLeft: `5px solid ${cfg.color}` }}>
                  <div style={s.cardTop}>
                    <span style={{ ...s.badge, background: cfg.bg, color: cfg.color }}>
                      {cfg.icon} {cfg.label}
                    </span>
                    <span style={s.date}>{n.date}</span>
                  </div>
                  <h2 style={s.cardTitle}>{n.title}</h2>
                  <p style={s.cardMsg}>{n.message}</p>
                  {n.docUrl && (
                    <a href={n.docUrl} style={{ ...s.docLink, color: cfg.color }}>
                      📎 View Document →
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div style={s.footer}>
          <a href="/regatta" style={s.footerBtn}>← Back to Regatta</a>
          <a href={`/register?series=3`} style={s.footerBtnPrimary}>Register Now →</a>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { fontFamily: "'Nunito', sans-serif", background: "#f0f4f8", minHeight: "100vh" },
  nav: { position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", borderBottom: "3px solid #FF6B35", padding: "0.75rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" },
  navBrand: { fontFamily: "'Anton', sans-serif", fontSize: "1.4rem", color: "#FF6B35", letterSpacing: "0.1em" },
  navBack: { color: "#4a5568", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" },
  container: { maxWidth: "780px", margin: "0 auto", padding: "2rem 1.5rem" },
  header: { display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.75rem" },
  headerIcon: { fontSize: "2.5rem" },
  title: { fontFamily: "'Anton', sans-serif", fontSize: "2rem", color: "#1a365d", letterSpacing: "0.03em", textTransform: "uppercase", margin: 0 },
  subtitle: { fontSize: "0.95rem", color: "#718096", marginTop: "2px" },
  note: { fontSize: "0.875rem", color: "#718096", marginBottom: "1.5rem", padding: "0.75rem 1rem", background: "white", borderRadius: "8px", border: "1px solid #e2e8f0" },
  empty: { textAlign: "center", color: "#a0aec0", padding: "3rem", background: "white", borderRadius: "12px" },
  list: { display: "flex", flexDirection: "column", gap: "1rem" },
  card: { background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  cardTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" },
  badge: { padding: "0.25rem 0.75rem", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700 },
  date: { fontSize: "0.8rem", color: "#718096", fontWeight: 600 },
  cardTitle: { fontSize: "1.15rem", fontWeight: 800, color: "#1a365d", marginBottom: "0.5rem" },
  cardMsg: { fontSize: "0.925rem", color: "#4a5568", lineHeight: 1.7, marginBottom: "0.5rem" },
  docLink: { fontSize: "0.875rem", fontWeight: 700, textDecoration: "none" },
  footer: { display: "flex", gap: "1rem", justifyContent: "center", marginTop: "2rem", paddingBottom: "2rem" },
  footerBtn: { padding: "0.75rem 1.5rem", borderRadius: "50px", border: "2px solid #cbd5e0", color: "#4a5568", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" },
  footerBtnPrimary: { padding: "0.75rem 1.5rem", borderRadius: "50px", background: "#FF6B35", color: "white", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" },
};
