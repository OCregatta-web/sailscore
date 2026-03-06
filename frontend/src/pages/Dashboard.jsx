import { useState, useEffect } from "react";
import { useAuth } from "../App";
import { api } from "../api";
import Modal from "../components/Modal";

export default function Dashboard() {
  const { user, navigate } = useAuth();
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSeries, setEditSeries] = useState(null);
  const [form, setForm] = useState({ name: "", season: "", throwouts: 0, num_races: 10 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [backing_up, setBackingUp] = useState(false);

  const downloadBackup = async () => {
    setBackingUp(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/backup`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      a.href = url;
      a.download = `sailscore_backup_${timestamp}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Backup failed: " + err.message);
    } finally {
      setBackingUp(false);
    }
  };

  const load = () =>
    api.get("/series", user.token).then(setSeries).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditSeries(null);
    setForm({ name: "", season: new Date().getFullYear().toString(), throwouts: 0, num_races: 10 });
    setError("");
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditSeries(s);
    setForm({ name: s.name, season: s.season || "", throwouts: s.throwouts, num_races: 0 });
    setError("");
    setShowModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = { ...form, throwouts: Number(form.throwouts) };
      if (editSeries) {
        await api.put(`/series/${editSeries.id}`, body, user.token);
      } else {
        await api.post(`/series?num_races=${Number(form.num_races)}`, body, user.token);
      }
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteSeries = async (id) => {
    if (!confirm("Delete this series and all its races? This cannot be undone.")) return;
    await api.delete(`/series/${id}`, user.token);
    load();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Series</h1>
          <p className="page-subtitle">Manage your racing series and fleets</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn-ghost" onClick={downloadBackup} disabled={backing_up}>
            {backing_up ? "Backing up..." : "⬇️ Backup"}
          </button>
          <button className="btn-primary" onClick={openNew}>+ New Series</button>
        </div>
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : series.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⛵</div>
          <h3>No series yet</h3>
          <p>Create your first racing series to get started.</p>
          <button className="btn-primary" onClick={openNew}>Create Series</button>
        </div>
      ) : (
        <div className="card-grid">
          {series.map(s => (
            <div className="series-card" key={s.id}>
              <div className="series-card-header">
                <div>
                  <h3 className="series-name">{s.name}</h3>
                  <span className="series-season">{s.season || "—"}</span>
                </div>
                <div className="series-badge">
                  {s.throwouts > 0 ? `${s.throwouts} throwout${s.throwouts > 1 ? "s" : ""}` : "No throwouts"}
                </div>
              </div>
              <div className="series-actions">
                <button className="btn-action" onClick={() => navigate("registrations", { seriesId: s.id, seriesName: s.name })}>
                  📋 Registrations
                </button>
                <button className="btn-action" onClick={() => navigate("fleet", { seriesId: s.id, seriesName: s.name })}>
                  🚢 Fleet
                </button>
                <button className="btn-action" onClick={() => navigate("race", { seriesId: s.id, seriesName: s.name })}>
                  🏁 Race Entry
                </button>
                <button className="btn-action" onClick={() => navigate("standings", { seriesId: s.id, seriesName: s.name })}>
                  📊 Standings
                </button>
              </div>
              <div className="series-footer">
                <button className="btn-ghost-sm" onClick={() => openEdit(s)}>Edit</button>
                <button className="btn-ghost-sm danger" onClick={() => deleteSeries(s.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editSeries ? "Edit Series" : "New Series"} onClose={() => setShowModal(false)}>
          <form onSubmit={save}>
            <div className="field">
              <label>Series Name</label>
              <input
                type="text"
                placeholder="e.g. Wednesday Night Racing"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>Season</label>
              <input
                type="text"
                placeholder="e.g. 2025"
                value={form.season}
                onChange={e => setForm({ ...form, season: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Throwouts (worst races to drop)</label>
              <input
                type="number"
                min="0"
                max="10"
                value={form.throwouts}
                onChange={e => setForm({ ...form, throwouts: e.target.value })}
              />
              <span className="field-hint">0 = no throwouts. US Sailing typically allows 1 throwout per 5 races.</span>
            </div>
            {!editSeries && (
              <div className="field">
                <label>Number of Races</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={form.num_races}
                  onChange={e => setForm({ ...form, num_races: e.target.value })}
                  required
                />
                <span className="field-hint">Empty races will be created automatically.</span>
              </div>
            )}
            {error && <div className="form-error">{error}</div>}
            <div className="modal-footer">
              <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save Series"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
