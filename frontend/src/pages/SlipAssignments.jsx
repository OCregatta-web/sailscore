import slipAssignmentsPdf from "../assets/slip-assignments.pdf";

export default function SlipAssignments() {
  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <span style={s.navBrand}>⛵ OCOR 2026</span>
        <a href="/regatta" style={s.navBack}>← Back to Regatta</a>
      </nav>

      <div style={s.container}>
        <div style={s.header}>
          <div style={s.headerIcon}>⚓</div>
          <div>
            <h1 style={s.title}>Dock Slip Assignments</h1>
            <p style={s.subtitle}>The Oakville Club Open Regatta · Saturday August 15, 2026</p>
          </div>
          <a href={slipAssignmentsPdf} download style={s.downloadBtn}>⬇ Download PDF</a>
        </div>

        <div style={s.viewerCard}>
          <iframe
            src={slipAssignmentsPdf}
            title="Dock Slip Assignments"
            style={s.iframe}
          />
        </div>

        <p style={s.note}>
          Having trouble viewing the document above? <a href={slipAssignmentsPdf} target="_blank" rel="noopener noreferrer" style={s.inlineLink}>Open it in a new tab</a> instead.
        </p>

        <div style={s.footer}>
          <a href="/regatta" style={s.footerBtn}>← Back to Regatta</a>
          <a href="/si" style={s.footerBtnPrimary}>Sailing Instructions →</a>
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
  container: { maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem" },
  header: { display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem", flexWrap: "wrap" },
  headerIcon: { fontSize: "2.5rem" },
  title: { fontFamily: "'Anton', sans-serif", fontSize: "1.8rem", color: "#1a365d", letterSpacing: "0.03em", textTransform: "uppercase", margin: 0 },
  subtitle: { fontSize: "0.95rem", color: "#718096", marginTop: "2px" },
  downloadBtn: { marginLeft: "auto", padding: "0.65rem 1.25rem", borderRadius: "50px", background: "#FF6B35", color: "white", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" },
  viewerCard: { background: "white", borderRadius: "12px", padding: "0.75rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  iframe: { width: "100%", height: "80vh", border: "none", borderRadius: "8px" },
  note: { fontSize: "0.85rem", color: "#a0aec0", textAlign: "center", marginTop: "1rem" },
  inlineLink: { color: "#2b6cb0", fontWeight: 700, textDecoration: "none" },
  footer: { display: "flex", gap: "1rem", justifyContent: "center", marginTop: "2rem", paddingBottom: "2rem" },
  footerBtn: { padding: "0.75rem 1.5rem", borderRadius: "50px", border: "2px solid #cbd5e0", color: "#4a5568", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" },
  footerBtnPrimary: { padding: "0.75rem 1.5rem", borderRadius: "50px", background: "#FF6B35", color: "white", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" },
};
