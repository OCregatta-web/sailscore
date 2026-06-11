export default function Walkthrough() {
  const [current, setCurrent] = useState(0);

  const steps = [
    {
      icon: "⛵",
      iconBg: "#E6F1FB",
      title: "Create your series",
      sub: "A series is the container for your entire regatta — it holds all your races, boats, and results.",
      actions: [
        { text: 'From the dashboard, click <span class="wt-highlight">+ New Series</span>' },
        { text: 'Enter a name — e.g. "Lake Breeze Open Regatta 2026"' },
        { text: 'Set the season year and number of throwouts (usually 1 for a 3-race series)' },
        { text: 'Click <span class="wt-highlight">Create Series</span> — your series is ready' },
      ],
      tip: "Throwouts automatically drop a boat's worst race from their series total. Set to 1 for a 3-race series so each boat can have one bad day.",
    },
    {
      icon: "🚩",
      iconBg: "#E1F5EE",
      title: "Set up your fleets",
      sub: "Fleets group boats by sail configuration. SailScore lets you create any fleet structure that fits your entry list.",
      actions: [
        { text: 'Open your series and go to <span class="wt-highlight">Fleet Manager</span>' },
        { text: 'Default fleets are FS, NFS, Distance, 1-Design — edit or add as needed' },
        { text: 'As entries come in, split fleets if needed: FS → FS1 + FS2, NFS → NFS1 + NFS2' },
        { text: 'Rename any fleet by clicking the fleet name — changes apply to all boats instantly' },
      ],
      why: "Fleet splits are based on boat count and type. A general rule: 5+ boats of similar class can form their own fleet. SailScore lets you rename and reassign at any time before racing.",
    },
    {
      icon: "📋",
      iconBg: "#FBEAF0",
      title: "Add boats to the fleet",
      sub: "There are two ways to add boats: online registration (skippers do it themselves) or manually via Fleet Manager.",
      actions: [
        { text: '<strong>Online:</strong> share the registration link — skippers enter their own boat name, PHRF, fleet, and club' },
        { text: '<strong>Manual:</strong> in Fleet Manager, click <span class="wt-highlight">+ Add to [Fleet]</span> and fill in the details' },
        { text: 'Each boat needs: sail number, boat name, skipper, PHRF rating, fleet, and club' },
        { text: 'The TOT factor is calculated automatically from the PHRF rating' },
      ],
      tip: "Online registration saves you time and puts the responsibility on skippers to enter their correct PHRF rating. Club name is required — it shows in standings and results.",
    },
    {
      icon: "🏁",
      iconBg: "#EAF3DE",
      title: "Create races",
      sub: "Create a race entry for each race on the day. For a typical regatta you'll have 2–3 buoy races and optionally 1 distance race.",
      actions: [
        { text: 'Go to <span class="wt-highlight">Race Entry</span> and click <span class="wt-highlight">+ New Race</span>' },
        { text: 'Enter race number and date — name is optional' },
        { text: 'For the pursuit race, name it <span class="wt-highlight">Distance Race</span> — this puts it in the Distance tab' },
        { text: 'Repeat for each race — R1, R2, R3, Distance Race' },
      ],
      tip: "Name your distance race 'Distance Race' exactly — this is how SailScore knows to show it in the Distance tab and hide it from the buoy race standings.",
    },
    {
      icon: "⏰",
      iconBg: "#FAEEDA",
      title: "Enter fleet start times",
      sub: "SailScore needs the gun time for each fleet to calculate elapsed times. Each fleet can have a different start time.",
      actions: [
        { text: 'Select Race 1 in the sidebar, then find the <span class="wt-highlight">Fleet Start Time</span> input for each fleet' },
        { text: 'Enter the actual gun time in HH:MM:SS format — e.g. 13:00:00' },
        { text: 'Click <span class="wt-highlight">Apply to [Fleet]</span> — this locks the start time for that fleet' },
        { text: 'FS and NFS can have different start times if they start in sequence' },
      ],
      why: "Without a fleet start time, elapsed time cannot be calculated. Elapsed time = finish time − start time. Corrected time = elapsed × TOT factor. No start time = no scoring.",
    },
    {
      icon: "🛥️",
      iconBg: "#E1F5EE",
      title: "Record finishes",
      sub: "As boats finish, tap the boat name to stamp the finish time, or type it manually. SailScore calculates elapsed time live.",
      actions: [
        { text: 'Click the <span class="wt-highlight">boat name</span> the moment it crosses the line — it stamps the current time automatically' },
        { text: 'Or type the finish time manually in HH:MM:SS format' },
        { text: 'For non-finishers, change status to DNS, DNF, DNC, or DSQ using the dropdown' },
        { text: 'Elapsed and corrected times appear instantly as you enter finish times' },
      ],
      tip: "Use a tablet or phone dockside and tap boat names as they finish. The timestamp is taken from your device clock — make sure it's synced before racing.",
    },
    {
      icon: "📊",
      iconBg: "#E6F1FB",
      title: "Score the fleets",
      sub: "Once all boats are recorded, click Score All Fleets. SailScore calculates positions within each fleet and posts results online instantly.",
      actions: [
        { text: 'After all finishes are entered, click <span class="wt-highlight">Score All Fleets</span> at the bottom of the page' },
        { text: 'Each fleet is scored independently — positions are within-fleet, not overall' },
        { text: 'Results appear online at the public results page immediately' },
        { text: 'Standings update automatically — series points accumulate across races' },
      ],
      tip: "You can re-score at any time if you need to correct a finish time. Just update the time and click Score All Fleets again — it overwrites the previous result.",
    },
    {
      icon: "🌐",
      iconBg: "#FBEAF0",
      title: "Results go live",
      sub: "The moment you score, results are published online. Competitors can check standings on their phones at the dock — no waiting.",
      actions: [
        { text: 'Share the results link with competitors' },
        { text: 'Results show corrected times, fleet positions, and series standings' },
        { text: 'Click any race column header to see full race detail' },
        { text: 'Export the full results as CSV for printing or trophy presentations' },
      ],
      tip: "Post the results link in your regatta WhatsApp or Facebook group before prize giving. Competitors love seeing their corrected times immediately.",
    },
  ];

  const s = steps[current];
  const progress = Math.round(((current + 1) / steps.length) * 100);

  return (
    <div style={st.page}>
      <nav style={st.nav}>
        <span style={st.brand}>⛵ SailScore</span>
        <a href="/demo" style={st.navLink}>← Back to demo</a>
      </nav>

      <div style={st.container}>
        {/* Header */}
        <div style={st.header}>
          <div style={st.headerBadge}>📖 Guided walkthrough</div>
          <h1 style={st.headerTitle}>How to run a regatta with SailScore</h1>
          <p style={st.headerSub}>Step-by-step from setup to final results</p>
        </div>

        {/* Progress bar */}
        <div style={st.progressWrap}>
          <div style={st.progressBar}>
            <div style={{ ...st.progressFill, width: `${progress}%` }} />
          </div>
          <span style={st.progressLabel}>Step {current + 1} of {steps.length}</span>
        </div>

        {/* Step dots */}
        <div style={st.dotsRow}>
          {steps.map((step, i) => (
            <div key={i} style={st.dotWrap} onClick={() => setCurrent(i)}>
              <div style={{
                ...st.dot,
                background: i < current ? '#1D9E75' : i === current ? '#0a1628' : 'white',
                borderColor: i < current ? '#1D9E75' : i === current ? '#0a1628' : '#cbd5e0',
                color: i <= current ? 'white' : '#718096',
                cursor: 'pointer',
              }}>
                {i < current ? '✓' : i + 1}
              </div>
            </div>
          ))}
        </div>

        {/* Step card */}
        <div style={st.card}>
          <div style={st.stepHeader}>
            <div style={{ ...st.stepIcon, background: s.iconBg }}>
              <span style={{ fontSize: '1.75rem' }}>{s.icon}</span>
            </div>
            <div>
              <div style={st.stepNum}>Step {current + 1} of {steps.length}</div>
              <h2 style={st.stepTitle}>{s.title}</h2>
              <p style={st.stepSub}>{s.sub}</p>
            </div>
          </div>

          <div style={st.divider} />

          {/* Actions */}
          <div style={st.actionList}>
            {s.actions.map((a, i) => (
              <div key={i} style={st.action}>
                <div style={st.actionNum}>{i + 1}</div>
                <div style={st.actionText} dangerouslySetInnerHTML={{ __html: a.text }} />
              </div>
            ))}
          </div>

          {/* Tip */}
          {s.tip && (
            <div style={st.tip}>
              <span style={st.tipIcon}>💡</span>
              <span>{s.tip}</span>
            </div>
          )}

          {/* Why */}
          {s.why && (
            <div style={st.why}>
              <span style={st.tipIcon}>⚠️</span>
              <span>{s.why}</span>
            </div>
          )}

          <div style={st.divider} />

          {/* Navigation */}
          <div style={st.navRow}>
            <button
              style={{ ...st.navBtn, opacity: current === 0 ? 0.4 : 1 }}
              onClick={() => current > 0 && setCurrent(current - 1)}
              disabled={current === 0}
            >← Back</button>

            <div style={st.dotsMini}>
              {steps.map((_, i) => (
                <div key={i} style={{
                  ...st.dotMini,
                  background: i === current ? '#0a1628' : i < current ? '#1D9E75' : '#e2e8f0',
                }} onClick={() => setCurrent(i)} />
              ))}
            </div>

            {current < steps.length - 1 ? (
              <button style={st.navBtnPrimary} onClick={() => setCurrent(current + 1)}>
                Next →
              </button>
            ) : (
              <a href="/" style={st.navBtnSuccess}>
                Try it now →
              </a>
            )}
          </div>
        </div>

        {/* All steps overview */}
        <div style={st.overviewTitle}>All steps</div>
        <div style={st.overviewGrid}>
          {steps.map((step, i) => (
            <div
              key={i}
              style={{
                ...st.overviewCard,
                borderColor: i === current ? '#0a1628' : i < current ? '#1D9E75' : '#e2e8f0',
                cursor: 'pointer',
              }}
              onClick={() => setCurrent(i)}
            >
              <div style={{ ...st.overviewIcon, background: step.iconBg }}>{step.icon}</div>
              <div>
                <div style={{ fontSize: '0.75rem', color: i < current ? '#1D9E75' : '#718096', fontWeight: 600 }}>
                  {i < current ? '✓ Done' : i === current ? '▶ Current' : `Step ${i + 1}`}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2d3748' }}>{step.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";

const st = {
  page: { fontFamily: "'Nunito', sans-serif", background: "#f0f4f8", minHeight: "100vh" },
  nav: { background: "white", borderBottom: "1px solid #e2e8f0", padding: "0.75rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 },
  brand: { fontFamily: "'Anton', sans-serif", fontSize: "1.4rem", color: "#FF6B35", letterSpacing: "0.1em" },
  navLink: { color: "#4a5568", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" },
  container: { maxWidth: "720px", margin: "0 auto", padding: "2rem 1.5rem" },
  header: { textAlign: "center", marginBottom: "1.5rem" },
  headerBadge: { display: "inline-block", background: "rgba(255,107,53,0.1)", color: "#FF6B35", padding: "4px 14px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.75rem" },
  headerTitle: { fontFamily: "'Anton', sans-serif", fontSize: "1.8rem", color: "#1a365d", textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: "0.5rem" },
  headerSub: { fontSize: "0.95rem", color: "#718096" },
  progressWrap: { display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" },
  progressBar: { flex: 1, height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden" },
  progressFill: { height: "100%", background: "#0a1628", borderRadius: "3px", transition: "width 0.3s ease" },
  progressLabel: { fontSize: "0.8rem", color: "#718096", whiteSpace: "nowrap" },
  dotsRow: { display: "flex", justifyContent: "center", gap: "0.5rem", marginBottom: "1.5rem" },
  dotWrap: { cursor: "pointer" },
  dot: { width: "32px", height: "32px", borderRadius: "50%", border: "2px solid", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700, transition: "all 0.2s" },
  card: { background: "white", borderRadius: "16px", padding: "1.75rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: "1.5rem" },
  stepHeader: { display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1.25rem" },
  stepIcon: { width: "56px", height: "56px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  stepNum: { fontSize: "0.75rem", color: "#718096", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" },
  stepTitle: { fontSize: "1.3rem", fontWeight: 800, color: "#1a365d", marginBottom: "4px" },
  stepSub: { fontSize: "0.9rem", color: "#718096", lineHeight: 1.6 },
  divider: { height: "1px", background: "#f0f4f8", margin: "1.25rem 0" },
  actionList: { display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.25rem" },
  action: { display: "flex", alignItems: "flex-start", gap: "0.75rem", background: "#f7fafc", borderRadius: "10px", padding: "0.75rem 1rem" },
  actionNum: { width: "24px", height: "24px", borderRadius: "50%", background: "#1a365d", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800, flexShrink: 0 },
  actionText: { fontSize: "0.9rem", color: "#2d3748", lineHeight: 1.6 },
  tip: { background: "#ebf8ff", borderLeft: "4px solid #2b6cb0", borderRadius: "0 8px 8px 0", padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#2c5282", display: "flex", gap: "0.5rem", lineHeight: 1.6, marginBottom: "1rem" },
  why: { background: "#fffaf0", borderLeft: "4px solid #d69e2e", borderRadius: "0 8px 8px 0", padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#744210", display: "flex", gap: "0.5rem", lineHeight: 1.6, marginBottom: "1rem" },
  tipIcon: { flexShrink: 0 },
  navRow: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  navBtn: { padding: "0.6rem 1.25rem", background: "white", border: "1.5px solid #cbd5e0", borderRadius: "8px", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", color: "#4a5568" },
  navBtnPrimary: { padding: "0.6rem 1.5rem", background: "#0a1628", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" },
  navBtnSuccess: { padding: "0.6rem 1.5rem", background: "#FF6B35", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "0.875rem", textDecoration: "none" },
  dotsMini: { display: "flex", gap: "6px", alignItems: "center" },
  dotMini: { width: "8px", height: "8px", borderRadius: "50%", cursor: "pointer", transition: "background 0.2s" },
  overviewTitle: { fontFamily: "'Anton', sans-serif", fontSize: "1rem", color: "#1a365d", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" },
  overviewGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem", marginBottom: "2rem" },
  overviewCard: { background: "white", border: "1.5px solid", borderRadius: "10px", padding: "0.75rem", display: "flex", alignItems: "center", gap: "0.75rem", transition: "border-color 0.2s" },
  overviewIcon: { width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 },
};
