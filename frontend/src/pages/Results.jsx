import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL;

function fetchPublic(path) {
  return fetch(`${API}${path}`).then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  });
}

// ── Series List ───────────────────────────────────────────────────────────────
function SeriesList({ onSelect }) {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublic("/public/series")
      .then(setSeries)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="results-loading">Loading series…</div>;

  return (
    <div className="results-series-list">
      <h2 className="results-section-title">All Series</h2>
      {series.length === 0 ? (
        <p className="results-empty">No series available yet.</p>
      ) : (
        <div className="results-cards">
          {series.map(s => (
            <button key={s.id} className="results-series-card" onClick={() => onSelect(s)}>
              <span className="results-series-name">{s.name}</span>
              {s.season && <span className="results-series-season">{s.season}</span>}
              <span className="results-series-arrow">View Results →</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Series Results ────────────────────────────────────────────────────────────
function SeriesResults({ series: seriesMeta, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFleet, setActiveFleet] = useState(null);
  const [activeRace, setActiveRace] = useState(null);
  const [raceDetail, setRaceDetail] = useState(null);
  const [raceDetailLoading, setRaceDetailLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectRace = (race) => {
    if (activeRace?.id === race.id) {
      setActiveRace(null);
      setRaceDetail(null);
      return;
    }
    setActiveRace(race);
    setRaceDetail(null);
    setRaceDetailLoading(true);
    fetchPublic(`/public/races/${race.id}/results`)
      .then(setRaceDetail)
      .finally(() => setRaceDetailLoading(false));
  };

  useEffect(() => {
    fetchPublic(`/public/series/${seriesMeta.id}/standings`)
      .then(d => {
        setData(d);
        // Set first fleet with boats as default
        const fleets = getFleets(d.standings?.rows || []);
        if (fleets.length > 0) setActiveFleet(fleets[0]);
      })
      .finally(() => setLoading(false));
  }, [seriesMeta.id]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="results-loading">Loading results…</div>;
  if (!data) return <div className="results-empty">Could not load results.</div>;

  const { races, standings } = data;
  const rows = standings?.rows || [];
  const fleets = getFleets(rows);

  const fleetRows = activeFleet ? rows.filter(r => r.fleet === activeFleet) : rows;

  // Race detail rows filtered by active fleet
  const raceDetailRows = raceDetail
    ? (activeFleet ? raceDetail.filter(r => {
        const boatRow = rows.find(b => b.boat_id === r.boat_id);
        return boatRow?.fleet === activeFleet;
      }) : raceDetail)
    : null;

  return (
    <div className="results-series">
      <div className="results-header">
        <button className="results-back" onClick={onBack}>← All Series</button>
        <div className="results-title-block">
          <h1 className="results-title">{data.series.name}</h1>
          {data.series.season && <span className="results-season">{data.series.season}</span>}
        </div>
        <button className="results-share-btn" onClick={copyLink}>
          {copied ? "✓ Copied!" : "🔗 Copy Link"}
        </button>
      </div>

      {/* Fleet tabs */}
      {fleets.length > 1 && (
        <div className="results-fleet-tabs">
          {fleets.map(f => (
            <button
              key={f}
              className={`results-fleet-tab ${activeFleet === f ? "active" : ""}`}
              onClick={() => setActiveFleet(f)}
            >
              {f} Fleet
            </button>
          ))}
        </div>
      )}

      {/* Standings table */}
      <div className="results-card">
        <h2 className="results-card-title">
          {activeFleet ? `${activeFleet} Fleet — ` : ""}Series Standings
          {data.series.throwouts > 0 && <span className="results-throwout-note"> ({data.series.throwouts} throwout{data.series.throwouts > 1 ? "s" : ""})</span>}
        </h2>
        <div className="results-table-wrap">
          <table className="results-table">
            <thead>
              <tr>
                <th>Pos</th>
                <th>Sail #</th>
                <th>Boat</th>
                <th>Skipper</th>
                <th>Rating</th>
                {races.map(r => (
                  <th
                    key={r.id}
                    className={`results-race-col ${activeRace?.id === r.id ? "active-race-col" : ""}`}
                    onClick={() => selectRace(r)}
                    title="Click to see race details"
                  >
                    R{r.race_number}
                  </th>
                ))}
                <th>Net</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {fleetRows.map((row, i) => (
                <tr key={row.boat_id} className={i % 2 === 0 ? "row-even" : "row-odd"}>
                  <td className="pos-cell">
                    {row.position === 1 ? "🥇" : row.position === 2 ? "🥈" : row.position === 3 ? "🥉" : row.position}
                  </td>
                  <td>{row.sail_number}</td>
                  <td className="boat-name-cell">{row.boat_name}</td>
                  <td>{row.skipper}</td>
                  <td>{row.phrf_rating ?? "—"}</td>
                  {races.map(r => {
                    const pts = row.race_points?.[r.id];
                    return (
                      <td
                        key={r.id}
                        className={`race-pts-cell ${pts?.throwout ? "throwout" : ""} ${activeRace?.id === r.id ? "active-race-col" : ""}`}
                        title={pts?.throwout ? "Throwout" : ""}
                      >
                        {pts?.display ?? "—"}
                      </td>
                    );
                  })}
                  <td className="net-pts-cell">{row.net_points}</td>
                  <td>{row.total_points}</td>
                </tr>
              ))}
              {fleetRows.length === 0 && (
                <tr><td colSpan={8 + races.length} className="results-empty-row">No results yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Race detail panel */}
      {activeRace && (
        <div className="results-card results-race-detail">
          <h2 className="results-card-title">
            Race {activeRace.race_number}{activeRace.name ? ` — ${activeRace.name}` : ""}
            {activeRace.race_date ? <span className="results-race-date"> · {activeRace.race_date}</span> : ""}
            <button className="results-close-race" onClick={() => { setActiveRace(null); setRaceDetail(null); }}>✕</button>
          </h2>
          {raceDetailLoading ? (
            <div className="results-loading">Loading race results…</div>
          ) : raceDetailRows && raceDetailRows.length > 0 ? (
            <div className="results-table-wrap">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Pos</th>
                    <th>Sail #</th>
                    <th>Boat</th>
                    <th>Skipper</th>
                    <th>Fleet</th>
                    <th>Elapsed</th>
                    <th>Corrected</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {raceDetailRows.map((row, i) => (
                    <tr key={row.boat_id} className={i % 2 === 0 ? "row-even" : "row-odd"}>
                      <td className="pos-cell">
                        {row.position === 1 ? "🥇" :
                         row.position === 2 ? "🥈" :
                         row.position === 3 ? "🥉" :
                         row.position ?? row.status}
                      </td>
                      <td>{row.sail_number}</td>
                      <td className="boat-name-cell">{row.boat_name}</td>
                      <td>{row.skipper}</td>
                      <td>{rows.find(b => b.boat_id === row.boat_id)?.fleet ?? "—"}</td>
                      <td>{row.elapsed_display ?? "—"}</td>
                      <td>{row.corrected_display ?? "—"}</td>
                      <td>{row.status !== "FIN" ? `${row.status} (${Math.round(row.points)})` : Math.round(row.points)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="results-empty">No results recorded for this race yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

function getFleets(rows) {
  const seen = new Set();
  const fleets = [];
  for (const r of rows) {
    if (r.fleet && !seen.has(r.fleet)) {
      seen.add(r.fleet);
      fleets.push(r.fleet);
    }
  }
  return fleets;
}

// ── Main Results Page ─────────────────────────────────────────────────────────
export default function Results() {
  const [selected, setSelected] = useState(null);

  // Support direct URL like /results/3
  useEffect(() => {
    const match = window.location.pathname.match(/\/results\/(\d+)/);
    if (match) {
      fetchPublic(`/public/series/${match[1]}/standings`)
        .then(d => setSelected({ id: d.series.id, name: d.series.name, season: d.series.season }))
        .catch(() => {});
    }
  }, []);

  // Update URL when series selected
  const handleSelect = (s) => {
    setSelected(s);
    window.history.pushState({}, "", `/results/${s.id}`);
  };

  const handleBack = () => {
    setSelected(null);
    window.history.pushState({}, "", "/results");
  };

  return (
    <div className="results-page">
      <div className="results-nav">
        <span className="results-brand">⛵ SailScore</span>
        <a href="/" className="results-login-link">Login</a>
      </div>
      <div className="results-content">
        {selected
          ? <SeriesResults series={selected} onBack={handleBack} />
          : <SeriesList onSelect={handleSelect} />
        }
      </div>
    </div>
  );
}
