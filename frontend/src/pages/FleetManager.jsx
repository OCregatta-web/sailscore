import { useState, useEffect } from "react";
import { useAuth } from "../App";
import { api } from "../api";
import Modal from "../components/Modal";

const FLEET_OPTIONS = ["1-Design", "FS", "NFS", "Distance", "Cruising", "Multihull"];

export default function FleetManager({ seriesId, seriesName }) {
  const { user, navigate } = useAuth();
  const [boats, setBoats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editBoat, setEditBoat] = useState(null);
  const [form, setForm] = useState({ sail_number: "", boat_name: "", skipper: "", phrf_rating: "", fleet: "NFS", boat_class: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [sortDir, setSortDir] = useState("asc"); // per fleet sort direction

  const load = () =>
    api.get(`/series/${seriesId}/boats`, user.token).then(setBoats).finally(() => setLoading(false));

  useEffect(() => { load(); }, [seriesId]);

  const openNew = () => {
    setEditBoat(null);
    setForm({ sail_number: "", boat_name: "", skipper: "", phrf_rating: "", fleet: "NFS", boat_class: "" });
    setError("");
    setShowModal(true);
  };

  const openEdit = (b) => {
    setEditBoat(b);
    setForm({ sail_number: b.sail_number, boat_name: b.boat_name, skipper: b.skipper, phrf_rating: b.phrf_rating, fleet: b.fleet || "NFS", boat_class: b.boat_class || "" });
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
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteBoat = async (id) => {
    if (!confirm("Remove this boat from the series?")) return;
    await api.delete(`/boats/${id}`, user.token);
    load();
  };

  const printEntryList = () => {
    const printWindow = window.open('', '_blank');
    const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const rows = [...boats]
      .sort((a, b) => {
        if ((a.fleet || "NFS") < (b.fleet || "NFS")) return -1;
        if ((a.fleet || "NFS") > (b.fleet || "NFS")) return 1;
        return a.phrf_rating - b.phrf_rating;
      })
      .map((b, i) => `
        <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
          <td>${i + 1}</td>
          <td><strong>${b.sail_number}</strong></td>
          <td>${b.boat_name}</td>
          <td>${b.skipper}</td>
          <td>${b.fleet || 'NFS'}</td>
          <td>${b.phrf_rating}</td>
          <td>${b.boat_class || '—'}</td>
          <td>${b.club || '—'}</td>
        </tr>
      `).join('');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${seriesName} — Entry List</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; font-size: 12px; padding: 1.5cm; }
          .header { text-align: center; margin-bottom: 1.5rem; border-bottom: 2px solid #000; padding-bottom: 1rem; }
          .title { font-size: 22px; font-weight: 800; margin-bottom: 0.25rem; }
          .subtitle { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 0.25rem; }
          .meta { font-size: 11px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
          th { background: #000; color: #fff; padding: 6px 8px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
          td { padding: 6px 8px; border-bottom: 1px solid #ddd; }
          tr.even td { background: #f9f9f9; }
          .footer { margin-top: 1rem; font-size: 10px; color: #999; display: flex; justify-content: space-between; border-top: 1px solid #ddd; padding-top: 0.5rem; }
          @media print { body { padding: 1cm; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${seriesName}</div>
          <div class="subtitle">Official Entry List</div>
          <div class="meta">${boats.length} boat${boats.length !== 1 ? 's' : ''} registered · Printed ${today}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th><th>Sail #</th><th>Boat Name</th><th>Skipper</th>
              <th>Fleet</th><th>PHRF</th><th>Class</th><th>Club</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="footer">
          <span>PHRF Time-on-Time · Corrected Time = Elapsed × (650 / (650 + Rating))</span>
          <span>${boats.length} entries</span>
        </div>
        <script>window.onload = function() { window.print(); }<\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const toggleSort = () => setSortDir(d => d === "asc" ? "desc" : "asc");

  // Group boats by fleet, preserving fleet order
  const fleetGroups = boats.reduce((groups, boat) => {
    const fleet = boat.fleet || "NFS";
    if (!groups[fleet]) groups[fleet] = [];
    groups[fleet].push(boat);
    return groups;
  }, {});

  // Sort each fleet by PHRF rating
  Object.keys(fleetGroups).forEach(fleet => {
    fleetGroups[fleet].sort((a, b) =>
      sortDir === "asc"
        ? a.phrf_rating - b.phrf_rating
        : b.phrf_rating - a.phrf_rating
    );
  });

  const totalBoats = boats.length;
  const fleetNames = Object.keys(fleetGroups);

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
          <button className="btn-primary" onClick={openNew}>+ Add Boat</button>
        </div>
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : boats.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🚢</div>
          <h3>No boats registered</h3>
          <p>Add boats to this series before scoring races.</p>
          <button className="btn-primary" onClick={openNew}>Add First Boat</button>
        </div>
      ) : (
        <>
          {/* Summary bar */}
          <div className="fleet-summary-bar">
            <div className="fleet-summary-chips">
              <span className="meta-chip">⛵ {totalBoats} boat{totalBoats !== 1 ? "s" : ""} total</span>
              {fleetNames.map(f => (
                <span key={f} className="meta-chip fleet-chip">
                  {f}: {fleetGroups[f].length}
                </span>
              ))}
            </div>
            <button className="btn-sort" onClick={toggleSort}>
              PHRF {sortDir === "asc" ? "↑ Low → High" : "↓ High → Low"}
            </button>
          </div>

          {/* One table per fleet */}
          {fleetNames.map(fleetName => (
            <div key={fleetName} className="fleet-table-block">
              <div className="fleet-table-header">
                <div className="fleet-table-title">
                  <span className="fleet-table-name">{fleetName}</span>
                  <span className="fleet-table-count">{fleetGroups[fleetName].length} boat{fleetGroups[fleetName].length !== 1 ? "s" : ""}</span>
                </div>
                <button className="btn-primary btn-sm" onClick={() => {
                  setForm({ sail_number: "", boat_name: "", skipper: "", phrf_rating: "", fleet: fleetName, boat_class: "" });
                  setEditBoat(null);
                  setError("");
                  setShowModal(true);
                }}>
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
                      <th className="num-col" style={{ cursor: "pointer" }} onClick={toggleSort}>
                        PHRF Rating {sortDir === "asc" ? "↑" : "↓"}
                      </th>
                      <th className="num-col">ToT Factor</th>
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
                          <td className="num-col">
                            <span className={`rating-badge ${b.phrf_rating < 0 ? "fast" : b.phrf_rating > 150 ? "slow" : ""}`}>
                              {b.phrf_rating}
                            </span>
                          </td>
                          <td className="num-col mono">{factor}</td>
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

      {showModal && (
        <Modal title={editBoat ? "Edit Boat" : "Add Boat"} onClose={() => setShowModal(false)}>
          <form onSubmit={save}>
            <div className="field-row">
              <div className="field">
                <label>Sail Number</label>
                <input type="text" placeholder="e.g. USA-1234" value={form.sail_number} onChange={set("sail_number")} required />
              </div>
              <div className="field">
                <label>PHRF Rating</label>
                <input type="number" placeholder="e.g. 126" value={form.phrf_rating} onChange={set("phrf_rating")} required />
              </div>
            </div>
            <div className="field">
              <label>Boat Name</label>
              <input type="text" placeholder="e.g. Windseeker" value={form.boat_name} onChange={set("boat_name")} required />
            </div>
            <div className="field">
              <label>Skipper</label>
              <input type="text" placeholder="e.g. Jane Smith" value={form.skipper} onChange={set("skipper")} required />
            </div>
            <div className="field">
              <label>Boat Class</label>
              <input type="text" placeholder="e.g. J/24, Catalina 36" value={form.boat_class || ""} onChange={set("boat_class")} />
            </div>
            <div className="field">
              <label>Fleet</label>
              <select value={form.fleet} onChange={set("fleet")}>
                {FLEET_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            {form.phrf_rating !== "" && (
              <div className="rating-preview">
                ToT factor: <strong>{(650 / (650 + Number(form.phrf_rating))).toFixed(4)}</strong>
                <span className="hint"> — corrected = elapsed × factor</span>
              </div>
            )}
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
    </div>
  );
}