import { useState } from "react";

const updates = [
  { date: "Aug 1", text: "Registration is now open! Early bird entries welcome. Fleet assignments confirmed by Aug 10." },
  { date: "Jul 20", text: "Sponsor announcement: Welcome aboard our platinum sponsor. More details coming soon!" },
  { date: "Jul 10", text: "Notice to Competitors posted. Please review racing instructions on the documents page." },
];

const schedule = [
  { time: "7:30 AM", event: "Registration Opens", icon: "📋" },
  { time: "8:30 AM", event: "Skippers' Meeting", icon: "🧭" },
  { time: "9:30 AM", event: "Warning Signal — Race 1", icon: "🚦" },
  { time: "11:00 AM", event: "Warning Signal — Race 2", icon: "🚦" },
  { time: "1:00 PM", event: "Warning Signal — Race 3", icon: "🚦" },
  { time: "3:00 PM", event: "Last Warning Signal", icon: "🏁" },
  { time: "5:00 PM", event: "Dock Party & Prize Giving", icon: "🏆" },
];

const sponsors = [
  { name: "Oakville Sailing Club", tier: "platinum" },
  { name: "Lake Ontario Marine", tier: "gold" },
  { name: "Harbourside Chandlery", tier: "gold" },
  { name: "Wind & Water Gear", tier: "silver" },
  { name: "The Anchor Pub", tier: "silver" },
  { name: "Oakville Boatworks", tier: "silver" },
];

const photos = [
  { emoji: "⛵", caption: "Fleet Start" },
  { emoji: "🌊", caption: "Downwind Run" },
  { emoji: "🏆", caption: "Prize Giving" },
  { emoji: "🌅", caption: "Race Day Dawn" },
  { emoji: "⚓", caption: "At the Dock" },
  { emoji: "🎉", caption: "Celebration" },
];

export default function Regatta() {
  const [activeSection, setActiveSection] = useState(null);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={styles.page}>
      {/* Nav */}
      <nav style={styles.nav}>
        <span style={styles.navBrand}>⛵ OCOR 2025</span>
        <div style={styles.navLinks}>
          {["schedule", "register", "results", "photos", "sponsors", "contact"].map(s => (
            <button key={s} style={styles.navLink} onClick={() => scrollTo(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </nav>

      {/* Hero */}
      <header style={styles.hero}>
        <div style={styles.heroWaves}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ ...styles.wave, animationDelay: `${i * 0.4}s`, opacity: 0.15 - i * 0.02 }} />
          ))}
        </div>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>OAKVILLE WATERFRONT · LAKE ONTARIO</div>
          <h1 style={styles.heroTitle}>
            <span style={styles.heroTitleLine1}>Oakville Club</span>
            <span style={styles.heroTitleLine2}>Open Regatta</span>
          </h1>
          <div style={styles.heroDate}>
            <span style={styles.heroDateIcon}>📅</span>
            Saturday, August 15, 2025
          </div>
          <div style={styles.heroCtas}>
            <a href="https://sailscore.vercel.app/register" style={styles.ctaPrimary}>
              Register Now →
            </a>
            <button style={styles.ctaSecondary} onClick={() => scrollTo("schedule")}>
              View Schedule
            </button>
          </div>
        </div>
        <div style={styles.heroBoat}>⛵</div>
      </header>

      {/* Updates */}
      <section style={styles.updatesBar}>
        <div style={styles.updatesLabel}>📢 LATEST NEWS</div>
        <div style={styles.updatesList}>
          {updates.map((u, i) => (
            <div key={i} style={styles.updateItem}>
              <span style={styles.updateDate}>{u.date}</span>
              <span style={styles.updateText}>{u.text}</span>
            </div>
          ))}
        </div>
      </section>

      <div style={styles.container}>

        {/* Schedule */}
        <section id="schedule" style={styles.section}>
          <SectionHeader emoji="🗓" title="Race Day Schedule" color="#FF6B35" />
          <div style={styles.scheduleGrid}>
            {schedule.map((item, i) => (
              <div key={i} style={{ ...styles.scheduleItem, animationDelay: `${i * 0.08}s` }}>
                <div style={styles.scheduleIcon}>{item.icon}</div>
                <div style={styles.scheduleTime}>{item.time}</div>
                <div style={styles.scheduleEvent}>{item.event}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Register */}
        <section id="register" style={styles.section}>
          <SectionHeader emoji="📋" title="Register Your Boat" color="#06D6A0" />
          <div style={styles.registerCard}>
            <div style={styles.registerLeft}>
              <h3 style={styles.registerTitle}>Ready to race?</h3>
              <p style={styles.registerText}>
                Online registration is open for all fleets. PHRF Time-on-Time scoring.
                Fleets include FS, NFS, Distance, and 1-Design classes.
              </p>
              <ul style={styles.registerList}>
                <li>✅ Online registration &amp; payment</li>
                <li>✅ Fleet assignment by Aug 10</li>
                <li>✅ Skippers' package at sign-in</li>
                <li>✅ Post-race dock party included</li>
              </ul>
              <a href="https://sailscore.vercel.app/register" style={styles.registerBtn}>
                Register Online →
              </a>
            </div>
            <div style={styles.registerRight}>
              <div style={styles.registerFees}>
                <div style={styles.feesTitle}>Entry Fees</div>
                <div style={styles.feeRow}><span>FS / NFS Fleet</span><span style={styles.feeAmount}>$85</span></div>
                <div style={styles.feeRow}><span>Distance Fleet</span><span style={styles.feeAmount}>$95</span></div>
                <div style={styles.feeRow}><span>1-Design Fleet</span><span style={styles.feeAmount}>$75</span></div>
                <div style={styles.feeRow}><span>Junior Skipper</span><span style={styles.feeAmount}>$40</span></div>
                <div style={styles.feesNote}>Fees include dock party & prizes</div>
              </div>
            </div>
          </div>
        </section>

        {/* Results */}
        <section id="results" style={styles.section}>
          <SectionHeader emoji="🏆" title="Race Results" color="#FFD166" />
          <div style={styles.resultsCard}>
            <div style={styles.resultsEmoji}>🏁</div>
            <h3 style={styles.resultsTitle}>Live Results on SailScore</h3>
            <p style={styles.resultsText}>
              Results will be posted in real-time as races are scored. Check back on race day for live standings by fleet.
            </p>
            <a href="https://sailscore.vercel.app/results" style={styles.resultsBtn}>
              View Results →
            </a>
          </div>
        </section>

        {/* Photos */}
        <section id="photos" style={styles.section}>
          <SectionHeader emoji="📸" title="Gallery" color="#EF476F" />
          <div style={styles.photosGrid}>
            {photos.map((p, i) => (
              <div key={i} style={{ ...styles.photoCard, background: photoColors[i % photoColors.length] }}>
                <div style={styles.photoEmoji}>{p.emoji}</div>
                <div style={styles.photoCaption}>{p.caption}</div>
                <div style={styles.photoOverlay}>Photos coming soon</div>
              </div>
            ))}
          </div>
          <p style={styles.photosNote}>📷 Race photos will be posted here after the event. Past year photos coming soon!</p>
        </section>

        {/* Sponsors */}
        <section id="sponsors" style={styles.section}>
          <SectionHeader emoji="🤝" title="Our Sponsors" color="#118AB2" />
          <div style={styles.sponsorsGrid}>
            {sponsors.map((s, i) => (
              <div key={i} style={{ ...styles.sponsorCard, ...sponsorStyles[s.tier] }}>
                <div style={styles.sponsorTier}>{s.tier.toUpperCase()}</div>
                <div style={styles.sponsorName}>{s.name}</div>
              </div>
            ))}
          </div>
          <div style={styles.sponsorCta}>
            <p>Interested in sponsoring? <a href="mailto:alex@mcmillin.ca" style={styles.sponsorLink}>Get in touch →</a></p>
          </div>
        </section>

        {/* Location */}
        <section style={styles.section}>
          <SectionHeader emoji="📍" title="Getting There" color="#9B5DE5" />
          <div style={styles.locationCard}>
            <div style={styles.locationMap}>
              <div style={styles.locationMapPlaceholder}>
                <span style={styles.locationPin}>📍</span>
                <span>Oakville Waterfront<br />Oakville, Ontario</span>
              </div>
            </div>
            <div style={styles.locationInfo}>
              <h3 style={styles.locationTitle}>Oakville Waterfront</h3>
              <p style={styles.locationText}>
                The regatta is hosted on Lake Ontario off the Oakville waterfront.
                Race committee vessel will be stationed at the start line. Marks will be set on the day based on conditions.
              </p>
              <div style={styles.locationDetails}>
                <div style={styles.locationDetail}><span>⚓</span> Guest docking available at Oakville Harbour</div>
                <div style={styles.locationDetail}><span>🅿️</span> Parking at Lakeside Park lot</div>
                <div style={styles.locationDetail}><span>🚤</span> Launch ramp at 16 Mile Creek</div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" style={styles.section}>
          <SectionHeader emoji="✉️" title="Contact" color="#06D6A0" />
          <div style={styles.contactCard}>
            <div style={styles.contactAvatar}>AM</div>
            <div style={styles.contactInfo}>
              <div style={styles.contactName}>Alex McMillin</div>
              <div style={styles.contactRole}>Race Officer & Event Organizer</div>
              <a href="mailto:alex@mcmillin.ca" style={styles.contactEmail}>alex@mcmillin.ca</a>
            </div>
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <span>⛵ Oakville Club Open Regatta 2025</span>
          <span>Powered by <a href="https://sailscore.vercel.app" style={styles.footerLink}>SailScore</a></span>
        </div>
      </footer>

      <style>{animations}</style>
    </div>
  );
}

function SectionHeader({ emoji, title, color }) {
  return (
    <div style={styles.sectionHeader}>
      <span style={{ ...styles.sectionEmoji, background: color }}>{emoji}</span>
      <h2 style={styles.sectionTitle}>{title}</h2>
      <div style={{ ...styles.sectionLine, background: color }} />
    </div>
  );
}

const photoColors = ["#FFE5D9", "#D9F0FF", "#E8FFE5", "#FFF5D9", "#F5D9FF", "#D9FFEF"];

const sponsorStyles = {
  platinum: { background: "linear-gradient(135deg, #fff8e1, #fffde7)", border: "2px solid #FFD700" },
  gold: { background: "linear-gradient(135deg, #fff3e0, #fff8e1)", border: "2px solid #FFA726" },
  silver: { background: "#f8f9fa", border: "1px solid #dee2e6" },
};

const animations = `
  @import url('https://fonts.googleapis.com/css2?family=Pacifico&family=Nunito:wght@400;600;700;800&display=swap');

  @keyframes waveAnim {
    0% { transform: translateX(-100%) scaleY(1); }
    50% { transform: translateX(0%) scaleY(1.1); }
    100% { transform: translateX(100%) scaleY(1); }
  }
  @keyframes boatFloat {
    0%, 100% { transform: translateY(0px) rotate(-3deg); }
    50% { transform: translateY(-15px) rotate(3deg); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Nunito', sans-serif; }
`;

const styles = {
  page: { fontFamily: "'Nunito', sans-serif", background: "#f0f7ff", minHeight: "100vh", color: "#1a1a2e" },

  nav: { position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", borderBottom: "3px solid #FF6B35", padding: "0.75rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" },
  navBrand: { fontFamily: "'Pacifico', cursive", fontSize: "1.3rem", color: "#FF6B35" },
  navLinks: { display: "flex", gap: "0.25rem", flexWrap: "wrap" },
  navLink: { background: "none", border: "none", padding: "0.35rem 0.75rem", borderRadius: "20px", cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontSize: "0.85rem", fontWeight: 700, color: "#444", transition: "all 0.2s" },

  hero: { position: "relative", background: "linear-gradient(135deg, #0077b6 0%, #00b4d8 50%, #48cae4 100%)", minHeight: "480px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: "4rem 2rem 6rem" },
  heroWaves: { position: "absolute", bottom: 0, left: 0, right: 0, height: "120px" },
  wave: { position: "absolute", bottom: 0, left: "-100%", right: "-100%", height: "60px", background: "#f0f7ff", borderRadius: "50% 50% 0 0 / 30px 30px 0 0", animation: "waveAnim 6s ease-in-out infinite" },
  heroContent: { position: "relative", zIndex: 2, textAlign: "center", color: "white" },
  heroBadge: { display: "inline-block", background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "20px", padding: "0.3rem 1rem", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.1em", marginBottom: "1rem" },
  heroTitle: { fontFamily: "'Pacifico', cursive", lineHeight: 1.1, marginBottom: "1rem", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))" },
  heroTitleLine1: { display: "block", fontSize: "clamp(2rem, 6vw, 3.5rem)", color: "#fff" },
  heroTitleLine2: { display: "block", fontSize: "clamp(2.5rem, 8vw, 5rem)", color: "#FFD166" },
  heroDate: { fontSize: "1.1rem", fontWeight: 700, marginBottom: "2rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" },
  heroDateIcon: { fontSize: "1.3rem" },
  heroCtas: { display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" },
  ctaPrimary: { background: "#FF6B35", color: "white", padding: "0.85rem 2rem", borderRadius: "50px", fontWeight: 800, fontSize: "1rem", textDecoration: "none", boxShadow: "0 4px 15px rgba(255,107,53,0.4)", transition: "transform 0.2s" },
  ctaSecondary: { background: "rgba(255,255,255,0.15)", color: "white", border: "2px solid white", padding: "0.85rem 2rem", borderRadius: "50px", fontWeight: 800, fontSize: "1rem", cursor: "pointer", fontFamily: "'Nunito', sans-serif" },
  heroBoat: { position: "absolute", right: "5%", bottom: "20%", fontSize: "5rem", animation: "boatFloat 4s ease-in-out infinite", zIndex: 2 },

  updatesBar: { background: "#1a1a2e", color: "white", padding: "1rem 2rem", display: "flex", alignItems: "flex-start", gap: "1.5rem", flexWrap: "wrap" },
  updatesLabel: { background: "#FF6B35", color: "white", padding: "0.25rem 0.75rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.05em", whiteSpace: "nowrap", marginTop: "0.1rem" },
  updatesList: { display: "flex", flexDirection: "column", gap: "0.4rem", flex: 1 },
  updateItem: { display: "flex", gap: "0.75rem", fontSize: "0.875rem" },
  updateDate: { color: "#FFD166", fontWeight: 700, whiteSpace: "nowrap" },
  updateText: { color: "#cdd5e0" },

  container: { maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem" },
  section: { padding: "4rem 0" },
  sectionHeader: { display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" },
  sectionEmoji: { width: "44px", height: "44px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 },
  sectionTitle: { fontFamily: "'Pacifico', cursive", fontSize: "1.8rem", color: "#1a1a2e" },
  sectionLine: { flex: 1, height: "3px", borderRadius: "2px" },

  scheduleGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "1rem" },
  scheduleItem: { background: "white", borderRadius: "16px", padding: "1.25rem 1rem", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #e8f4fd", animation: "fadeUp 0.5s ease forwards" },
  scheduleIcon: { fontSize: "1.75rem", marginBottom: "0.5rem" },
  scheduleTime: { fontSize: "0.8rem", fontWeight: 800, color: "#FF6B35", marginBottom: "0.25rem" },
  scheduleEvent: { fontSize: "0.85rem", fontWeight: 700, color: "#1a1a2e", lineHeight: 1.3 },

  registerCard: { background: "white", borderRadius: "20px", padding: "2.5rem", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", display: "grid", gridTemplateColumns: "1fr auto", gap: "3rem", alignItems: "start" },
  registerLeft: {},
  registerTitle: { fontFamily: "'Pacifico', cursive", fontSize: "1.5rem", color: "#1a1a2e", marginBottom: "0.75rem" },
  registerText: { color: "#555", lineHeight: 1.7, marginBottom: "1rem" },
  registerList: { listStyle: "none", display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1.5rem", color: "#333", fontSize: "0.9rem" },
  registerBtn: { display: "inline-block", background: "#06D6A0", color: "white", padding: "0.85rem 2rem", borderRadius: "50px", fontWeight: 800, fontSize: "1rem", textDecoration: "none", boxShadow: "0 4px 15px rgba(6,214,160,0.3)" },
  registerRight: {},
  registerFees: { background: "#f8fffe", border: "2px solid #06D6A0", borderRadius: "16px", padding: "1.5rem", minWidth: "220px" },
  feesTitle: { fontWeight: 800, fontSize: "1rem", color: "#1a1a2e", marginBottom: "1rem", textAlign: "center" },
  feeRow: { display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #e0faf4", fontSize: "0.875rem" },
  feeAmount: { fontWeight: 800, color: "#06D6A0" },
  feesNote: { fontSize: "0.75rem", color: "#999", marginTop: "0.75rem", textAlign: "center" },

  resultsCard: { background: "linear-gradient(135deg, #1a1a2e, #16213e)", borderRadius: "20px", padding: "3rem", textAlign: "center", color: "white" },
  resultsEmoji: { fontSize: "3rem", marginBottom: "1rem" },
  resultsTitle: { fontFamily: "'Pacifico', cursive", fontSize: "1.75rem", marginBottom: "0.75rem", color: "#FFD166" },
  resultsText: { color: "#aab4c4", maxWidth: "500px", margin: "0 auto 1.5rem", lineHeight: 1.7 },
  resultsBtn: { display: "inline-block", background: "#FFD166", color: "#1a1a2e", padding: "0.85rem 2rem", borderRadius: "50px", fontWeight: 800, fontSize: "1rem", textDecoration: "none" },

  photosGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1rem" },
  photoCard: { borderRadius: "16px", padding: "2rem 1rem", textAlign: "center", position: "relative", overflow: "hidden", cursor: "pointer", aspectRatio: "4/3", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
  photoEmoji: { fontSize: "3rem", marginBottom: "0.5rem" },
  photoCaption: { fontWeight: 700, fontSize: "0.875rem", color: "#333" },
  photoOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.5)", color: "white", padding: "0.4rem", fontSize: "0.7rem", fontWeight: 600 },
  photosNote: { color: "#888", fontSize: "0.875rem", textAlign: "center" },

  sponsorsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" },
  sponsorCard: { borderRadius: "12px", padding: "1.25rem", textAlign: "center" },
  sponsorTier: { fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.1em", color: "#999", marginBottom: "0.5rem" },
  sponsorName: { fontWeight: 700, fontSize: "0.9rem", color: "#1a1a2e" },
  sponsorCta: { textAlign: "center", color: "#666", fontSize: "0.9rem" },
  sponsorLink: { color: "#118AB2", fontWeight: 700 },

  locationCard: { background: "white", borderRadius: "20px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", display: "grid", gridTemplateColumns: "1fr 1fr" },
  locationMap: { background: "linear-gradient(135deg, #48cae4, #0077b6)", minHeight: "250px", display: "flex", alignItems: "center", justifyContent: "center" },
  locationMapPlaceholder: { textAlign: "center", color: "white", fontWeight: 700 },
  locationPin: { display: "block", fontSize: "3rem", marginBottom: "0.5rem" },
  locationInfo: { padding: "2rem" },
  locationTitle: { fontFamily: "'Pacifico', cursive", fontSize: "1.3rem", marginBottom: "0.75rem", color: "#1a1a2e" },
  locationText: { color: "#555", lineHeight: 1.7, marginBottom: "1rem", fontSize: "0.9rem" },
  locationDetails: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  locationDetail: { display: "flex", gap: "0.5rem", alignItems: "center", fontSize: "0.875rem", color: "#444" },

  contactCard: { background: "white", borderRadius: "20px", padding: "2rem", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", display: "flex", alignItems: "center", gap: "1.5rem", maxWidth: "400px" },
  contactAvatar: { width: "64px", height: "64px", borderRadius: "50%", background: "linear-gradient(135deg, #06D6A0, #0077b6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "1.25rem", flexShrink: 0 },
  contactInfo: { display: "flex", flexDirection: "column", gap: "0.25rem" },
  contactName: { fontWeight: 800, fontSize: "1.1rem", color: "#1a1a2e" },
  contactRole: { color: "#888", fontSize: "0.85rem" },
  contactEmail: { color: "#06D6A0", fontWeight: 700, textDecoration: "none", fontSize: "0.9rem" },

  footer: { background: "#1a1a2e", color: "#aab4c4", padding: "1.5rem 2rem", marginTop: "2rem" },
  footerContent: { maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.875rem" },
  footerLink: { color: "#06D6A0", textDecoration: "none", fontWeight: 700 },
};
