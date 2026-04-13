import { useState, useEffect } from "react";
import { useAuth } from "../App";
import { api, formatElapsed, calcElapsed } from "../api";
import Modal from "../components/Modal";

const STATUS_OPTIONS = ["FIN", "DNF", "DNS", "DSQ", "DNC"];
const STATUS_COLORS = { FIN: "green", DNF: "orange", DNS: "gray", DSQ: "red", DNC: "gray" };

export default function RaceEntry({ seriesId, seriesName }) {
  const { user, navigate } = useAuth();
  const [races, setRaces] = useState([]);
  const [fleetStartTimes, setFleetStartTimes] = useState({});
  const [selectedRace, setSelectedRace] = useState(null);
  const [boats, setBoats] = useState([]);
  const [finishes, setFinishes] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRaceModal, setShowRaceModal] = useState(false);
  const [editRace, setEditRace] = useState(null);
  const [raceForm, setRaceForm] = useState({ race_number: "", name: "", race_date: "", start_time: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [entries, setEntries] = useState({});
  const [submitMsg, setSubmitMsg] = useState("");
  const [scoringFleet, setScoringFleet] = useState({});
  const [dirtyEntries, setDirtyEntries] = useState(new Set());
  const [scoringAll, setScoringAll] = useState(false);

  // Pursuit race state
  const [pursuitFirstStart, setPursuitFirstStart] = useState("10:00:00");
  const [pursuitDuration, setPursuitDuration] = useState(90);
  const [showPursuitSheet, setShowPursuitSheet] = useState(false);

  const scoreAllFleets = async () => {
    const fleetGroups = visibleBoats.reduce((groups, boat) => {
      const fleet = boat.fleet || "NFS";
      if (!groups[fleet]) groups[fleet] = [];
      groups[fleet].push(boat);
      return groups;
    }, {});
    setScoringAll(true);
    try {
      for (const [fleetName, fleetBoats] of Object.entries(fleetGroups)) {
        await scoreFleet(fleetName, fleetBoats);
      }
      setSubmitMsg("All fleets scored ✓");
      setTimeout(() => setSubmitMsg(""), 3000);
    } catch (err) {
      setSubmitMsg("Error: " + err.message);
    } finally {
      setScoringAll(false);
    }
  };

  const scoreFleet = async (fleetName, fleetBoats) => {
    setScoringFleet(prev => ({ ...prev, [fleetName]: true }));
    try {
      for (const boat of fleetBoats) {
        const entry = entries[boat.id];
        const status = entry?.status || "DNS";
        // Only compute elapsed for FIN boats that have a finish time entry
        const elapsed = status === "FIN" ? getElapsed(boat.id) : null;
        await api.post(`/races/${selectedRace.id}/finishes`,
          { boat_id: boat.id, elapsed_seconds: elapsed, status },
          user.token
        );
      }
      await loadFinishesAndResults();
      setSubmitMsg(`${fleetName} fleet scored ✓`);
      setTimeout(() => setSubmitMsg(""), 3000);
    } catch (err) {
      setSubmitMsg("Error: " + err.message);
    } finally {
      setScoringFleet(prev => ({ ...prev, [fleetName]: false }));
    }
  };

  const loadRaces = () =>
    api.get(`/series/${seriesId}/races`, user.token).then(r => {
      setRaces(r);
      if (r.length > 0 && !selectedRace) setSelectedRace(r[r.length - 1]);
    }).finally(() => setLoading(false));

  const loadBoats = () =>
    api.get(`/series/${seriesId}/boats`, user.token).then(setBoats);

  useEffect(() => { loadRaces(); loadBoats(); }, [seriesId]);

  useEffect(() => {
    if (!selectedRace) return;
    loadFinishesAndResults();
  }, [selectedRace]);

  const loadFinishesAndResults = async () => {
    const [fins, res] = await Promise.all([
      api.get(`/races/${selectedRace.id}/finishes`, user.token),
      api.get(`/races/${selectedRace.id}/results`, user.token),
    ]);
    setFinishes(fins);
    setResults(res);

    const map = {};
    fins.forEach(f => {
      map[f.boat_id] = {
        finishTime: f.elapsed_seconds != null && selectedRace.start_time
          ? secondsToTimeOfDay(parseTimeOfDay(selectedRace.start_time) + f.elapsed_seconds)
          : "",
        status: f.status,
      };
    });
    setEntries(map);
    setDirtyEntries(new Set());
  };

  const parseTimeOfDay = (str) => {
    if (!str) return null;
    const parts = str.trim().split(":").map(Number);
    if (parts.some(isNaN)) return null;
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 3600 + parts[1] * 60;
    return null;
  };

  const secondsToTimeOfDay = (totalSeconds) => {
    if (totalSeconds == null) return "";
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const getElapsed = (boatId) => {
    const boat = boats.find(b => b.id === boatId);
    const fleetName = boat?.fleet || "NFS";
    const entry = entries[boatId] || {};
    if (entry.status !== "FIN" && entry.status) return null;
    let startTime;
    if (fleetName.toLowerCase() === "distance") {
      // Use this boat's individual pursuit start time
      const pursuitBoat = pursuitStarts.find(p => p.id === boatId);
      startTime = pursuitBoat?.pursuitStart || null;
    } else {
      startTime = fleetStartTimes[fleetName] || selectedRace?.start_time;
    }
    const startSecs = parseTimeOfDay(startTime);
    const finishSecs = parseTimeOfDay(entry.finishTime);
    if (startSecs === null || finishSecs === null) return null;
    const elapsed = finishSecs - startSecs;
    return elapsed > 0 ? elapsed : null;
  };

  const openNewRace = () => {
    const nextNum = races.length > 0 ? Math.max(...races.map(r => r.race_number)) + 1 : 1;
    setEditRace(null);
    setRaceForm({ race_number: nextNum, name: "", race_date: new Date().toISOString().split("T")[0], start_time: "" });
    setError("");
    setShowRaceModal(true);
  };

  const openEditRace = (r) => {
    setEditRace(r);
    setRaceForm({ race_number: r.race_number, name: r.name || "", race_date: r.race_date || "", start_time: r.start_time || "" });
    setError("");
    setShowRaceModal(true);
  };

  const saveRace = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = { ...raceForm, race_number: Number(raceForm.race_number) };
      let saved;
      if (editRace) {
        saved = await api.put(`/races/${editRace.id}`, body, user.token);
      } else {
        saved = await api.post(`/series/${seriesId}/races`, body, user.token);
      }
      setShowRaceModal(false);
      await loadRaces();
      setSelectedRace(saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteRace = async (id) => {
    if (!confirm("Delete this race and all its finishes?")) return;
    await api.delete(`/races/${id}`, user.token);
    setSelectedRace(null);
    setFinishes([]);
    setResults([]);
    setEntries({});
    loadRaces();
  };

  const setEntry = (boatId, field, value) => {
    setDirtyEntries(prev => new Set(prev).add(boatId));
    setEntries(prev => ({
      ...prev,
      [boatId]: { ...(prev[boatId] || { finishTime: "", status: "FIN" }), [field]: value }
    }));
  };

  const submitFinish = async (boatId) => {
    const entry = entries[boatId] || { finishTime: "", status: "FIN" };
    const status = entry.status || "FIN";
    let elapsed = null;

    if (status === "FIN") {
      elapsed = getElapsed(boatId);
      if (elapsed === null) {
        setSubmitMsg("Invalid or missing start/finish time");
        setTimeout(() => setSubmitMsg(""), 3000);
        return;
      }
    }

    try {
      await api.post(`/races/${selectedRace.id}/finishes`,
        { boat_id: boatId, elapsed_seconds: elapsed, status },
        user.token
      );
      await loadFinishesAndResults();
      setSubmitMsg("Saved ✓");
      setTimeout(() => setSubmitMsg(""), 2000);
    } catch (err) {
      setSubmitMsg("Error: " + err.message);
    }
  };

  const submitAll = async () => {
    setSaving(true);
    for (const boat of boats) {
      await submitFinish(boat.id);
    }
    setSaving(false);
  };
  const clearAllResults = async () => {
    if (!confirm("Clear all finish times for this race? Boats will be reset to DNS. This cannot be undone.")) return;
    for (const boat of boats) {
      await api.post(`/races/${selectedRace.id}/finishes`,
        { boat_id: boat.id, elapsed_seconds: null, status: "DNS" },
        user.token
      );
    }
    setEntries({});
    setFleetStartTimes({});
    await loadFinishesAndResults();
    setSubmitMsg("All results cleared ✓");
    setTimeout(() => setSubmitMsg(""), 2500);
  };
const applyFleetStartTime = (fleetName, startTime) => {
  const fleetBoats = boats.filter(b => (b.fleet || "NFS") === fleetName);
  setEntries(prev => {
    const updated = { ...prev };
    fleetBoats.forEach(boat => {
      updated[boat.id] = {
        ...(updated[boat.id] || { finishTime: "", status: "FIN" }),
      };
    });
    return updated;
  });
  // Update the selected race start time display
  setSelectedRace(prev => ({ ...prev, start_time: startTime }));
};

  const resultMap = {};
  results.forEach(r => { resultMap[r.boat_id] = r; });

  const distanceBoats = boats.filter(b => (b.fleet || "").toLowerCase() === "distance");
  const isDistance = (selectedRace?.name || "").toLowerCase().includes("distance");
  const visibleBoats = isDistance
    ? distanceBoats
    : boats.filter(b => (b.fleet || "").toLowerCase() !== "distance");

  // Pursuit Race Calculator - TOD (Time on Distance)
  const calcPursuitStarts = () => {
    if (!pursuitFirstStart || !pursuitDuration || distanceBoats.length === 0) return [];
    const distanceNM = pursuitDuration; // reusing field as distance in NM
    const sorted = [...distanceBoats].sort((a, b) => b.phrf_rating - a.phrf_rating);
    const slowestPHRF = sorted[0].phrf_rating;
    const [fh, fm, fs] = pursuitFirstStart.split(":").map(Number);
    const firstStartSecs = fh * 3600 + fm * 60 + (fs || 0);
    return sorted.map(boat => {
      // TOD offset: (slowest_PHRF - this_PHRF) * distance  (in seconds, PHRF is sec/NM)
      const offsetSecs = Math.round((slowestPHRF - boat.phrf_rating) * distanceNM);
      const startSecs = firstStartSecs + offsetSecs;
      const h = Math.floor(startSecs / 3600);
      const m = Math.floor((startSecs % 3600) / 60);
      const s = startSecs % 60;
      const startTime = `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
      return { ...boat, pursuitStart: startTime, offsetSecs };
    });
  };

  const pursuitStarts = isDistance ? calcPursuitStarts() : [];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <button className="breadcrumb" onClick={() => navigate("dashboard")}>← My Series</button>
          <h1 className="page-title">{seriesName}</h1>
          <p className="page-subtitle">Race Entry</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => navigate("standings", { seriesId, seriesName })}>Standings →</button>
          <button className="btn-primary" onClick={openNewRace}>+ New Race</button>
        </div>
      </div>

      <div className="race-layout">
        <div className="race-sidebar">
          <div className="sidebar-title">Races</div>
          {loading ? <div className="spinner" /> : races.length === 0 ? (
            <div className="sidebar-empty">No races yet</div>
          ) : (
            races.map(r => (
              <button
                key={r.id}
                className={`race-tab ${selectedRace?.id === r.id ? "active" : ""}`}
                onClick={() => setSelectedRace(r)}
              >
                <span className="race-tab-num">R{r.race_number}</span>
                <span className="race-tab-detail">{r.name || r.race_date || "—"}</span>
              </button>
            ))
          )}
        </div>

        <div className="race-main">
          {!selectedRace ? (
            <div className="empty-state">
              <div className="empty-icon">🏁</div>
              <h3>Select or create a race</h3>
              <button className="btn-primary" onClick={openNewRace}>Create First Race</button>
            </div>
          ) : (
            <>
              <div className="race-entry-header">
                <div>
                  <h2 className="race-title">
                    Race {selectedRace.race_number}
                    {selectedRace.name && <span className="race-name-sub"> — {selectedRace.name}</span>}
                  </h2>
                  <div className="race-meta">
                    {selectedRace.race_date && <span className="race-date">{selectedRace.race_date}</span>}
                    {selectedRace.start_time && (
                      <span className="race-start">🚦 Start: <strong>{selectedRace.start_time}</strong></span>
                    )}
                  </div>
                </div>
                <div className="race-entry-actions">
                  <button className="btn-ghost-sm" onClick={() => openEditRace(selectedRace)}>Edit</button>
                  <button className="btn-ghost-sm danger" onClick={() => deleteRace(selectedRace.id)}>Delete</button>
                </div>
              </div>

              {!selectedRace.start_time && !isDistance && (
                <div className="start-time-warning">
                  ⚠️ No start time set for this race. <button className="link-btn" onClick={() => openEditRace(selectedRace)}>Add start time</button>
                </div>
              )}

              {/* Pursuit Race Calculator */}
              {isDistance && (
                <div style={{ background: "#f0f4f8", borderRadius: "10px", padding: "1.25rem", marginBottom: "1rem", border: "1px solid #cbd5e0" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1a365d" }}>⏱ Pursuit Start Calculator</h3>
                    <button className="btn-secondary" style={{ fontSize: "0.8rem" }} onClick={() => setShowPursuitSheet(s => !s)}>
                      {showPursuitSheet ? "Hide Start Sheet" : "🖨 Print Start Sheet"}
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
                    <div>
                      <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#4a5568", display: "block", marginBottom: "4px" }}>First Boat Start Time (slowest)</label>
                      <input type="text" placeholder="HH:MM:SS" value={pursuitFirstStart}
                        onChange={e => setPursuitFirstStart(e.target.value)}
                        style={{ padding: "0.4rem 0.6rem", borderRadius: "6px", border: "1px solid #cbd5e0", fontSize: "0.9rem", width: "120px" }} />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#4a5568", display: "block", marginBottom: "4px" }}>Course Distance (nautical miles)</label>
                      <input type="number" placeholder="e.g. 15" value={pursuitDuration}
                        onChange={e => setPursuitDuration(Number(e.target.value))}
                        style={{ padding: "0.4rem 0.6rem", borderRadius: "6px", border: "1px solid #cbd5e0", fontSize: "0.9rem", width: "100px" }} />
                    </div>
                  </div>

                  {showPursuitSheet && pursuitStarts.length > 0 && (
                    <div style={{ marginTop: "1rem" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem", background: "white", borderRadius: "8px", overflow: "hidden" }}>
                        <thead>
                          <tr style={{ background: "#1a365d", color: "white" }}>
                            <th style={{ padding: "8px 12px", textAlign: "left" }}>Sail #</th>
                            <th style={{ padding: "8px 12px", textAlign: "left" }}>Boat</th>
                            <th style={{ padding: "8px 12px", textAlign: "left" }}>Skipper</th>
                            <th style={{ padding: "8px 12px", textAlign: "left" }}>Club</th>
                            <th style={{ padding: "8px 12px", textAlign: "right" }}>PHRF</th>
                            <th style={{ padding: "8px 12px", textAlign: "right" }}>Start Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pursuitStarts.map((b, i) => (
                            <tr key={b.id} style={{ background: i % 2 === 0 ? "#f7fafc" : "white", borderBottom: "1px solid #e2e8f0" }}>
                              <td style={{ padding: "8px 12px", fontWeight: 600 }}>{b.sail_number}</td>
                              <td style={{ padding: "8px 12px" }}>{b.boat_name}</td>
                              <td style={{ padding: "8px 12px" }}>{b.skipper}</td>
                              <td style={{ padding: "8px 12px" }}>{b.club || "—"}</td>
                              <td style={{ padding: "8px 12px", textAlign: "right" }}>{b.phrf_rating}</td>
                              <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: "#FF6B35", fontFamily: "monospace" }}>{b.pursuitStart}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "#718096" }}>
                        First start {pursuitFirstStart} · Course distance {pursuitDuration} NM · PHRF-LO TOD · Offset = (PHRF_slow − PHRF_boat) × distance
                      </div>
                    </div>
                  )}
                </div>
              )}

              {visibleBoats.length === 0 ? (
                <div className="empty-state small">
                  <p>No boats in fleet yet. <button className="link-btn" onClick={() => navigate("fleet", { seriesId, seriesName })}>Add boats</button> first.</p>
                </div>
              ) : (
                <>
                  <div className="entry-table-wrap">
  {Object.entries(
    visibleBoats.reduce((groups, boat) => {
      const fleet = boat.fleet || "NFS";
      if (!groups[fleet]) groups[fleet] = [];
      groups[fleet].push(boat);
      return groups;
    }, {})
  ).map(([fleetName, fleetBoats]) => (
    <div key={fleetName} className="fleet-entry-block">
      <div className="fleet-entry-header">
        <span className="fleet-entry-title">{fleetName} Fleet</span>
        {fleetName.toLowerCase() !== "distance" && (
          <div className="fleet-start-controls">
            <label className="fleet-start-label">Fleet Start Time:</label>
            <input
              className="time-input"
              type="text"
              placeholder="13:00:00"
              value={fleetStartTimes[fleetName] || ""}
              onChange={e => setFleetStartTimes(prev => ({ ...prev, [fleetName]: e.target.value }))}
            />
            <button
              className="btn-apply-start"
              onClick={() => {
                const t = fleetStartTimes[fleetName];
                if (!t) return;
                setSelectedRace(prev => ({ ...prev, start_time: t }));
                const updated = { ...entries };
                fleetBoats.forEach(boat => {
                  updated[boat.id] = {
                    ...(updated[boat.id] || { finishTime: "", status: "FIN" }),
                  };
                });
                setEntries(updated);
                setSubmitMsg(`Start time ${t} applied to ${fleetName} fleet ✓`);
                setTimeout(() => setSubmitMsg(""), 2500);
              }}
            >
              Apply to {fleetName}
            </button>
          </div>
        )}
      </div>
      {fleetName.toLowerCase() === "distance" ? (() => {
        // Sort distance boats by pursuit start time order (slowest PHRF first)
        const pursuitMap = {};
        pursuitStarts.forEach(b => { pursuitMap[b.id] = b.pursuitStart; });
        const sortedBoats = [...fleetBoats].sort((a, b) => b.phrf_rating - a.phrf_rating);
        return (
          <table className="entry-table">
            <thead>
              <tr>
                <th>Sail #</th>
                <th>Boat / Skipper</th>
                <th>PHRF</th>
                <th>Start Time</th>
                <th>Status</th>
                <th>Finish Time (HH:MM:SS)</th>
                <th>Pos</th>
              </tr>
            </thead>
            <tbody>
              {sortedBoats.map(boat => {
                const entry = entries[boat.id] || { finishTime: "", status: "FIN" };
                const result = resultMap[boat.id];
                const isFin = entry.status === "FIN";
                const boatStart = showPursuitSheet ? (pursuitMap[boat.id] || "—") : "—";
                return (
                  <tr key={boat.id} className={result ? "has-result" : ""}>
                    <td><span className="sail-num">{boat.sail_number}</span></td>
                    <td>
                      <div className="boat-cell">
                        <button
                          className="boat-name-btn"
                          onClick={() => {
                            const now = new Date();
                            const h = String(now.getHours()).padStart(2, "0");
                            const m = String(now.getMinutes()).padStart(2, "0");
                            const s = String(now.getSeconds()).padStart(2, "0");
                            setEntry(boat.id, "finishTime", `${h}:${m}:${s}`);
                            setEntry(boat.id, "status", "FIN");
                          }}
                          title="Click to stamp finish time"
                        >
                          {boat.boat_name}
                        </button>
                        <span className="skipper-name">{boat.skipper}</span>
                      </div>
                    </td>
                    <td className="num-col">{boat.phrf_rating}</td>
                    <td className="num-col mono" style={{ color: showPursuitSheet && pursuitMap[boat.id] ? "#FF6B35" : "#a0aec0", fontWeight: 600 }}>
                      {boatStart}
                    </td>
                    <td>
                      <select
                        className={`status-select status-${STATUS_COLORS[entry.status] || "gray"}`}
                        value={entry.status || "FIN"}
                        onChange={e => setEntry(boat.id, "status", e.target.value)}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      {isFin ? (
                        <input
                          className="time-input"
                          type="text"
                          placeholder="14:23:45"
                          value={entry.finishTime}
                          onChange={e => setEntry(boat.id, "finishTime", e.target.value)}
                          onKeyDown={e => e.key === "Enter" && submitFinish(boat.id)}
                        />
                      ) : (
                        <span className="na-text">—</span>
                      )}
                    </td>
                    <td className="num-col">
                      {result?.position != null ? (
                        <span className="pos-badge">
                          {result.position === 1 ? "🥇" : result.position === 2 ? "🥈" : result.position === 3 ? "🥉" : `${result.position}th`}
                        </span>
                      ) : result?.status && result.status !== "FIN" ? (
                        <span className={`status-pill status-${STATUS_COLORS[result.status] || "gray"}`}>
                          {result.status}
                        </span>
                      ) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
      })() : (
      <table className="entry-table">
        <thead>
          <tr>
            <th>Sail #</th>
            <th>Boat / Skipper</th>
            <th>PHRF</th>
            <th>Status</th>
            <th>Finish Time (HH:MM:SS)</th>
            <th>Elapsed</th>
            <th>Corrected</th>
            <th>Pos</th>
          </tr>
        </thead>
        <tbody>
          {fleetBoats.map(boat => {
            const entry = entries[boat.id] || { finishTime: "", status: "FIN" };
            const result = resultMap[boat.id];
            const isFin = entry.status === "FIN";
            const startTime = fleetStartTimes[fleetName] || selectedRace?.start_time;
            const startSecs = parseTimeOfDay(startTime);
            const finishSecs = parseTimeOfDay(entry.finishTime);
            const elapsed = isFin && startSecs != null && finishSecs != null && finishSecs > startSecs
              ? finishSecs - startSecs
              : null;
            return (
              <tr key={boat.id} className={result ? "has-result" : ""}>
                <td><span className="sail-num">{boat.sail_number}</span></td>
                <td>
                  <div className="boat-cell">
                    <button
                       className="boat-name-btn"
                       onClick={() => {
                         const now = new Date();
                         const h = String(now.getHours()).padStart(2, "0");
                         const m = String(now.getMinutes()).padStart(2, "0");
                         const s = String(now.getSeconds()).padStart(2, "0");
                         const timeStr = `${h}:${m}:${s}`;
                         setEntry(boat.id, "finishTime", timeStr);
                         setEntry(boat.id, "status", "FIN");
                       }}
                       title="Click to stamp finish time"
                     >
                       {boat.boat_name}
                     </button>
                    <span className="skipper-name">{boat.skipper}</span>
                  </div>
                </td>
                <td className="num-col">{boat.phrf_rating}</td>
                <td>
                  <select
                    className={`status-select status-${STATUS_COLORS[entry.status] || "gray"}`}
                    value={entry.status || "FIN"}
                    onChange={e => setEntry(boat.id, "status", e.target.value)}
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td>
                  {isFin ? (
                    <input
                      className="time-input"
                      type="text"
                      placeholder="14:23:45"
                      value={entry.finishTime}
                      onChange={e => setEntry(boat.id, "finishTime", e.target.value)}
                      onKeyDown={e => e.key === "Enter" && submitFinish(boat.id)}
                    />
                  ) : (
                    <span className="na-text">—</span>
                  )}
                </td>
                <td className="num-col mono">
                  {elapsed != null ? formatElapsed(elapsed) : "—"}
                </td>
                <td className="num-col mono">
                  {result?.corrected_display || "—"}
                </td>
                <td className="num-col">
                  {result?.position != null ? (
                    <span className="pos-badge">
                      {result.position === 1 ? "🥇" : result.position === 2 ? "🥈" : result.position === 3 ? "🥉" : `${result.position}th`}
                    </span>
                  ) : result?.status !== "FIN" ? (
                    <span className={`status-pill status-${STATUS_COLORS[result?.status] || "gray"}`}>
                      {result?.status}
                    </span>
                  ) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      )}
    </div>
  ))}
</div>

                  <div className="entry-footer">
                    {submitMsg && <span className="save-msg">{submitMsg}</span>}
                    <button className="btn-clear" onClick={clearAllResults}>
                      🗑 Clear All Results
                    </button>
                    <button className="btn-primary" onClick={scoreAllFleets} disabled={scoringAll}>
                      {scoringAll ? "Scoring..." : "🏁 Score All Fleets"}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {showRaceModal && (
        <Modal title={editRace ? "Edit Race" : "New Race"} onClose={() => setShowRaceModal(false)}>
          <form onSubmit={saveRace}>
            <div className="field-row">
              <div className="field">
                <label>Race Number</label>
                <input type="number" min="1" value={raceForm.race_number}
                  onChange={e => setRaceForm({ ...raceForm, race_number: e.target.value })} required />
              </div>
              <div className="field">
                <label>Date</label>
                <input type="date" value={raceForm.race_date}
                  onChange={e => setRaceForm({ ...raceForm, race_date: e.target.value })} />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label>Race Name (optional)</label>
                <input type="text" placeholder="e.g. Spinnaker Race" value={raceForm.name}
                  onChange={e => setRaceForm({ ...raceForm, name: e.target.value })} />
              </div>
              <div className="field">
                <label>Start Time (HH:MM:SS)</label>
                <input type="text" placeholder="13:00:00" value={raceForm.start_time}
                  onChange={e => setRaceForm({ ...raceForm, start_time: e.target.value })} />
              </div>
            </div>
            {error && <div className="form-error">{error}</div>}
            <div className="modal-footer">
              <button type="button" className="btn-ghost" onClick={() => setShowRaceModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving..." : editRace ? "Save Changes" : "Create Race"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}