import { useState, useEffect } from "react";
import { useAuth } from "../App";
import { api } from "../api";

export default function Standings({ seriesId, seriesName }) {
  const { user, navigate } = useAuth();
  const [standings, setStandings] = useState(null);
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/series/${seriesId}/standings`, user.token),
      api.get(`/series/${seriesId}/races`, user.token),
    ]).then(([s, r]) => {
      setStandings(s);
      setRaces(r);
    }).finally(() => setLoading(false));
  }, [seriesId]);

  const exportCSV = async () => {
    setExporting(true);
    try {
      const blob = await api.get(`/series/${seriesId}/export/csv`, user.token);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${seriesName.replace(/\s+/g, "_")}_standings.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Export failed: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  const noRaces = !standings || standings.races_sailed === 0;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <button className="breadcrumb" onClick={() => navigate("dashboard")}>← My Series</button>
          <h1 className="page-title">{seriesName}</h1>
          <p className="page-subtitle">
            Series Standings
            {standings && standings.throwouts > 0 && (
              <span className="throwout-note"> · {standings.throwouts} throwout{standings.throwouts > 1 ? "s" : ""} applied</span>
            )}
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => navigate("race", { seriesId, seriesName })}>← Race Entry</button>
          <button className="btn-secondary" onClick={() => navigate("print", { seriesId, seriesName })}>
             🖨 Print
          </button>
          {!noRaces && (
            <button className="btn-primary" onClick={exportCSV} disabled={exporting}>
              {exporting ? "Exporting..." : "⬇ Export CSV"}
            </button>
          )}
        </div>
      </div>

      {noRaces ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No races scored yet</h3>
          <p>Go to Race Entry to record finish times.</p>
          <button className="btn-primary" onClick={() => navigate("race", { seriesId, seriesName })}>Race Entry</button>
        </div>
      ) : (
        <>
          <div className="standings-meta">
            <span className="meta-chip">🏁 {standings.races_sailed} race{standings.races_sailed !== 1 ? "s" : ""} sailed</span>
            <span className="meta-chip">⛵ {standings.rows.length} boat{standings.rows.length !== 1 ? "s" : ""}</span>
            {standings.throwouts > 0 && (
              <span className="meta-chip throwout-chip">[brackets] = thrown out</span>
            )}
          </div>

          {Object.entries(standings.fleet_standings).map(([fleetName, rows]) => (
            <div key={fleetName} className="fleet-standings-block">
              <h2 className="fleet-title">{fleetName} Fleet</h2>
              <div className="table-wrap standings-wrap">
                <table className="data-table standings-table">
                  <thead>
                    <tr>
                      <th className="pos-th">Pos</th>
                      <th>Boat</th>
                      <th>Skipper</th>
                      <th>Club</th>
                      <th className="num-col">PHRF</th>
                      {races.map(r => (
                        <th key={r.id} className="num-col race-col">
                          <div className="race-th">R{r.race_number}</div>
                          {r.race_date && <div className="race-th-date">{r.race_date}</div>}
                        </th>
                      ))}
                      <th className="num-col">Total</th>
                      {standings.throwouts > 0 && <th className="num-col net-col">Net</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(row => (
                      <tr key={row.boat_id} className={`standings-row pos-${row.position}`}>
                        <td className="pos-cell">
                          <span className="pos-num">
                            {row.position === 1 ? "🥇" : row.position === 2 ? "🥈" : row.position === 3 ? "🥉" : row.position}
                          </span>
                        </td>
                        <td>
                          <div className="boat-cell">
                            <span className="sail-num">{row.sail_number}</span>
                            <span className="boat-name">{row.boat_name}</span>
                          </div>
                        </td>
                        <td>{row.skipper}</td>
                        <td>{row.club ?? "—"}</td>
                        <td className="num-col">{row.phrf_rating}</td>
                        {races.map(r => {
                          const rp = row.race_points[r.id];
                          const isThrown = rp?.thrown_out;
                          return (
                            <td key={r.id} className={`num-col race-pts ${isThrown ? "thrown-out" : ""}`}>
                              {rp ? rp.display : "DNS"}
                            </td>
                          );
                        })}
                        <td className="num-col total-pts">
                          {standings.throwouts > 0 ? (
                            <span className="pts-muted">{row.total_points}</span>
                          ) : (
                            <strong>{row.total_points}</strong>
                          )}
                        </td>
                        {standings.throwouts > 0 && (
                          <td className="num-col net-col net-pts">
                            <strong>{row.net_points}</strong>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <div className="standings-legend">
            <strong>Legend:</strong> DNF/DNS/DNC = fleet+1 pts · DSQ = fleet+2 pts · [brackets] = throwout
          </div>
        </>
      )}
    </div>
  );
}