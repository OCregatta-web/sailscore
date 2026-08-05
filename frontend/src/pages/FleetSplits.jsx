import { useState, useEffect } from "react";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function FleetSplits() {
  const seriesId = new URLSearchParams(window.location.search).get("series") || "3";
  const [seriesInfo, setSeriesInfo] = useState(null);
  const [boats, setBoats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${BASE}/register/${seriesId}/info`).then(r => r.ok ? r.json() : Promise.reject()),
      fetch(`${BASE}/public/series/${seriesId}/boats`).then(r => r.ok ? r.json() : Promise.reject()),
    ])
      .then(([info, boatList]) => {
        setSeriesInfo(info);
        setBoats(boatList);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [seriesId]);

  const fleetGroups = boats.reduce((groups, b) => {
    const fleet = b.fleet || "NFS";
    if (!groups[fleet]) groups[fleet] = [];
    groups[fleet].push(b);
    return groups;
  }, {});

  const fleetNames = Object.keys(fleetGroups).sort();
  fleetNames.forEach(f =>
    fleetGroups[f].sort((a, b) => (a.sail_number || "").localeCompare(b.sail_number || "", undefined, { numeric: true }))
  );

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <span style={s.navBrand}>⛵ OCOR 2026</span>
        <a href="/regatta" style={s.navBack}>← Back to Regatta</a>
      </nav>

      <div style={s.container}>
        <div style={s.header}>
          <div style={s.headerIcon}>⛵</div>
          <div>
            <h1 style={s.title}>Fleet Splits</h1>
            <p style={s.subtitle}>
              {seriesInfo ? `${seriesInfo.series_name}${seriesInfo.season ? " · " + seriesInfo.season : ""}` : "Oakville Club Open Regatta"}
            </p>
          </div>
        </div>

        <p style={s.note}>
          {boats.length > 0
            ? `${boats.length} boat${boats.length !== 1 ? "s" : ""} across ${fleetNames.length} fleet${fleetNames.length !== 1 ? "s" : ""}. This list updates automatically as the fleet changes.`
            : "This list updates automatically as the fleet is finalized."}
        </p>

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : error ? (
          <div style={s.empty}>Couldn't load fleet splits right now. Please check back shortly.</div>
        ) : boats.length === 0 ? (
          <div style={s.empty}>No boats assigned yet. Check back closer to race day.</div>
        ) : (
          <div style={s.list}>
            {fleetNames.map(fleetName => (
              <div key={fleetName} style={s.card}>
                <div style={s.cardTop}>
                  <span style={s.fleetName}>{fleetName} Fleet</span>
                  <span style={s.countBadge}>
                    {fleetGroups[fleetName].length} boat{fleetGroups[fleetName].length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div style={s.tableWrap}>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        <th style={s.th}>Sail #</th>
                        <th style={s.th}>Boat Name</th>
                        <th style={s.th}>Skipper</th>
                        <th style={{ ...s.th, textAlign: "right" }}>PHRF</th>
                        <th style={s.th}>Class</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fleetGroups[fleetName].map((b, i) => (
                        <tr key={b.id} style={{ background: i % 2 === 0 ? "#fff" : "#f7fafc" }}>
                          <td style={s.td}><span style={s.sailNum}>{b.sail_number}</span></td>
                          <td style={{ ...s.td, fontWeight: 700 }}>{b.boat_name}</td>
                          <td style={s.td}>{b.skipper}</td>
                          <td style={{ ...s.td, textAlign: "right" }}>{b.phrf_rating}</td>
                          <td style={s.td}>{b.boat_class || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={s.footer}>
          <a href="/regatta" style={s.footerBtn}>← Back to Regatta</a>
          <a href="/noticeboard" style={s.footerBtnPrimary}>Notice Board →</a>
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
  header: { display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.75rem" },
  headerIcon: { fontSize: "2.5rem" },
  title: { fontFamily: "'Anton', sans-serif", fontSize: "2rem", color: "#1a365d", letterSpacing: "0.03em", textTransform: "uppercase", margin: 0 },
  subtitle: { fontSize: "0.95rem", color: "#718096", marginTop: "2px" },
  note: { fontSize: "0.875rem", color: "#718096", marginBottom: "1.5rem", padding: "0.75rem 1rem", background: "white", borderRadius: "8px", border: "1px solid #e2e8f0" },
  spinnerWrap: { display: "flex", justifyContent: "center", padding: "3rem" },
  spinner: { width: "36px", height: "36px", border: "4px solid #e2e8f0", borderTopColor: "#FF6B35", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  empty: { textAlign: "center", color: "#a0aec0", padding: "3rem", background: "white", borderRadius: "12px" },
  list: { display: "flex", flexDirection: "column", gap: "1.25rem" },
  card: { background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  cardTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" },
  fleetName: { fontSize: "1.2rem", fontWeight: 800, color: "#1a365d", textTransform: "uppercase", letterSpacing: "0.02em" },
  countBadge: { fontSize: "0.8rem", fontWeight: 700, color: "#2b6cb0", background: "#ebf8ff", padding: "0.25rem 0.75rem", borderRadius: "20px" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" },
  th: { textAlign: "left", padding: "8px 10px", fontSize: "0.75rem", textTransform: "uppercase", color: "#718096", borderBottom: "2px solid #e2e8f0" },
  td: { padding: "10px", borderBottom: "1px solid #edf2f7", color: "#2d3748" },
  sailNum: { fontWeight: 700, color: "#FF6B35" },
  footer: { display: "flex", gap: "1rem", justifyContent: "center", marginTop: "2rem", paddingBottom: "2rem" },
  footerBtn: { padding: "0.75rem 1.5rem", borderRadius: "50px", border: "2px solid #cbd5e0", color: "#4a5568", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" },
  footerBtnPrimary: { padding: "0.75rem 1.5rem", borderRadius: "50px", background: "#FF6B35", color: "white", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" },
};
