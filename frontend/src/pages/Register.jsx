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
        setFleetOptions(names);
        if (names.length > 0) setForm(f => ({ ...f, fleet: names[0] }));
      })
      .catch(() => {});
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
          {registrations.length > 0 && (
            <div style={{ marginTop: "1.5rem" }}>
              <h3 style={{ fontWeight: 700, marginBottom: "0.75rem" }}>Registered Fleet ({registrations.length})</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
                      <th style={{ padding: "6px 8px" }}>Boat</th>
                      <th style={{ padding: "6px 8px" }}>Class</th>
                      <th style={{ padding: "6px 8px" }}>Skipper</th>
                      <th style={{ padding: "6px 8px" }}>Fleet</th>
                      <th style={{ padding: "6px 8px" }}>PHRF</th>
                      <th style={{ padding: "6px 8px" }}>Club</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((r, i) => (
                      <tr key={r.id} style={{ borderBottom: "1px solid #eee", background: i % 2 === 0 ? "#fafafa" : "#fff" }}>
                        <td style={{ padding: "6px 8px" }}><strong>{r.boat_name}</strong></td>
                        <td style={{ padding: "6px 8px" }}>{r.boat_class || "—"}</td>
                        <td style={{ padding: "6px 8px" }}>{r.skipper}</td>
                        <td style={{ padding: "6px 8px" }}>{r.fleet}</td>
                        <td style={{ padding: "6px 8px" }}>{r.phrf_rating}</td>
                        <td style={{ padding: "6px 8px" }}>{r.club || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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
              <input type="email" placeholder="jane@example.com" value={form.email} onChange={set("email")} />
            </div>
            <div className="field">
              <label>Phone</label>
              <input type="tel" placeholder="555-123-4567" value={form.phone} onChange={set("phone")} />
            </div>
          </div>

          <div className="field">
            <label>Club</label>
            <input type="text" placeholder="e.g. Lakeshore Yacht Club" value={form.club} onChange={set("club")} />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn-primary btn-full" disabled={saving}>
            {saving ? "Registering..." : "Register My Boat"}
          </button>

          <button type="button" style={{ marginTop: "0.75rem", width: "100%", padding: "0.75rem", borderRadius: "8px", border: "2px solid #2b6cb0", background: "white", color: "#2b6cb0", fontWeight: 700, fontSize: "1rem", cursor: "pointer", fontFamily: "inherit" }} onClick={toggleRegistrations}>
            {showingRegistrations ? "▲ Hide Registered Boats" : "👀 View Registered Boats"}
          </button>

          {showingRegistrations && (
            <div style={{ marginTop: "1.25rem" }}>
              <h3 style={{ fontWeight: 700, marginBottom: "0.75rem", fontSize: "0.95rem" }}>
                Registered Boats {registrations.length > 0 ? `(${registrations.length})` : ""}
              </h3>
              {registrations.length === 0 ? (
                <p style={{ color: "#888", fontSize: "0.875rem" }}>No boats registered yet — be the first!</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
                        <th style={{ padding: "6px 8px" }}>Boat</th>
                        <th style={{ padding: "6px 8px" }}>Skipper</th>
                        <th style={{ padding: "6px 8px" }}>Fleet</th>
                        <th style={{ padding: "6px 8px" }}>Club</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.map((r, i) => (
                        <tr key={r.id} style={{ borderBottom: "1px solid #eee", background: i % 2 === 0 ? "#fafafa" : "#fff" }}>
                          <td style={{ padding: "6px 8px" }}><strong>{r.boat_name}</strong></td>
                          <td style={{ padding: "6px 8px" }}>{r.skipper}</td>
                          <td style={{ padding: "6px 8px" }}>{r.fleet}</td>
                          <td style={{ padding: "6px 8px" }}>{r.club || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}