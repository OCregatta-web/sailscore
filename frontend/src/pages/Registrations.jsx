import { useState, useEffect } from "react";
import { useAuth } from "../App";
import { api } from "../api";
export default function Registrations({ seriesId, seriesName }) {
  const { user, navigate } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [togglingClosed, setTogglingClosed] = useState(false);
  const [promotingId, setPromotingId] = useState(null);

  const loadRegistrations = () =>
    api.get(`/series/${seriesId}/registrations`, user.token).then(setRegistrations);
  const loadWaitlist = () =>
    api.get(`/series/${seriesId}/waitlist`, user.token).then(setWaitlist);

  useEffect(() => {
    api.get(`/series/${seriesId}`, user.token).then(setSeries);
    Promise.all([loadRegistrations(), loadWaitlist()])
      .finally(() => setLoading(false));
  }, [seriesId]);

  const toggleRegistrationClosed = async () => {
    if (!series) return;
    const closing = !series.registration_closed;
    const confirmed = window.confirm(
      closing
        ? "Close registration? New signups will go to the waitlist instead of the fleet."
        : "Reopen registration? New signups will be added directly to the fleet again."
    );
    if (!confirmed) return;
    setTogglingClosed(true);
    try {
      await api.put(`/series/${seriesId}`, {
        name: series.name,
        season: series.season,
        throwouts: series.throwouts,
        registration_closed: closing,
      }, user.token);
      // Re-fetch rather than trust the PUT response shape, so the banner
      // always reflects what's actually saved.
      const fresh = await api.get(`/series/${seriesId}`, user.token);
      setSeries(fresh);
    } catch (err) {
      alert("Couldn't update registration status: " + (err.message || "unknown error"));
    } finally {
      setTogglingClosed(false);
    }
  };

  const promote = async (regId) => {
    setPromotingId(regId);
    try {
      await api.post(`/series/${seriesId}/registrations/${regId}/promote`, {}, user.token);
      await Promise.all([loadRegistrations(), loadWaitlist()]);
    } finally {
      setPromotingId(null);
    }
  };

  const [cleaningUp, setCleaningUp] = useState(false);

  const cleanupStale = async () => {
    setCleaningUp(true);
    try {
      const stale = await api.get(`/series/${seriesId}/registrations/stale`, user.token);
      if (stale.length === 0) {
        alert("No stale registrations found — everything matches the fleet.");
        return;
      }
      const names = stale.map(r => `${r.boat_name} (${r.sail_number})`).join("\n");
      const confirmed = window.confirm(
        `${stale.length} registration${stale.length !== 1 ? "s" : ""} no longer match a boat in the fleet:\n\n${names}\n\nRemove these from Registrations?`
      );
      if (!confirmed) return;
      await api.post(`/series/${seriesId}/registrations/cleanup`, {}, user.token);
      await loadRegistrations();
    } finally {
      setCleaningUp(false);
    }
  };
  const regLink = `${window.location.origin}/register?series=${seriesId}`;
  const copyLink = () => {
    navigator.clipboard.writeText(regLink);
    alert("Registration link copied to clipboard!");
  };
  const downloadCSV = () => {
    const headers = ["Boat Name", "Skipper", "Email"];
    const rows = registrations.map(r => [
      `"${(r.boat_name || "").replace(/"/g, '""')}"`,
      `"${(r.skipper || "").replace(/"/g, '""')}"`,
      `"${(r.email || "").replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${seriesName.replace(/\s+/g, "_")}_registrations.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const emailAll = () => {
    const emails = registrations.map(r => r.email).filter(Boolean).join(",");
    const subject = encodeURIComponent(`${seriesName} — Important Update`);
    const body = encodeURIComponent(`Dear Skippers,\n\n\n\nSee you on the water!\nOC Regatta Committee\nwww.ocregatta.com`);
    window.open(`https://mail.google.com/mail/?view=cm&bcc=${encodeURIComponent(emails)}&su=${subject}&body=${body}`, "_blank");
  };
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <button className="breadcrumb" onClick={() => navigate("dashboard")}>← My Series</button>
          <h1 className="page-title">{seriesName}</h1>
          <p className="page-subtitle">Registrations</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {registrations.length > 0 && (
            <>
              <button className="btn-secondary" onClick={emailAll}>
                ✉️ Email All
              </button>
              <button className="btn-secondary" onClick={downloadCSV}>
                ⬇ Download CSV
              </button>
              <button className="btn-secondary" onClick={cleanupStale} disabled={cleaningUp}>
                {cleaningUp ? "Checking..." : "🧹 Clean Up Stale Entries"}
              </button>
            </>
          )}
          <button className="btn-secondary" onClick={() => navigate("fleet", { seriesId, seriesName })}>
            View Fleet →
          </button>
        </div>
      </div>
      {/* Registration status */}
      {series && (
        <div
          className="reg-link-card"
          style={{
            background: series.registration_closed ? "#fff8e1" : "#f0fdf9",
            border: `1px solid ${series.registration_closed ? "#f0d878" : "#b7ebde"}`,
          }}
        >
          <div className="reg-link-info">
            <div className="reg-link-title">
              <span
                style={{
                  display: "inline-block",
                  padding: "0.15rem 0.6rem",
                  borderRadius: "20px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  marginRight: "0.5rem",
                  color: "white",
                  background: series.registration_closed ? "#c53030" : "#06b58a",
                }}
              >
                {series.registration_closed ? "CLOSED" : "OPEN"}
              </span>
              Registration is currently {series.registration_closed ? "closed" : "open"}
            </div>
            <div className="reg-link-desc">
              {series.registration_closed
                ? "New skippers are being added to the waitlist instead of the fleet."
                : "Skippers who use your link are added straight to the fleet."}
            </div>
          </div>
          <button
            className="btn-secondary"
            onClick={toggleRegistrationClosed}
            disabled={togglingClosed}
          >
            {togglingClosed
              ? "Updating..."
              : series.registration_closed
                ? "Reopen Registration"
                : "Close Registration"}
          </button>
        </div>
      )}
      {/* Registration link */}
      <div className="reg-link-card">
        <div className="reg-link-info">
          <div className="reg-link-title">📋 Skipper Registration Link</div>
          <div className="reg-link-desc">
            Share this link with skippers to self-register.
          </div>
          <div className="reg-link-url">{regLink}</div>
        </div>
        <button className="btn-primary" onClick={copyLink}>Copy Link</button>
      </div>
      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : registrations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No registrations yet</h3>
          <p>Share the link above with your skippers.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sail #</th>
                <th>Boat Name</th>
                <th>Class</th>
                <th>Skipper</th>
                <th>Fleet</th>
                <th className="num-col">PHRF</th>
                <th>Club</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map(r => (
                <tr key={r.id}>
                  <td><span className="sail-num">{r.sail_number}</span></td>
                  <td className="boat-name-cell">{r.boat_name}</td>
                  <td>{r.boat_class || "—"}</td>
                  <td>{r.skipper}</td>
                  <td><span className="fleet-pill">{r.fleet}</span></td>
                  <td className="num-col">
                    <span className="rating-badge">{r.phrf_rating}</span>
                  </td>
                  <td>{r.club || "—"}</td>
                  <td>{r.email || "—"}</td>
                  <td>{r.phone || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="table-footer">
            {registrations.length} registration{registrations.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      {waitlist.length > 0 && (
        <div className="table-wrap" style={{ marginTop: "2rem" }}>
          <h3 style={{ margin: "0 0 0.75rem" }}>⏳ Waitlist</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Sail #</th>
                <th>Boat Name</th>
                <th>Class</th>
                <th>Skipper</th>
                <th>Fleet</th>
                <th className="num-col">PHRF</th>
                <th>Club</th>
                <th>Email</th>
                <th>Phone</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {waitlist.map(r => (
                <tr key={r.id}>
                  <td><span className="sail-num">{r.sail_number}</span></td>
                  <td className="boat-name-cell">{r.boat_name}</td>
                  <td>{r.boat_class || "—"}</td>
                  <td>{r.skipper}</td>
                  <td><span className="fleet-pill">{r.fleet}</span></td>
                  <td className="num-col">
                    <span className="rating-badge">{r.phrf_rating}</span>
                  </td>
                  <td>{r.club || "—"}</td>
                  <td>{r.email || "—"}</td>
                  <td>{r.phone || "—"}</td>
                  <td>
                    <button
                      className="btn-secondary"
                      onClick={() => promote(r.id)}
                      disabled={promotingId === r.id}
                    >
                      {promotingId === r.id ? "Promoting..." : "↑ Promote"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="table-footer">
            {waitlist.length} on waitlist
          </div>
        </div>
      )}
    </div>
  );
}
