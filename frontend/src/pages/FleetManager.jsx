import { useState, useEffect, useRef } from "react";
import { useAuth } from "../App";
import { api } from "../api";
import Modal from "../components/Modal";
import * as XLSX from "xlsx";

export default function FleetManager({ seriesId, seriesName }) {
  const { user, navigate } = useAuth();
  const [boats, setBoats] = useState([]);
  const [fleets, setFleets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editBoat, setEditBoat] = useState(null);
  const [form, setForm] = useState({ sail_number: "", boat_name: "", skipper: "", phrf_rating: "", fleet: "", boat_class: "", club: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [sortDir, setSortDir] = useState("asc");
  const [newFleetName, setNewFleetName] = useState("");
  const [editingFleet, setEditingFleet] = useState(null);
  const [editFleetName, setEditFleetName] = useState("");
  const [fleetError, setFleetError] = useState("");

  // Import state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importRows, setImportRows] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef();

  const loadAll = () => Promise.all([
    api.get(`/series/${seriesId}/boats`, user.token).then(setBoats),
    api.get(`/series/${seriesId}/fleets`, user.token).then(setFleets),
  ]).finally(() => setLoading(false));

  useEffect(() => { loadAll(); }, [seriesId]);

  const fleetNames = fleets.map(f => f.name);
  const fleetOptions = fleetNames.length > 0 ? fleetNames : ["NFS", "FS", "1-Design", "Distance"];

  const addFleet = async () => {
    const name = newFleetName.trim();
    if (!name) return;
    if (fleetNames.includes(name)) { setFleetError("Fleet already exists"); return; }
    setFleetError("");
    await api.post(`/series/${seriesId}/fleets`, { name }, user.token);
    setNewFleetName("");
    loadAll();
  };

  const startRenameFleet = (fleet) => {
    setEditingFleet(fleet);
    setEditFleetName(fleet.name);
    setFleetError("");
  };

  const saveRenameFleet = async () => {
    const name = editFleetName.trim();
    if (!name) return;
    await api.put(`/series/${seriesId}/fleets/${editingFleet.id}`, { name }, user.token);
    setEditingFleet(null);
    loadAll();
  };

  const deleteFleet = async (fleet) => {
    const boatsInFleet = boats.filter(b => b.fleet === fleet.name).length;
    const msg = boatsInFleet > 0
      ? `Delete "${fleet.name}" fleet? ${boatsInFleet} boat(s) will be moved to another fleet.`
      : `Delete "${fleet.name}" fleet?`;
    if (!confirm(msg)) return;
    await api.delete(`/series/${seriesId}/fleets/${fleet.id}`, user.token);
    loadAll();
  };

  const openNew = (defaultFleet = "") => {
    setEditBoat(null);
    setForm({ sail_number: "", boat_name: "", skipper: "", phrf_rating: "", fleet: defaultFleet || fleetOptions[0] || "", boat_class: "", club: "", email: "", phone: "" });
    setError("");
    setShowModal(true);
  };

  const openEdit = (b) => {
    setEditBoat(b);
    setForm({ sail_number: b.sail_number, boat_name: b.boat_name, skipper: b.skipper, phrf_rating: b.phrf_rating, fleet: b.fleet || fleetOptions[0] || "", boat_class: b.boat_class || "", club: b.club || "", email: b.email || "", phone: b.phone || "" });
    setError("");
    setShowModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = { ...form, phrf_rating: Number(form.phrf_rating) };
      if (editBoat) {
        await api.put(`/boats/${editBoat.id}`, body, user.token);
      } else {
        await api.post(`/series/${seriesId}/boats`, body, user.token);
      }
      setShowModal(false);
      loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteBoat = async (id) => {
    if (!confirm("Remove this boat from the series?")) return;
    await api.delete(`/boats/${id}`, user.token);
    loadAll();
  };

  const clearAllBoats = async () => {
    if (!confirm(`Delete all boats and registrations from ${seriesName}? This cannot be undone.`)) return;
    await Promise.all(boats.map(b => api.delete(`/boats/${b.id}`, user.token)));
    await api.delete(`/series/${seriesId}/registrations`, user.token);
    loadAll();
  };

  // ── XLSX Import ─────────────────────────────────────────────────────────────

  // Maps spreadsheet column names to our field names.
  // Handles common variations case-insensitively.
  const mapRow = (raw) => {
    const r = {};
    Object.keys(raw).forEach(k => { r[k.trim().toLowerCase()] = raw[k]; });
    return {
      boat_name:   String(r["boat"] ?? r["boat_name"] ?? r["boatname"] ?? "").trim(),
      sail_number: String(r["sailno"] ?? r["sail_number"] ?? r["sail no"] ?? r["sailnumber"] ?? "").trim(),
      skipper:     String(r["helmname"] ?? r["skipper"] ?? r["helm"] ?? r["skipper_name"] ?? "").trim(),
      phrf_rating: Number(r["rating"] ?? r["phrf"] ?? r["phrf_rating"] ?? 0),
      fleet:       String(r["fleet"] ?? "").trim(),
      club:        String(r["club"] ?? "").trim(),
      boat_class:  String(r["class"] ?? r["boat_class"] ?? r["boatclass"] ?? "").trim(),
    };
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        const rows = raw.map(mapRow);

        // Validate rows
        const errors = [];
        rows.forEach((row, i) => {
          if (!row.boat_name) errors.push(`Row ${i + 2}: Missing boat name`);
          if (!row.sail_number) errors.push(`Row ${i + 2}: Missing sail number`);
          if (!row.skipper) errors.push(`Row ${i + 2}: Missing skipper/helm name`);
          if (isNaN(row.phrf_rating)) errors.push(`Row ${i + 2}: Invalid PHRF rating`);
        });

        setImportRows(rows);
        setImportErrors(errors);
        setImportResult(null);
      } catch (err) {
        setImportErrors([`Could not read file: ${err.message}`]);
        setImportRows([]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const updateImportRow = (i, field, value) => {
    setImportRows(prev => {
      const updated = [...prev];
      updated[i] = { ...updated[i], [field]: value };
      return updated;
    });
  };

  const removeImportRow = (i) => {
    setImportRows(prev => prev.filter((_, idx) => idx !== i));
  };

  const runImport = async () => {
    if (importErrors.length > 0) return;
    setImporting(true);
    let added = 0, skipped = 0, failed = 0;
    const existingSailNums = new Set(boats.map(b => b.sail_number));

    for (const row of importRows) {
      try {
        if (existingSailNums.has(row.sail_number)) {
          skipped++;
          continue;
        }
        await api.post(`/series/${seriesId}/boats`, {
          ...row,
          phrf_rating: Number(row.phrf_rating),
        }, user.token);
        added++;
      } catch {
        failed++;
      }
    }

    setImportResult({ added, skipped, failed });
    setImporting(false);
    if (added > 0) loadAll();
  };

  const closeImport = () => {
    setShowImportModal(false);
    setImportRows([]);
    setImportErrors([]);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Print Entry List ────────────────────────────────────────────────────────

  const printEntryList = () => {
    const printWindow = window.open('', '_blank');
    const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const rows = [...boats]
      .sort((a, b) => {
        if ((a.fleet || "") < (b.fleet || "")) return -1;
        if ((a.fleet || "") > (b.fleet || "")) return 1;
        return a.phrf_rating - b.phrf_rating;
      })
      .map((b, i) => `
        <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
          <td>${i + 1}</td>
          <td><strong>${b.sail_number}</strong></td>
          <td>${b.boat_name}</td>
          <td>${b.skipper}</td>
          <td>${b.fleet || '—'}</td>
          <td>${b.phrf_rating}</td>
          <td>${b.boat_class || '—'}</td>
          <td>${b.club || '—'}</td>
        </tr>
      `).join('');
    printWindow.document.write(`<!DOCTYPE html><html><head><title>${seriesName} — Entry List</title>
      <style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: Arial, sans-serif; font-size: 12px; padding: 1.5cm; }
      .header { text-align: center; margin-bottom: 1.5rem; border-bottom: 2px solid #000; padding-bottom: 1rem; }
      .title { font-size: 22px; font-weight: 800; margin-bottom: 0.25rem; }
      .subtitle { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 0.25rem; }
      .meta { font-size: 11px; color: #666; }
      table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
      th { background: #000; color: #fff; padding: 6px 8px; text-align: left; font-size: 11px; text-transform: uppercase; }
      td { padding: 6px 8px; border-bottom: 1px solid #ddd; }
      tr.even td { background: #f9f9f9; }</style></head><body>
      <div class="header"><div class="title">${seriesName}</div><div class="subtitle">Official Entry List</div>
      <div class="meta">${boats.length} boat${boats.length !== 1 ? 's' : ''} registered · Printed ${today}</div></div>
      <table><thead><tr><th>#</th><th>Sail #</th><th>Boat Name</th><th>Skipper</th><th>Fleet</th><th>PHRF</th><th>Class</th><th>Club</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <script>window.onload = function() { window.print(); }<\/script></body></html>`);
    printWindow.document.close();
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const toggleSort = () => setSortDir(d => d === "asc" ? "desc" : "asc");

  const fleetGroups = boats.reduce((groups, boat) => {
    const fleet = boat.fleet || "—";
    if (!groups[fleet]) groups[fleet] = [];
    groups[fleet].push(boat);
    return groups;
  }, {});

  Object.keys(fleetGroups).forEach(fleet => {
    fleetGroups[fleet].sort((a, b) =>
      sortDir === "asc" ? a.phrf_rating - b.phrf_rating : b.phrf_rating - a.phrf_rating
    );
  });

  const orderedFleetNames = [
    ...fleetNames.filter(f => fleetGroups[f]),
    ...Object.keys(fleetGroups).filter(f => !fleetNames.includes(f))
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <button className="breadcrumb" onClick={() => navigate("dashboard")}>← My Series</button>
          <h1 className="page-title">{seriesName}</h1>
          <p className="page-subtitle">Fleet Management</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={printEntryList}>🖨 Print Entry List</button>
          <button className="btn-secondary" onClick={() => navigate("race", { seriesId, seriesName })}>Race Entry →</button>
          {boats.length > 0 && <button className="btn-ghost-sm danger" onClick={clearAllBoats}>🗑 Clear All Boats</button>}
          <button className="btn-secondary" onClick={() => setShowImportModal(true)}>📥 Import from Excel</button>
          <button className="btn-primary" onClick={() => openNew()}>+ Add Boat</button>
        </div>
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : (
        <>
          {/* Fleet Management Section */}
          <div className="fleet-mgmt-section">
            <h3 className="fleet-mgmt-title">Fleets</h3>
            <div className="fleet-mgmt-list">
              {fleets.length === 0 && <span className="fleet-mgmt-empty">No fleets yet — add one below</span>}
              {fleets.map(fleet => (
                <div key={fleet.id} className="fleet-mgmt-item">
                  {editingFleet?.id === fleet.id ? (
                    <>
                      <input
                        className="fleet-mgmt-input"
                        value={editFleetName}
                        onChange={e => setEditFleetName(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") saveRenameFleet(); if (e.key === "Escape") setEditingFleet(null); }}
                        autoFocus
                      />
                      <button className="btn-ghost-sm" onClick={saveRenameFleet}>Save</button>
                      <button className="btn-ghost-sm" onClick={() => setEditingFleet(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <span className="fleet-mgmt-name">{fleet.name}</span>
                      <span className="fleet-mgmt-count">{(fleetGroups[fleet.name] || []).length} boats</span>
                      <button className="btn-ghost-sm" onClick={() => startRenameFleet(fleet)}>Rename</button>
                      <button className="btn-ghost-sm danger" onClick={() => deleteFleet(fleet)}>Delete</button>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="fleet-mgmt-add">
              <input
                className="fleet-mgmt-input"
                placeholder="New fleet name..."
                value={newFleetName}
                onChange={e => { setNewFleetName(e.target.value); setFleetError(""); }}
                onKeyDown={e => { if (e.key === "Enter") addFleet(); }}
              />
              <button className="btn-primary btn-sm" onClick={addFleet}>+ Add Fleet</button>
              {fleetError && <span className="fleet-mgmt-error">{fleetError}</span>}
            </div>
          </div>

          {/* Boats */}
          {boats.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🚢</div>
              <h3>No boats registered</h3>
              <p>Add boats to this series before scoring races.</p>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem" }}>
                <button className="btn-secondary" onClick={() => setShowImportModal(true)}>📥 Import from Excel</button>
                <button className="btn-primary" onClick={() => openNew()}>Add First Boat</button>
              </div>
            </div>
          ) : (
            <>
              <div className="fleet-summary-bar">
                <div className="fleet-summary-chips">
                  <span className="meta-chip">⛵ {boats.length} boat{boats.length !== 1 ? "s" : ""} total</span>
                  {orderedFleetNames.map(f => (
                    <span key={f} className="meta-chip fleet-chip">{f}: {fleetGroups[f].length}</span>
                  ))}
                </div>
                <button className="btn-sort" onClick={toggleSort}>
                  PHRF {sortDir === "asc" ? "↑ Low → High" : "↓ High → Low"}
                </button>
              </div>

              {orderedFleetNames.map(fleetName => (
                <div key={fleetName} className="fleet-table-block">
                  <div className="fleet-table-header">
                    <div className="fleet-table-title">
                      <span className="fleet-table-name">{fleetName}</span>
                      <span className="fleet-table-count">{fleetGroups[fleetName].length} boat{fleetGroups[fleetName].length !== 1 ? "s" : ""}</span>
                    </div>
                    <button className="btn-primary btn-sm" onClick={() => openNew(fleetName)}>
                      + Add to {fleetName}
                    </button>
                  </div>
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Sail #</th>
                          <th>Boat Name</th>
                          <th>Skipper</th>
                          <th>Club</th>
                          <th className="num-col" style={{ cursor: "pointer" }} onClick={toggleSort}>
                            PHRF {sortDir === "asc" ? "↑" : "↓"}
                          </th>
                          <th className="num-col">ToT Factor</th>
                          <th>Class</th>
                          <th>Fleet</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {fleetGroups[fleetName].map((b, idx) => {
                          const factor = (650 / (650 + b.phrf_rating)).toFixed(4);
                          return (
                            <tr key={b.id} className={idx === 0 ? "top-rated" : ""}>
                              <td><span className="sail-num">{b.sail_number}</span></td>
                              <td className="boat-name-cell">{b.boat_name}</td>
                              <td>{b.skipper}</td>
                              <td>{b.club || "—"}</td>
                              <td className="num-col">
                                <span className={`rating-badge ${b.phrf_rating < 0 ? "fast" : b.phrf_rating > 150 ? "slow" : ""}`}>
                                  {b.phrf_rating}
                                </span>
                              </td>
                              <td className="num-col mono">{factor}</td>
                              <td>
                                <input
                                  className="fleet-inline-select"
                                  type="text"
                                  placeholder="e.g. J/24"
                                  defaultValue={b.boat_class || ""}
                                  onBlur={async (e) => {
                                    if (e.target.value !== (b.boat_class || "")) {
                                      await api.put(`/boats/${b.id}`, { ...b, boat_class: e.target.value }, user.token);
                                      loadAll();
                                    }
                                  }}
                                  style={{ width: "90px" }}
                                />
                              </td>
                              <td>
                                <select
                                  className="fleet-inline-select"
                                  value={b.fleet || ""}
                                  onChange={async (e) => {
                                    await api.put(`/boats/${b.id}`, { ...b, fleet: e.target.value }, user.token);
                                    loadAll();
                                  }}
                                >
                                  {fleetOptions.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                              </td>
                              <td className="actions-cell">
                                <button className="btn-ghost-sm" onClick={() => openEdit(b)}>Edit</button>
                                <button className="btn-ghost-sm danger" onClick={() => deleteBoat(b.id)}>Remove</button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </>
          )}
        </>
      )}

      {/* ── Add/Edit Boat Modal ── */}
      {showModal && (
        <Modal title={editBoat ? "Edit Boat" : "Add Boat"} onClose={() => setShowModal(false)}>
          <form onSubmit={save}>
            <div className="reg-section-title">Boat Information</div>
            <div className="field-row">
              <div className="field">
                <label>Boat Name *</label>
                <input type="text" placeholder="e.g. Windseeker" value={form.boat_name} onChange={set("boat_name")} required />
              </div>
              <div className="field">
                <label>Sail Number *</label>
                <input type="text" placeholder="e.g. USA-1234" value={form.sail_number} onChange={set("sail_number")} required />
              </div>
            </div>
            <div className="field">
              <label>Boat Class / Type</label>
              <input type="text" placeholder="e.g. J/24, Catalina 36" value={form.boat_class || ""} onChange={set("boat_class")} />
            </div>
            <div className="field-row">
              <div className="field">
                <label>Fleet *</label>
                <select value={form.fleet} onChange={set("fleet")}>
                  {fleetOptions.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="field">
                <label>PHRF Rating *</label>
                <input type="number" placeholder="e.g. 126" value={form.phrf_rating} onChange={set("phrf_rating")} required />
              </div>
            </div>
            {form.phrf_rating !== "" && !isNaN(Number(form.phrf_rating)) && (
              <div className="rating-preview">
                ToT factor: <strong>{(650 / (650 + Number(form.phrf_rating))).toFixed(4)}</strong>
                <span className="hint"> — corrected = elapsed × factor</span>
              </div>
            )}
            <div className="reg-section-title">Skipper Information</div>
            <div className="field">
              <label>Skipper Name *</label>
              <input type="text" placeholder="e.g. Jane Smith" value={form.skipper} onChange={set("skipper")} required />
            </div>
            <div className="field-row">
              <div className="field">
                <label>Email</label>
                <input type="email" placeholder="jane@example.com" value={form.email || ""} onChange={set("email")} />
              </div>
              <div className="field">
                <label>Phone</label>
                <input type="tel" placeholder="555-123-4567" value={form.phone || ""} onChange={set("phone")} />
              </div>
            </div>
            <div className="field">
              <label>Club</label>
              <input type="text" placeholder="e.g. Lakeshore Yacht Club" value={form.club || ""} onChange={set("club")} />
            </div>
            {error && <div className="form-error">{error}</div>}
            <div className="modal-footer">
              <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving..." : editBoat ? "Save Changes" : "Add Boat"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Import Modal ── */}
      {showImportModal && (
        <Modal title="Import Boats from Excel" onClose={closeImport}>
          <div style={{ minWidth: "min(800px, 90vw)" }}>

            {/* Step 1: File picker */}
            {importRows.length === 0 && !importResult && (
              <div>
                <p style={{ marginBottom: "1rem", color: "#4a5568", fontSize: "0.9rem" }}>
                  Select an <strong>.xlsx</strong> file. Expected columns:
                  <span style={{ fontFamily: "monospace", background: "#f7fafc", padding: "2px 6px", borderRadius: "4px", marginLeft: "6px" }}>
                    Boat, SailNo, HelmName, Rating, Fleet, Club, Class
                  </span>
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  style={{ display: "block", marginBottom: "1rem" }}
                />
                {importErrors.length > 0 && (
                  <div className="form-error">
                    {importErrors.map((e, i) => <div key={i}>{e}</div>)}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Preview & edit */}
            {importRows.length > 0 && !importResult && (
              <div>
                <p style={{ marginBottom: "0.75rem", color: "#4a5568", fontSize: "0.9rem" }}>
                  <strong>{importRows.length}</strong> boats found. Review and edit before importing.
                  Boats with a sail number already in this series will be skipped.
                </p>
                {importErrors.length > 0 && (
                  <div className="form-error" style={{ marginBottom: "0.75rem" }}>
                    {importErrors.map((e, i) => <div key={i}>{e}</div>)}
                  </div>
                )}
                <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                    <thead>
                      <tr style={{ background: "#1a365d", color: "white", position: "sticky", top: 0 }}>
                        <th style={{ padding: "8px", textAlign: "left" }}>Sail #</th>
                        <th style={{ padding: "8px", textAlign: "left" }}>Boat Name</th>
                        <th style={{ padding: "8px", textAlign: "left" }}>Skipper</th>
                        <th style={{ padding: "8px", textAlign: "left" }}>Fleet</th>
                        <th style={{ padding: "8px", textAlign: "right" }}>PHRF</th>
                        <th style={{ padding: "8px", textAlign: "left" }}>Club</th>
                        <th style={{ padding: "8px", textAlign: "left" }}>Class</th>
                        <th style={{ padding: "8px" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {importRows.map((row, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? "#f7fafc" : "white", borderBottom: "1px solid #e2e8f0" }}>
                          {["sail_number", "boat_name", "skipper", "fleet"].map(field => (
                            <td key={field} style={{ padding: "4px 6px" }}>
                              <input
                                style={{ width: "100%", border: "1px solid #cbd5e0", borderRadius: "4px", padding: "3px 5px", fontSize: "0.82rem" }}
                                value={row[field]}
                                onChange={e => updateImportRow(i, field, e.target.value)}
                              />
                            </td>
                          ))}
                          <td style={{ padding: "4px 6px" }}>
                            <input
                              style={{ width: "60px", border: "1px solid #cbd5e0", borderRadius: "4px", padding: "3px 5px", fontSize: "0.82rem", textAlign: "right" }}
                              type="number"
                              value={row.phrf_rating}
                              onChange={e => updateImportRow(i, "phrf_rating", e.target.value)}
                            />
                          </td>
                          {["club", "boat_class"].map(field => (
                            <td key={field} style={{ padding: "4px 6px" }}>
                              <input
                                style={{ width: "100%", border: "1px solid #cbd5e0", borderRadius: "4px", padding: "3px 5px", fontSize: "0.82rem" }}
                                value={row[field]}
                                onChange={e => updateImportRow(i, field, e.target.value)}
                              />
                            </td>
                          ))}
                          <td style={{ padding: "4px 6px", textAlign: "center" }}>
                            <button
                              onClick={() => removeImportRow(i)}
                              style={{ color: "#e53e3e", background: "none", border: "none", cursor: "pointer", fontSize: "1rem" }}
                              title="Remove this row"
                            >✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="modal-footer" style={{ marginTop: "1rem" }}>
                  <button className="btn-ghost" onClick={closeImport}>Cancel</button>
                  <button
                    className="btn-primary"
                    onClick={runImport}
                    disabled={importing || importErrors.length > 0}
                  >
                    {importing ? "Importing..." : `Import ${importRows.length} Boats`}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Result */}
            {importResult && (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                  {importResult.failed === 0 ? "✅" : "⚠️"}
                </div>
                <h3 style={{ marginBottom: "1rem" }}>Import Complete</h3>
                <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", marginBottom: "1.5rem" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "2rem", fontWeight: 700, color: "#38a169" }}>{importResult.added}</div>
                    <div style={{ fontSize: "0.85rem", color: "#718096" }}>Added</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "2rem", fontWeight: 700, color: "#d69e2e" }}>{importResult.skipped}</div>
                    <div style={{ fontSize: "0.85rem", color: "#718096" }}>Skipped (already exist)</div>
                  </div>
                  {importResult.failed > 0 && (
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "2rem", fontWeight: 700, color: "#e53e3e" }}>{importResult.failed}</div>
                      <div style={{ fontSize: "0.85rem", color: "#718096" }}>Failed</div>
                    </div>
                  )}
                </div>
                <button className="btn-primary" onClick={closeImport}>Done</button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
