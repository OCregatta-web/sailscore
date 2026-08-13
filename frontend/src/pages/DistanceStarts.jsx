import { useState, useEffect } from "react";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function DistanceStarts() {
  const seriesId = new URLSearchParams(window.location.search).get("series") || "3";
  const [seriesInfo, setSeriesInfo] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${BASE}/register/${seriesId}/info`).then(r => r.ok ? r.json() : Promise.reject()),
      fetch(`${BASE}/public/series/${seriesId}/distance-starts`).then(r => r.ok ? r.json() : Promise.reject()),
    ])
      .then(([info, starts]) => {
        setSeriesInfo(info);
        setData(starts);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [seriesId]);

  const printStartSheet = () => {
    if (!data || !data.starts || data.starts.length === 0) return;
    const printWindow = window.open('', '_blank');
    const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    const rows = data.starts.map((b, i) => `
      <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
        <td>${i + 1}</td>
        <td><strong>${b.start_time}</strong></td>
        <td>${b.sail_number}</td>
        <td>${b.boat_name}</td>
        <td>${b.skipper}</td>
        <td class="num-col">${b.phrf_rating}</td>
      </tr>
    `).join('');

    printWindow.document.write(`<!DOCTYPE html><html><head><title>${seriesInfo?.series_name || "Regatta"} — Distance Race Start Sheet</title>
      <style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: Arial, sans-serif; font-size: 13px; padding: 1.5cm; }
      .header { text-align: center; margin-bottom: 1.25rem; border-bottom: 2px solid #000; padding-bottom: 1rem; }
      .title { font-size: 22px; font-weight: 800; margin-bottom: 0.25rem; }
      .subtitle { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 0.25rem; }
      .meta { font-size: 11px; color: #666; }
      table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
      th { background: #000; color: #fff; padding: 8px 10px; text-align: left; font-size: 11px; text-transform: uppercase; }
      td { padding: 9px 10px; border-bottom: 1px solid #ddd; }
      .num-col { text-align: right; }
      tr.even td { background: #f9f9f9; }
      </style></head><body>
      <div class="header"><div class="title">${seriesInfo?.series_name || "Regatta"}</div>
      <div class="subtitle">Distance Race — Pursuit Start Sheet</div>
      <div class="meta">First start ${data.first_start} · Course distance ${data.distance_nm} NM · Printed ${today}</div></div>
      <table>
        <thead><tr><th>#</th><th>Start Time</th><th>Sail #</th><th>Boat Name</th><th>Skipper</th><th style="text-align:right">PHRF</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <script>window.onload = function() { window.print(); }<\/script></body></html>`);
    printWindow.document.close();
  };

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <span style={s.navBrand}>⛵ OCOR 2026</span>
        <a href="/regatta" style={s.navBack}>← Back to Regatta</a>
      </nav>

      <div style={s.container}>
        <div style={s.header}>
          <div style={s.headerIcon}>🏁</div>
          <div>
            <h1 style={s.title}>Distance Race Start Times</h1>
            <p style={s.subtitle}>
              {seriesInfo ? `${seriesInfo.series_name}${seriesInfo.season ? " · " + seriesInfo.season : ""}` : "Oakville Club Open Regatta"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : error ? (
          <div style={s.empty}>Couldn't load start times right now. Please check back shortly.</div>
        ) : !data || !data.starts || data.starts.length === 0 ? (
          <div style={s.empty}>Start times haven't been published yet. Check back closer to race day.</div>
        ) : (
          <>
            <div style={s.metaBar}>
              <div>
                <div style={s.metaLabel}>First Start (slowest boat)</div>
                <div style={s.metaValue}>{data.first_start}</div>
              </div>
              <div>
                <div style={s.metaLabel}>Course Distance</div>
                <div style={s.metaValue}>{data.distance_nm} NM</div>
              </div>
              <button style={s.printBtn} onClick={printStartSheet}>🖨 Print / Save as PDF</button>
            </div>

            <div style={s.card}>
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>#</th>
                      <th style={s.th}>Start Time</th>
                      <th style={s.th}>Sail #</th>
                      <th style={s.th}>Boat Name</th>
                      <th style={s.th}>Skipper</th>
                      <th style={{ ...s.th, textAlign: "right" }}>PHRF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.starts.map((b, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f7fafc" }}>
                        <td style={s.td}>{i + 1}</td>
                        <td style={{ ...s.td, fontWeight: 700, color: "#FF6B35" }}>{b.start_time}</td>
                        <td style={s.td}>{b.sail_number}</td>
                        <td style={{ ...s.td, fontWeight: 700 }}>{b.boat_name}</td>
                        <td style={s.td}>{b.skipper}</td>
                        <td style={{ ...s.td, textAlign: "right" }}>{b.phrf_rating}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p style={s.note}>This list updates automatically as the Distance fleet changes. Start times are recalculated live from current PHRF ratings.</p>
          </>
        )}

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
  container: { maxWidth: "820px", margin: "0 auto", padding: "2rem 1.5rem" },
  header: { display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.75rem" },
  headerIcon: { fontSize: "2.5rem" },
  title: { fontFamily: "'Anton', sans-serif", fontSize: "2rem", color: "#1a365d", letterSpacing: "0.03em", textTransform: "uppercase", margin: 0 },
  subtitle: { fontSize: "0.95rem", color: "#718096", marginTop: "2px" },
  empty: { textAlign: "center", color: "#a0aec0", padding: "3rem", background: "white", borderRadius: "12px" },
  metaBar: { display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap", background: "white", borderRadius: "12px", padding: "1.25rem 1.5rem", marginBottom: "1.25rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  metaLabel: { fontSize: "0.75rem", textTransform: "uppercase", color: "#718096", fontWeight: 700, marginBottom: "2px" },
  metaValue: { fontSize: "1.1rem", fontWeight: 800, color: "#1a365d" },
  printBtn: { marginLeft: "auto", padding: "0.65rem 1.25rem", borderRadius: "50px", background: "#FF6B35", color: "white", border: "none", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" },
  card: { background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" },
  th: { textAlign: "left", padding: "8px 10px", fontSize: "0.75rem", textTransform: "uppercase", color: "#718096", borderBottom: "2px solid #e2e8f0" },
  td: { padding: "10px", borderBottom: "1px solid #edf2f7", color: "#2d3748" },
  note: { fontSize: "0.8rem", color: "#a0aec0", textAlign: "center", marginTop: "1rem" },
  footer: { display: "flex", gap: "1rem", justifyContent: "center", marginTop: "2rem", paddingBottom: "2rem" },
  footerBtn: { padding: "0.75rem 1.5rem", borderRadius: "50px", border: "2px solid #cbd5e0", color: "#4a5568", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" },
  footerBtnPrimary: { padding: "0.75rem 1.5rem", borderRadius: "50px", background: "#FF6B35", color: "white", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" },
};
