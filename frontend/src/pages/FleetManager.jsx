import { useState, useEffect } from "react";
import { useAuth } from "../App";
import { api } from "../api";
import Modal from "../components/Modal";

export default function FleetManager({ seriesId, seriesName }) {
  const { user, navigate } = useAuth();
  const [boats, setBoats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editBoat, setEditBoat] = useState(null);
  const [form, setForm] = useState({ sail_number: "", boat_name: "", skipper: "", phrf_rating: "", fleet: "NFS" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () =>
    api.get(`/series/${seriesId}/boats`, user.token).then(setBoats).finally(() => setLoading(false));

  useEffect(() => { load(); }, [seriesId]);

  const openNew = () => {
    setEditBoat(null);
    setForm({ sail_number: "", boat_name: "", skipper: "", phrf_rating: "", fleet: "NFS" });
    setError("");
    setShowModal(true);
  };

  const openEdit = (b) => {
    setEditBoat(b);
    setForm({ sail_number: b.sail_number, boat_name: b.boat_name, skipper: b.skipper, phrf_rating: b.phrf_rating, fleet: b.fleet || "NFS" });
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

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <button className="breadcrumb" onClick={() => navigate("dashboard")}>← My Series</button>
          <h1 className="page-title">{seriesName}</h1>
          <p className="page-subtitle">Fleet Management</p>
        </div>
        <div className="header-actions">
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
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sail #</th>
                <th>Boat Name</th>
                <th>Skipper</th>
                <th className="num-col">Fleet</th>
                <th className="num-col">PHRF Rating</th>
                <th className="num-col">ToT Factor</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {boats.sort((a, b) => a.phrf_rating - b.phrf_rating).map(b => {
                const factor = (650 / (650 + b.phrf_rating)).toFixed(4);
                return (
                  <tr key={b.id}>
                    <td><span className="sail-num">{b.sail_number}</span></td>
                    <td className="boat-name-cell">{b.boat_name}</td>
                    <td>{b.skipper}</td>
                    <td className="num-col">{b.fleet || "NFS"}</td>
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
          <div className="table-footer">
            {boats.length} boat{boats.length !== 1 ? "s" : ""} registered
          </div>
        </div>
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
              <label>Fleet</label>
              <select value={form.fleet} onChange={set("fleet")}>
                <option value="1-Design">1-Design</option>
                <option value="FS">FS (Flying Sail)</option>
                <option value="NFS">NFS (Non-Flying Sail)</option>
                <option value="Distance">Distance</option>
                <option value="NFS2">NFS2</option>
                <option value="FS2">FS2</option>
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