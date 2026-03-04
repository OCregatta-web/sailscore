import { useState } from "react";
import { useAuth } from "../App";
import { api } from "../api";

export default function Login() {
  const { login } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    email: "", password: "", name: "",
    boat_name: "", skipper: "", club: "", phrf_rating: "", fleet: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        await api.post("/auth/register", {
          email: form.email,
          name: form.name,
          password: form.password,
          boat_name: form.boat_name || null,
          skipper: form.skipper || null,
          club: form.club || null,
          phrf_rating: form.phrf_rating ? Number(form.phrf_rating) : null,
          fleet: form.fleet || null,
        });
      }
      await login(form.email, form.password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="wave wave1" />
        <div className="wave wave2" />
        <div className="wave wave3" />
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">⛵</div>
          <h1 className="login-title">SailScore</h1>
          <p className="login-subtitle">PHRF Handicap Race Scoring</p>
        </div>

        <div className="login-tabs">
          <button
            className={`login-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => { setMode("login"); setError(""); }}
          >Sign In</button>
          <button
            className={`login-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => { setMode("register"); setError(""); }}
          >Register</button>
        </div>

        <form onSubmit={submit} className="login-form">
          {mode === "register" && (
            <>
              <div className="field">
                <label>Full Name</label>
                <input type="text" placeholder="Jane Smith" value={form.name} onChange={set("name")} required />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Boat Name</label>
                  <input type="text" placeholder="Windseeker" value={form.boat_name} onChange={set("boat_name")} />
                </div>
                <div className="field">
                  <label>Skipper</label>
                  <input type="text" placeholder="Jane Smith" value={form.skipper} onChange={set("skipper")} />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Club</label>
                  <input type="text" placeholder="Lakeshore YC" value={form.club} onChange={set("club")} />
                </div>
                <div className="field">
                  <label>PHRF Rating</label>
                  <input type="number" placeholder="126" value={form.phrf_rating} onChange={set("phrf_rating")} />
                </div>
              </div>
              <div className="field">
                <label>Fleet</label>
                <select value={form.fleet} onChange={set("fleet")}>
                  <option value="">-- Select Fleet --</option>
                  <option value="1-Design">1-Design</option>
                  <option value="FS">FS (Flying Sail)</option>
                  <option value="NFS">NFS (Non-Flying Sail)</option>
                  <option value="Distance">Distance</option>
                  <option value="NFS2">NFS2</option>
                  <option value="FS2">FS2</option>
                </select>
              </div>
            </>
          )}

          <div className="field">
            <label>Email</label>
            <input type="email" placeholder="skipper@club.org" value={form.email} onChange={set("email")} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={form.password} onChange={set("password")} required />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? "..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}