import { useState, useEffect } from "react";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Register() {
  const seriesId = new URLSearchParams(window.location.search).get("series");
  const [seriesInfo, setSeriesInfo] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [fleetOptions, setFleetOptions] = useState([]);
  const [form, setForm] = useState({
    boat_name: "", sail_number: "", skipper: "",
    phrf_rating: "", fleet: "", club: "",
    email: "", phone: "", boat_class: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [registrations, setRegistrations] = useState([]);

  const fetchRegistrations = () =>
    fetch(`${BASE}/register/${seriesId}/registrations`)
      .then(r => r.ok ? r.json() : [])
      .then(setRegistrations)
      .catch(() => {});

  useEffect(() => {
    if (!seriesId) { setNotFound(true); return; }
    fetch(`${BASE}/register/${seriesId}/info`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setSeriesInfo)
      .catch(() => setNotFound(true));
    fetch(`${BASE}/public/series/${seriesId}/fleets`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const names = data.map(f => f.name);
        const options = names.length > 0 ? names : ["NFS", "FS", "1-Design", "Distance"];
        setFleetOptions(options);
        if (options.length > 0) setForm(f => ({ ...f, fleet: options[0] }));
      })
      .catch(() => {
        const defaults = ["NFS", "FS", "1-Design", "Distance"];
        setFleetOptions(defaults);
        setForm(f => ({ ...f, fleet: defaults[0] }));
      });
  }, [seriesId]);

  const [showingRegistrations, setShowingRegistrations] = useState(
    new URLSearchParams(window.location.search).get("view") === "list"
  );

  const toggleRegistrations = () => {
    if (!showingRegistrations) fetchRegistrations();
    setShowingRegistrations(r => !r);
  };

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("view") === "list") {
      fetchRegistrations();
    }
  }, [seriesId]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${BASE}/register/${seriesId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, phrf_rating: Number(form.phrf_rating) }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Registration failed");
      }
      setSubmitted(true);
      fetchRegistrations();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (notFound) return (
    <div className="reg-page">
      <div className="reg-card">
        <div className="reg-header">
          <div className="reg-logo">⛵</div>
          <h1 className="reg-title">SailScore</h1>
        </div>
        <div className="reg-not-found">
          <p>Series not found. Please check your registration link.</p>
        </div>
      </div>
    </div>
  );

  if (!seriesInfo) return (
    <div className="reg-page">
      <div className="spinner-wrap"><div className="spinner" /></div>
    </div>
  );

  if (submitted) return (
    <div className="reg-page">
      <div className="reg-card">
        <div className="reg-header">
          <div className="reg-logo">🎉</div>
          <h1 className="reg-title">You're Registered!</h1>
          <p className="reg-subtitle">{seriesInfo.series_name} {seriesInfo.season}</p>
        </div>
        <div className="reg-success">
          <p>Your boat has been added to the fleet. See you on the water!</p>
          <div className="reg-summary">
            <div className="reg-summary-row"><span>Boat</span><strong>{form.boat_name}</strong></div>
            <div className="reg-summary-row"><span>Sail #</span><strong>{form.sail_number}</strong></div>
            <div className="reg-summary-row"><span>Skipper</span><strong>{form.skipper}</strong></div>
            <div className="reg-summary-row"><span>Fleet</span><strong>{form.fleet}</strong></div>
            <div className="reg-summary-row"><span>PHRF</span><strong>{form.phrf_rating}</strong></div>
          </div>
          <a href="/regatta" style={{ display: "block", textAlign: "center", marginTop: "1.5rem", padding: "0.85rem", borderRadius: "8px", border: "1px solid #cbd5e0", color: "#4a5568", textDecoration: "none", fontWeight: 600, fontSize: "0.95rem" }}>
            ← Back to Regatta
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="reg-page">
      <div className="reg-card">
        <div className="reg-header">
          <div className="reg-logo">⛵</div>
          <h1 className="reg-title">{seriesInfo.series_name}</h1>
          <p className="reg-subtitle">
            {seriesInfo.season && `${seriesInfo.season} · `}Boat Registration
          </p>
        </div>

        <form onSubmit={submit} className="reg-form">
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
            <input type="text" placeholder="e.g. J/24, Catalina 36" value={form.boat_class} onChange={set("boat_class")} />
          </div>

          <div className="field-row">
            <div className="field">
              <label>Fleet *</label>
              <select value={form.fleet} onChange={set("fleet")} required>
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
              ToT factor: <strong>{(566.431 / (401.431 + Number(form.phrf_rating))).toFixed(4)}</strong>
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
              <input type="email" placeholder="jane@example.com" value={form.email} onChange={set("email")} />
            </div>
            <div className="field">
              <label>Phone</label>
              <input type="tel" placeholder="555-123-4567" value={form.phone} onChange={set("phone")} />
            </div>
          </div>

          <div className="field">
            <label>Club *</label>
            <input type="text" placeholder="e.g. Lakeshore Yacht Club" value={form.club} onChange={set("club")} required />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn-primary btn-full" disabled={saving}>
            {saving ? "Registering..." : "Register My Boat"}
          </button>

          <a href="/regatta" style={{ display: "block", textAlign: "center", marginTop: "0.75rem", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e0", color: "#4a5568", textDecoration: "none", fontWeight: 600, fontSize: "0.95rem" }}>
            ← Back to Regatta
          </a>
        </form>
      </div>
    </div>
  );
}