import { useState, useEffect } from "react";
import { useAuth } from "../App";
import { api } from "../api";

export default function Registrations({ seriesId, seriesName }) {
  const { user, navigate } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/series/${seriesId}/registrations`, user.token)
      .then(setRegistrations)
      .finally(() => setLoading(false));
  }, [seriesId]);

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
            <button className="btn-secondary" onClick={downloadCSV}>
              ⬇ Download CSV
            </button>
          )}
          <button className="btn-secondary" onClick={() => navigate("fleet", { seriesId, seriesName })}>
            View Fleet →
          </button>
        </div>
      </div>

      {/* Registration link */}
      <div className="reg-link-card">
        <div className="reg-link-info">
          <div className="reg-link-title">📋 Skipper Registration Link</div>
          <div className="reg-link-desc">Share this link with skippers to self-register. Their boat is automatically added to the fleet.</div>
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
    </div>
  );
}