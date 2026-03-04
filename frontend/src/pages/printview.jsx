import { useState, useEffect, useRef } from "react";
import { useAuth } from "../App";
import { api } from "../api";

export default function PrintView({ seriesId, seriesName }) {
  const { user, navigate } = useAuth();
  const [standings, setStandings] = useState(null);
  const [races, setRaces] = useState([]);
  const [allResults, setAllResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [printMode, setPrintMode] = useState("standings"); // "standings" | "race" | "both"
  const printRef = useRef();

  useEffect(() => {
    Promise.all([
      api.get(`/series/${seriesId}/standings`, user.token),
      api.get(`/series/${seriesId}/races`, user.token),
    ]).then(async ([s, r]) => {
      setStandings(s);
      setRaces(r);
      const results = {};
      for (const race of r) {
        results[race.id] = await api.get(`/races/${race.id}/results`, user.token);
      }
      setAllResults(results);
    }).finally(() => setLoading(false));
  }, [seriesId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  const fleets = standings ? Object.keys(standings.fleet_standings) : [];
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="page">
      {/* Print Controls - hidden when printing */}
      <div className="print-controls no-print">
        <div className="page-header">
          <div>
            <button className="breadcrumb" onClick={() => navigate("standings", { seriesId, seriesName })}>← Standings</button>
            <h1 className="page-title">Print Results</h1>
            <p className="page-subtitle">{seriesName}</p>
          </div>
          <button className="btn-primary" onClick={handlePrint}>🖨 Print</button>
        </div>

        <div className="print-options">
          <div className="field">
            <label>What to Print</label>
            <div className="print-mode-tabs">
              <button className={`print-mode-tab ${printMode === "standings" ? "active" : ""}`} onClick={() => setPrintMode("standings")}>Series Standings</button>
              <button className={`print-mode-tab ${printMode === "race" ? "active" : ""}`} onClick={() => setPrintMode("race")}>Race Results</button>
              <button className={`print-mode-tab ${printMode === "both" ? "active" : ""}`} onClick={() => setPrintMode("both")}>Both</button>
            </div>
          </div>
        </div>

        <div className="print-preview-label">Preview</div>
      </div>

      {/* Printable Content */}
      <div ref={printRef} className="print-content">
        {/* STANDINGS */}
        {(printMode === "standings" || printMode === "both") && fleets.map((fleetName, fi) => (
          <div key={fleetName} className="print-page">
            <div className="print-header">
              <h1 className="print-series-title">{seriesName}</h1>
              <h2 className="print-section-title">{fleetName} Fleet — Series Standings</h2>
              <div className="print-meta">
                {standings.races_sailed} race{standings.races_sailed !== 1 ? "s" : ""} sailed
                {standings.throwouts > 0 && ` · ${standings.throwouts} throwout${standings.throwouts > 1 ? "s" : ""} applied`}
                {" · "}Printed {today}
              </div>
            </div>

            <table className="print-table">
              <thead>
                <tr>
                  <th className="col-pos">Pos</th>
                  <th className="col-sail">Sail #</th>
                  <th className="col-boat">Boat Name</th>
                  <th className="col-skipper">Skipper</th>
                  <th className="col-rating">PHRF</th>
                  {races.map(r => (
                    <th key={r.id} className="col-race">R{r.race_number}</th>
                  ))}
                  <th className="col-pts">Total</th>
                  {standings.throwouts > 0 && <th className="col-pts">Net</th>}
                </tr>
              </thead>
              <tbody>
                {standings.fleet_standings[fleetName].map(row => (
                  <tr key={row.boat_id}>
                    <td className="col-pos">
                      {row.position === 1 ? "1st" : row.position === 2 ? "2nd" : row.position === 3 ? "3rd" : `${row.position}th`}
                    </td>
                    <td className="col-sail">{row.sail_number}</td>
                    <td className="col-boat">{row.boat_name}</td>
                    <td className="col-skipper">{row.skipper}</td>
                    <td className="col-rating">{row.phrf_rating}</td>
                    {races.map(r => {
                      const rp = row.race_points[r.id];
                      return (
                        <td key={r.id} className={`col-race ${rp?.thrown_out ? "thrown-out-print" : ""}`}>
                          {rp ? rp.display : "DNS"}
                        </td>
                      );
                    })}
                    <td className="col-pts">
                      {standings.throwouts > 0 ? <span className="pts-gray">{row.total_points}</span> : <strong>{row.total_points}</strong>}
                    </td>
                    {standings.throwouts > 0 && (
                      <td className="col-pts"><strong>{row.net_points}</strong></td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="print-footer">
              <span>Scored using PHRF Time-on-Time · Corrected Time = Elapsed × (650 / (650 + Rating))</span>
              <span>Page {fi + 1} of {fleets.length}</span>
            </div>
          </div>
        ))}

        {/* RACE RESULTS */}
        {(printMode === "race" || printMode === "both") && races.map((race, ri) => (
          fleets.map((fleetName, fi) => {
            const fleetBoatIds = new Set(
              (standings?.fleet_standings[fleetName] || []).map(r => r.boat_id)
            );
            const raceResults = (allResults[race.id] || []).filter(r => fleetBoatIds.has(r.boat_id));
            if (raceResults.length === 0) return null;
            return (
              <div key={`${race.id}-${fleetName}`} className="print-page">
                <div className="print-header">
                  <h1 className="print-series-title">{seriesName}</h1>
                  <h2 className="print-section-title">
                    Race {race.race_number}{race.name ? ` — ${race.name}` : ""} · {fleetName} Fleet
                  </h2>
                  <div className="print-meta">
                    {race.race_date && `${race.race_date} · `}
                    {race.start_time && `Start: ${race.start_time} · `}
                    Printed {today}
                  </div>
                </div>

                <table className="print-table">
                  <thead>
                    <tr>
                      <th className="col-pos">Pos</th>
                      <th className="col-sail">Sail #</th>
                      <th className="col-boat">Boat Name</th>
                      <th className="col-skipper">Skipper</th>
                      <th className="col-rating">PHRF</th>
                      <th className="col-time">Elapsed</th>
                      <th className="col-time">Corrected</th>
                      <th className="col-pts">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {raceResults.map(r => (
                      <tr key={r.boat_id}>
                        <td className="col-pos">
                          {r.position ? (r.position === 1 ? "1st" : r.position === 2 ? "2nd" : r.position === 3 ? "3rd" : `${r.position}th`) : "—"}
                        </td>
                        <td className="col-sail">{r.sail_number}</td>
                        <td className="col-boat">{r.boat_name}</td>
                        <td className="col-skipper">{r.skipper}</td>
                        <td className="col-rating">{r.phrf_rating}</td>
                        <td className="col-time">{r.elapsed_display || "—"}</td>
                        <td className="col-time">{r.corrected_display || "—"}</td>
                        <td className="col-pts">{r.status !== "FIN" ? r.status : r.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="print-footer">
                  <span>Scored using PHRF Time-on-Time · Corrected Time = Elapsed × (650 / (650 + Rating))</span>
                  <span>Race {race.race_number} · {fleetName} Fleet</span>
                </div>
              </div>
            );
          })
        ))}
      </div>
    </div>
  );
}