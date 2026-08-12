const steps = [
  {
    num: 1, title: "Open the Skipper App",
    text: "Open your phone's browser (Safari on iPhone, Chrome on Android) and go to:",
    link: { text: "sail-race-relay-production.up.railway.app/race/D1", url: "https://sail-race-relay-production.up.railway.app/race/D1" },
  },
  {
    num: 2, title: "Allow Location Access",
    text: "When the page loads, your browser will ask for permission to access your location. Tap Allow when prompted.",
    callout: { type: "warning", text: "If you do not see the prompt, tap the padlock icon in the address bar → Permissions → Location → Allow. The app will not work without location permission." },
  },
  {
    num: 3, title: "Wait for Finish Line to Load",
    text: "The app will automatically download the finish line coordinates. You will see \u201cFinish line loaded\u201d with the race name, coordinates, start time, and minimum finish time.",
    callout: { type: "info", text: "If it shows \u201cNo finish line set yet\u201d the race officer has not published the coordinates yet. The app checks every 5 seconds automatically." },
  },
  {
    num: 4, title: "Enter Your Sail Number",
    text: "In the Sail number, boat name, or skipper name field, enter one of: your sail number (e.g. CAN-3456), your boat name, or your skipper name. Make sure this matches exactly what is registered in the race management system.",
  },
  {
    num: 5, title: "Arm the Detector",
    text: "Tap Arm finish line detector. The app will acquire your GPS position (10–30 seconds), show your distance to the finish line, and begin monitoring silently in the background.",
    callout: { type: "success", text: "Once armed, you do not need to watch or touch the app. Keep the screen on and the browser open throughout the race." },
  },
];

const troubleshooting = [
  ["GPS error: User denied Geolocation", "Tap padlock in address bar → Location → Allow, then refresh"],
  ["App shows wrong distance", "Enable High Accuracy location in phone settings"],
  ["\u201cNo finish line set\u201d after 2+ minutes", "Contact race officer — finish line may not be published yet"],
  ["Finish not submitted", "Note your time and contact race officer. Check mobile data is on"],
  ["Phone battery low", "Connect portable charger — do not close the app"],
  ["Accidentally closed the app", "Re-open URL, re-enter sail number and re-arm immediately"],
];

const CALLOUT_STYLES = {
  warning: { bg: "#fffaf0", border: "#f6ad55", icon: "⚠️", color: "#7b341e" },
  info: { bg: "#ebf8ff", border: "#63b3ed", icon: "ℹ️", color: "#2c5282" },
  success: { bg: "#f0fff4", border: "#68d391", icon: "✅", color: "#276749" },
};

function Callout({ type, text }) {
  const c = CALLOUT_STYLES[type] || CALLOUT_STYLES.info;
  return (
    <div style={{ background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: "10px", padding: "0.85rem 1rem", marginTop: "0.75rem", display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
      <span>{c.icon}</span>
      <span style={{ fontSize: "0.85rem", lineHeight: 1.6, color: c.color, fontStyle: "italic" }}>{text}</span>
    </div>
  );
}

export default function SkipperInstructions() {
  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <span style={s.navBrand}>⛵ OCOR 2026</span>
        <a href="/regatta" style={s.navBack}>← Back to Regatta</a>
      </nav>

      <div style={s.container}>
        <div style={s.header}>
          <div style={s.headerIcon}>📍</div>
          <h1 style={s.title}>Virtual Finish Line</h1>
          <div style={s.subtitle}>Skipper Instructions</div>
          <div style={s.subtitle2}>2026 Oakville Club Open Regatta — Distance Race</div>
        </div>

        {/* Overview */}
        <div style={s.section}>
          <p style={s.item}>
            Your finish time will be recorded automatically when your boat crosses the virtual finish line. Your phone acts as the timing transponder — no additional hardware is needed. Please read these instructions carefully before race day.
          </p>
        </div>

        {/* Phone Setup */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <span style={s.sectionIcon}>📱</span>
            <h2 style={s.sectionTitle}>Before Race Day — Phone Setup</h2>
          </div>

          <div style={s.subheading}>All Phones</div>
          <ul style={s.bulletList}>
            <li style={s.bulletItem}>Make sure your phone is <strong>fully charged</strong> before the race, or bring a portable charger</li>
            <li style={s.bulletItem}>Ensure <strong>mobile data</strong> is enabled — the app needs an internet connection to submit your finish time</li>
            <li style={s.bulletItem}>Keep your phone in a <strong>waterproof case</strong> or dry bag accessible from the helm</li>
          </ul>

          <div style={s.deviceGrid}>
            <div style={s.deviceCard}>
              <div style={s.deviceTitle}>🍎 iPhone (Safari)</div>
              <ol style={s.numberedList}>
                <li style={s.bulletItem}>Open Settings → Privacy &amp; Security → Location Services</li>
                <li style={s.bulletItem}>Make sure Location Services is turned On</li>
                <li style={s.bulletItem}>Scroll down to Safari → set to While Using the App</li>
              </ol>
            </div>
            <div style={s.deviceCard}>
              <div style={s.deviceTitle}>🤖 Android (Chrome)</div>
              <ol style={s.numberedList}>
                <li style={s.bulletItem}>Open Settings → Location</li>
                <li style={s.bulletItem}>Make sure Location is turned On</li>
                <li style={s.bulletItem}>Set accuracy to High accuracy (uses GPS, Wi-Fi, and mobile networks)</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Step by step */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <span style={s.sectionIcon}>🏁</span>
            <h2 style={s.sectionTitle}>On Race Day — Step by Step</h2>
          </div>
          {steps.map(step => (
            <div key={step.num} style={s.stepCard}>
              <div style={s.stepHeader}>
                <span style={s.stepNum}>{step.num}</span>
                <span style={s.stepTitle}>{step.title}</span>
              </div>
              <p style={s.item}>{step.text}</p>
              {step.link && (
                <p style={{ ...s.item, marginTop: "-0.25rem" }}>
                  <a href={step.link.url} target="_blank" rel="noopener noreferrer" style={s.inlineLink}>{step.link.text}</a>
                </p>
              )}
              {step.callout && <Callout {...step.callout} />}
            </div>
          ))}
        </div>

        {/* During the race */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <span style={s.sectionIcon}>⛵</span>
            <h2 style={s.sectionTitle}>During the Race</h2>
          </div>
          <ul style={s.bulletList}>
            <li style={s.bulletItem}><strong>Keep the browser open</strong> — do not close the tab or lock your phone for extended periods</li>
            <li style={s.bulletItem}><strong>Keep mobile data on</strong> — the app needs connectivity to submit your finish time</li>
            <li style={s.bulletItem}><strong>Do not re-arm</strong> — the app ignores crossings within the minimum finish time window, so crossing the start line will not trigger a false finish</li>
            <li style={s.bulletItem}>The app shows your <strong>distance to the finish line</strong> updating in real time as you approach</li>
          </ul>
        </div>

        {/* Finishing */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <span style={s.sectionIcon}>🎉</span>
            <h2 style={s.sectionTitle}>Finishing</h2>
          </div>
          <p style={s.item}>
            When your boat crosses the finish line the app will automatically detect the crossing, record your finish time, calculate your elapsed time, submit your result to race officials, and display “Finish line crossed!” with your elapsed time and a confirmation message.
          </p>
          <Callout type="warning" text="If you see “No connection — save your time manually”, your result was not submitted. Note your finish time shown on screen and contact the race officer immediately." />
        </div>

        {/* Troubleshooting */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <span style={s.sectionIcon}>🛠</span>
            <h2 style={s.sectionTitle}>Troubleshooting</h2>
          </div>
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Problem</th>
                  <th style={s.th}>Solution</th>
                </tr>
              </thead>
              <tbody>
                {troubleshooting.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f7fafc" }}>
                    <td style={{ ...s.td, fontWeight: 700 }}>{row[0]}</td>
                    <td style={s.td}>{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Important notes */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <span style={s.sectionIcon}>📌</span>
            <h2 style={s.sectionTitle}>Important Notes</h2>
          </div>
          <ul style={s.bulletList}>
            <li style={s.bulletItem}>The finish line detection threshold requires your GPS to be within a set distance of the line for a crossing to register</li>
            <li style={s.bulletItem}>Crossings before the minimum finish time after the gun are ignored (start line crossing)</li>
            <li style={s.bulletItem}>Only your <strong>first crossing</strong> after the minimum time is recorded — subsequent crossings are ignored</li>
            <li style={s.bulletItem}>Results appear on the official results page within seconds of finishing</li>
          </ul>
          <p style={{ ...s.item, marginTop: "1rem", fontWeight: 700 }}>
            Race Officer Contact: VHF Channel 72 · Contact info provided at the skippers' meeting
          </p>
        </div>

        <div style={s.poweredBy}>Powered by OC Regatta Virtual Finish Line System</div>

        <div style={s.footer}>
          <a href="/regatta" style={s.footerBtn}>← Back to Regatta</a>
          <a href="/noticeboard" style={s.footerBtnPrimary}>Notice Board →</a>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { fontFamily: "'Nunito', sans-serif", background: "#f0f4f8", minHeight: "100vh" },
  nav: { position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", borderBottom: "3px solid #FF6B35", padding: "0.75rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" },
  navBrand: { fontFamily: "'Anton', sans-serif", fontSize: "1.4rem", color: "#FF6B35", letterSpacing: "0.1em" },
  navBack: { color: "#4a5568", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" },
  container: { maxWidth: "820px", margin: "0 auto", padding: "2rem 1.5rem" },
  header: { background: "white", borderRadius: "16px", padding: "2.5rem", textAlign: "center", marginBottom: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", borderTop: "5px solid #FF6B35" },
  headerIcon: { fontSize: "2.5rem", marginBottom: "0.5rem" },
  title: { fontFamily: "'Anton', sans-serif", fontSize: "1.8rem", color: "#1a365d", letterSpacing: "0.03em", textTransform: "uppercase", margin: "0 0 0.5rem" },
  subtitle: { fontSize: "1.1rem", fontWeight: 700, color: "#2d3748", marginBottom: "0.25rem" },
  subtitle2: { fontSize: "0.9rem", color: "#718096" },
  section: { background: "white", borderRadius: "12px", padding: "1.5rem 2rem", marginBottom: "1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" },
  sectionHeader: { display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "2px solid #e2e8f0" },
  sectionIcon: { fontSize: "1.3rem" },
  sectionTitle: { fontFamily: "'Anton', sans-serif", fontSize: "1.05rem", color: "#1a365d", letterSpacing: "0.03em", textTransform: "uppercase", margin: 0 },
  subheading: { fontWeight: 800, color: "#1a365d", fontSize: "0.95rem", marginBottom: "0.5rem" },
  item: { fontSize: "0.9rem", lineHeight: 1.7, color: "#2d3748", marginBottom: "0.5rem" },
  bulletList: { paddingLeft: "1.5rem", margin: "0.5rem 0" },
  numberedList: { paddingLeft: "1.25rem", margin: "0.5rem 0" },
  bulletItem: { fontSize: "0.88rem", lineHeight: 1.7, color: "#2d3748", marginBottom: "0.3rem" },
  inlineLink: { color: "#2b6cb0", fontWeight: 700, textDecoration: "none", wordBreak: "break-all" },
  deviceGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginTop: "1rem" },
  deviceCard: { background: "#f7fafc", borderRadius: "10px", padding: "1rem 1.25rem", border: "1px solid #e2e8f0" },
  deviceTitle: { fontWeight: 800, color: "#1a365d", fontSize: "0.9rem", marginBottom: "0.5rem" },
  stepCard: { borderLeft: "4px solid #FF6B35", background: "#fffaf7", borderRadius: "0 10px 10px 0", padding: "1rem 1.25rem", marginBottom: "1rem" },
  stepHeader: { display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" },
  stepNum: { background: "#FF6B35", color: "white", width: "26px", height: "26px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.8rem", flexShrink: 0 },
  stepTitle: { fontWeight: 800, color: "#1a365d", fontSize: "0.95rem" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" },
  th: { textAlign: "left", padding: "8px 10px", fontSize: "0.75rem", textTransform: "uppercase", color: "#718096", borderBottom: "2px solid #e2e8f0", background: "#f7fafc" },
  td: { padding: "8px 10px", borderBottom: "1px solid #edf2f7", color: "#2d3748" },
  poweredBy: { textAlign: "center", fontSize: "0.8rem", color: "#a0aec0", marginBottom: "1rem" },
  footer: { display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem", paddingBottom: "2rem" },
  footerBtn: { padding: "0.75rem 1.5rem", borderRadius: "50px", border: "2px solid #cbd5e0", color: "#4a5568", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" },
  footerBtnPrimary: { padding: "0.75rem 1.5rem", borderRadius: "50px", background: "#FF6B35", color: "white", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" },
};
