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
  const [form, setForm] = useState({ name: "", season: "", throwouts: 0, num_races: 10, race_type: "around_the_cans", start_type: "fleet", fleet_sails: "non_flying" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [backing_up, setBackingUp] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloneSource, setCloneSource] = useState(null);
  const [cloneForm, setCloneForm] = useState({ name: "", season: "" });
  const [cloning, setCloning] = useState(false);
  const [cloneError, setCloneError] = useState("");

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
    setForm({ name: "", season: new Date().getFullYear().toString(), throwouts: 0, num_races: 10, race_type: "around_the_cans", start_type: "fleet", fleet_sails: "non_flying" });
    setError("");
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditSeries(s);
    setForm({ name: s.name, season: s.season || "", throwouts: s.throwouts, num_races: 0, race_type: s.race_type || "around_the_cans", start_type: s.start_type || "fleet", fleet_sails: s.fleet_sails || "non_flying" });
    setError("");
    setShowModal(true);
  };

  const openClone = (s) => {
    setCloneSource(s);
    setCloneForm({
      name: `${s.name} ${Number(s.season || new Date().getFullYear()) + 1}`,
      season: String(Number(s.season || new Date().getFullYear()) + 1),
    });
    setCloneError("");
    setShowCloneModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = {
        ...form,
        throwouts: Number(form.throwouts),
        // Only include distance-race sub-fields when relevant
        start_type: form.race_type === "distance" ? form.start_type : null,
        fleet_sails: form.race_type === "distance" ? form.fleet_sails : null,
      };
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

  const cloneSeries = async (e) => {
    e.preventDefault();
    setCloning(true);
    setCloneError("");
    try {
      await api.post(`/series/${cloneSource.id}/clone`, {
        name: cloneForm.name,
        season: cloneForm.season,
      }, user.token);
      setShowCloneModal(false);
      load();
    } catch (err) {
      setCloneError(err.message);
    } finally {
      setCloning(false);
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
              <div style={{ fontSize: "0.78rem", color: "#718096", marginTop: "0.25rem", display: "flex", gap: "0.5rem", flexWrap: "wrap", minHeight: "1rem" }}>
                {s.race_type === "distance" ? (
                  <>
                    <span style={{ background: "#ebf4ff", color: "#2b6cb0", borderRadius: "4px", padding: "2px 8px", fontWeight: 600 }}>Distance Race</span>
                    {s.start_type && (
                      <span style={{ background: "#f0fff4", color: "#276749", borderRadius: "4px", padding: "2px 8px", fontWeight: 600 }}>
                        {s.start_type === "pursuit" ? "Pursuit Start" : "Fleet Start"}
                      </span>
                    )}
                    {s.fleet_sails && (
                      <span style={{ background: "#fff5f5", color: "#9b2c2c", borderRadius: "4px", padding: "2px 8px", fontWeight: 600 }}>
                        {s.fleet_sails === "flying" ? "Flying Sails" : "Non-Flying Sails"}
                      </span>
                    )}
                  </>
                ) : s.race_type === "around_the_cans" ? (
                  <span style={{ background: "#ebf4ff", color: "#2b6cb0", borderRadius: "4px", padding: "2px 8px", fontWeight: 600 }}>Around the Cans</span>
                ) : null}
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
                <button className="btn-ghost-sm" onClick={() => openClone(s)}>📋 Clone</button>
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
              <input type="text" placeholder="e.g. Wednesday Night Racing" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="field">
              <label>Season</label>
              <input type="text" placeholder="e.g. 2025" value={form.season}
                onChange={e => setForm({ ...form, season: e.target.value })} />
            </div>
            <div className="field">
              <label>Race Type</label>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
                {[
                  { value: "around_the_cans", label: "🔁 Around the Cans" },
                  { value: "distance", label: "🧭 Distance Race" },
                ].map(opt => (
                  <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.9rem", fontWeight: form.race_type === opt.value ? 600 : 400 }}>
                    <input
                      type="radio"
                      name="race_type"
                      value={opt.value}
                      checked={form.race_type === opt.value}
                      onChange={e => setForm({ ...form, race_type: e.target.value })}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {form.race_type === "distance" && (
              <div style={{ background: "#f7fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "0.85rem 1rem", display: "flex", flexDirection: "column", gap: "0.85rem", marginBottom: "0.25rem" }}>
                <div className="field" style={{ margin: 0 }}>
                  <label>Start Type</label>
                  <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
                    {[
                      { value: "pursuit", label: "🏃 Pursuit" },
                      { value: "fleet", label: "🚩 Fleet Start" },
                    ].map(opt => (
                      <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.9rem", fontWeight: form.start_type === opt.value ? 600 : 400 }}>
                        <input
                          type="radio"
                          name="start_type"
                          value={opt.value}
                          checked={form.start_type === opt.value}
                          onChange={e => setForm({ ...form, start_type: e.target.value })}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="field" style={{ margin: 0 }}>
                  <label>Fleet Sails</label>
                  <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
                    {[
                      { value: "flying", label: "🪁 Flying Sails" },
                      { value: "non_flying", label: "⛵ Non-Flying Sails" },
                    ].map(opt => (
                      <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.9rem", fontWeight: form.fleet_sails === opt.value ? 600 : 400 }}>
                        <input
                          type="radio"
                          name="fleet_sails"
                          value={opt.value}
                          checked={form.fleet_sails === opt.value}
                          onChange={e => setForm({ ...form, fleet_sails: e.target.value })}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="field">
              <label>Throwouts (worst races to drop)</label>
              <input type="number" min="0" max="10" value={form.throwouts}
                onChange={e => setForm({ ...form, throwouts: e.target.value })} />
              <span className="field-hint">0 = no throwouts. US Sailing typically allows 1 throwout per 5 races.</span>
            </div>
            {!editSeries && (
              <div className="field">
                <label>Number of Races</label>
                <input type="number" min="1" max="50" value={form.num_races}
                  onChange={e => setForm({ ...form, num_races: e.target.value })} required />
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

      {showCloneModal && cloneSource && (
        <Modal title="Clone Series" onClose={() => setShowCloneModal(false)}>
          <p style={{ fontSize: "0.875rem", color: "#718096", marginBottom: "1.25rem", lineHeight: 1.6 }}>
            Copying <strong>{cloneSource.name}</strong> — all fleets, boats, and race structure will be copied into a new series without results.
          </p>
          <form onSubmit={cloneSeries}>
            <div className="field">
              <label>New Series Name</label>
              <input type="text" value={cloneForm.name}
                onChange={e => setCloneForm({ ...cloneForm, name: e.target.value })} required />
            </div>
            <div className="field">
              <label>Season</label>
              <input type="text" placeholder="e.g. 2027" value={cloneForm.season}
                onChange={e => setCloneForm({ ...cloneForm, season: e.target.value })} />
            </div>
            <div style={{ background: "#f0f4f8", borderRadius: "8px", padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#4a5568", marginBottom: "1rem", lineHeight: 1.6 }}>
              <strong>Copied:</strong> fleets, boats (with PHRF ratings and clubs), race structure<br />
              <strong>Not copied:</strong> race dates, start times, finish times, results
            </div>
            {cloneError && <div className="form-error">{cloneError}</div>}
            <div className="modal-footer">
              <button type="button" className="btn-ghost" onClick={() => setShowCloneModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={cloning}>
                {cloning ? "Cloning..." : "📋 Clone Series"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
