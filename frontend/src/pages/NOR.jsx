import ocBurgee from "../assets/sponsor-oc.png";

const sections = [
  {
    num: 1, title: "RULES",
    items: [
      "The Oakville Club Open Regatta will be governed by the rules as defined in The Racing Rules of Sailing (RRS).",
      "The PHRF-LO class rules shall apply to all boats racing under PHRF.",
      "In case of differences between this Notice of Race and the Sailing Instructions, the Sailing Instructions will take precedence.",
    ]
  },
  {
    num: 2, title: "ELIGIBILITY AND ENTRY",
    items: [
      "The Regatta is open to any boat that complies with the following:",
    ],
    bullets: [
      "Is a member in good standing of a Club affiliated with Sail Canada",
      "Must have a current valid PHRF-LO certificate (racing divisions)",
      "19 years of age or older (other considerations may be given at the discretion of the Organizing Authority)",
      "Have a skipper 19 years of age or older",
      "Must have a minimum of two people on board during racing",
    ],
    moreItems: [
      "The OC Race Committee reserves the right to group similar boats together to form one or more classes.",
      "Eligible boats must register by completing the online entry form on or before Monday August 10, 2026.",
      "It is up to the individual registrants to validate their entry has been received.",
      "Registration WILL be limited to a maximum of 50 boats on a first come, first serve basis. The Organizing Authority has the right to reject any registrants.",
      "The acceptance of a registration received after the specified deadline is at the sole discretion of the Organizing Authority.",
    ]
  },
  {
    num: 3, title: "DIVISIONS AND CLASS SPLITS",
    items: [
      "Divisions for the regatta are as follows:",
    ],
    bullets: [
      "Racing PHRF — Flying Sails",
      "Racing PHRF — Non Flying Sails",
      "Distance Race — White Sail Only",
    ],
    moreItems: [
      "If there are enough boats of the same class (> 4), a one-design, or level fleet may be established.",
      "Class splits will be based on number of boats entered.",
      "Class splits will be available online and on the official notice board located on the east wall of the Riverside Restaurant no later than 19:00hrs on Wednesday August 12.",
    ]
  },
  {
    num: 4, title: "FEES",
    items: [
      "Once again, the Oakville Club Regatta Committee is proud to offer this regatta with no entry fee. A true OPEN regatta, free for all boats wishing to register.",
    ]
  },
  {
    num: 5, title: "SCHEDULE",
    bullets: [
      "18:00–20:00hrs Friday August 14 — Race kit pickup",
      "08:00–09:00hrs Saturday August 15 — Race kit pickup",
      "Time of the first warning signal will be decided and posted by 17:00hrs Friday August 14, based on expected wind conditions for western Lake Ontario",
      "Skippers' Meeting will be 90 minutes before the first warning signal",
      "A maximum of three races — no warning signal after 15:30hrs",
      "A minimum of one race must be completed to constitute a regatta",
      "17:30hrs — Poolside Party",
      "19:00hrs — Awards",
    ]
  },
  {
    num: 6, title: "IDENTIFICATION",
    items: [
      "If required by the Sailing Instructions, division flags will be displayed on the backstay, or other conspicuous position on the stern of the boat, from the warning signal until the boat's finish has been acknowledged by the race committee.",
      "Boats are encouraged to display the official Burgee while participating in a regatta.",
    ]
  },
  {
    num: 7, title: "SAILING INSTRUCTIONS",
    items: [
      "Sailing Instructions will be available online at www.ocregatta.com no later than Monday August 10, 2026. They will also be posted on the Notice Board on the east wall of the Riverside restaurant. Additional changes will be announced by email, posted online and on the Notice Board.",
    ]
  },
  {
    num: 8, title: "VENUE AND COURSES",
    items: [
      "Races will take place on the open waters of western Lake Ontario in the vicinity of the Oakville Club and Sixteen Mile Creek. Details specific to the race courses will be outlined in the Sailing Instructions, distributed to all registrants via email, posted on our regatta website, and on the Notice Board.",
    ]
  },
  {
    num: 9, title: "SCORING",
    items: [
      "The Racing race divisions shall be scored using the PHRF-LO handicapping system using the 'time on time' method of establishing corrected times.",
      "The Distance race will be a pursuit race with individual start times being calculated using the \"time on distance\" method.",
      "Race ties will follow RRS rule A7. Series ties will follow RRS rule A8.",
    ]
  },
  {
    num: 10, title: "PRIZES",
    items: [
      "Prizes will be awarded to the boats placing first, second, and third in each class.",
      "In addition, three perpetual trophies may be awarded:",
    ],
    bullets: [
      "Oldershaw Trophy — awarded to the top overall Oakville Club boat (lowest point score)",
      "Mercedes Cup — awarded to the top overall boat (lowest point score)",
      "Heineken Cup — awarded to the top boat in the distance race",
      "The Commodore's Trophy — TBD",
    ]
  },
  {
    num: 11, title: "BERTHING",
    items: [
      "Priority will be given to boats visiting from clubs outside the Oakville area.",
      "Berthing is available on a first come, first serve basis. To reserve a slip, you must enter the regatta first, then please contact The Oakville Club's Dock Manager at 905-845-0231 extension 221.",
      "Boats shall follow the directions of the Oakville Club Dock Manager. Failure to comply may result in disciplinary action and possible expulsion from the regatta.",
    ]
  },
  {
    num: 12, title: "RADIO COMMUNICATION",
    items: [
      "Each yacht may communicate with any person, competitor, yacht, or outside source of information using any means available throughout the race.",
    ],
    bullets: [
      "Alpha course RC — VHF channel 68",
      "Bravo course RC — VHF channel 72",
      "Distance Race — VHF channel 72",
    ]
  },
  {
    num: 13, title: "DISCLAIMER OF LIABILITY",
    items: [
      "Sailing is an activity that has an inherent risk of damage and injury. Competitors are participating entirely at their own risk. See RRS rule 4, Decision to Race. The race organizers (organizing authority, race committee, protest committee, host club, sponsors, or any other organization or official) will not be responsible for damage to any boat or other property or the injury to any competitor, including death, sustained as a result of participation in this Race. By participating, each competitor agrees to release the race organizers from any and all liability to the fullest extent permitted by law.",
    ]
  },
  {
    num: 14, title: "INSURANCE",
    items: [
      "All participating boats shall be insured with valid, third-party liability insurance with a minimum cover of $2 million CAD.",
    ]
  },
  {
    num: 15, title: "FURTHER INFORMATION",
    items: [
      "For further information visit the Organizing Authority Website: www.ocregatta.com or contact the Race Director at alex@mcmillin.ca",
    ]
  },
];

export default function NOR() {
  return (
    <div style={s.page}>
      {/* Nav */}
      <nav style={s.nav}>
        <span style={s.navBrand}>⛵ OCOR 2026</span>
        <a href="/regatta" style={s.navBack}>← Back to Regatta</a>
      </nav>

      <div style={s.container}>
        {/* Header */}
        <div style={s.header}>
          <img src={ocBurgee} alt="Oakville Club Burgee" style={s.burgee} />
          <h1 style={s.title}>The Oakville Club Open Regatta</h1>
          <div style={s.subtitle}>Saturday August 15, 2026</div>
          <div style={s.subtitle2}>The organizing authority is the Oakville Club Regatta Committee</div>
          <div style={s.docTitle}>Notice of Race</div>
          <div style={s.website}>www.ocregatta.com</div>
        </div>

        {/* Intro */}
        <div style={s.intro}>
          The Commodore, Yachting Committee, and members of The Oakville Club invite you to the annual
          Oakville Club Open Regatta (OC Regatta) hosted by The Oakville Club, on the north shore of
          Lake Ontario, 17 miles southwest of Toronto and 10 miles northeast of Hamilton.
          <div style={{ marginTop: "0.75rem" }}>
            <strong>By Land:</strong> 56 Water Street, Oakville, ON, L6J-2Y3 at the base of William Street.<br />
            <strong>By Water:</strong> 43°26.31'N; 79°39.92'W
          </div>
        </div>

        {/* Sections */}
        {sections.map(sec => (
          <div key={sec.num} style={s.section}>
            <div style={s.sectionHeader}>
              <span style={s.sectionNum}>{sec.num}</span>
              <h2 style={s.sectionTitle}>{sec.title}</h2>
            </div>
            {sec.items?.map((item, i) => (
              <p key={i} style={s.item}><strong>{sec.num}.{i + 1}</strong> {item}</p>
            ))}
            {sec.bullets && (
              <ul style={s.bulletList}>
                {sec.bullets.map((b, i) => (
                  <li key={i} style={s.bulletItem}>{b}</li>
                ))}
              </ul>
            )}
            {sec.moreItems?.map((item, i) => (
              <p key={i} style={s.item}>
                <strong>{sec.num}.{(sec.items?.length || 0) + i + 1}</strong> {item}
              </p>
            ))}
          </div>
        ))}

        {/* Footer */}
        <div style={s.footer}>
          <a href="/regatta" style={s.footerBtn}>← Back to Regatta</a>
          <a href={`/register?series=3`} style={s.footerBtnPrimary}>Register Now →</a>
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
  container: { maxWidth: "860px", margin: "0 auto", padding: "2rem 1.5rem" },
  header: { background: "white", borderRadius: "16px", padding: "2.5rem", textAlign: "center", marginBottom: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", borderTop: "5px solid #1a365d" },
  burgee: { height: "80px", marginBottom: "1rem" },
  title: { fontFamily: "'Anton', sans-serif", fontSize: "1.8rem", color: "#1a365d", letterSpacing: "0.03em", textTransform: "uppercase", margin: "0 0 0.5rem" },
  subtitle: { fontSize: "1.1rem", fontWeight: 700, color: "#2d3748", marginBottom: "0.25rem" },
  subtitle2: { fontSize: "0.9rem", color: "#718096", marginBottom: "0.75rem" },
  docTitle: { fontFamily: "'Anton', sans-serif", fontSize: "1.4rem", color: "#FF6B35", letterSpacing: "0.05em", textTransform: "uppercase", margin: "0.5rem 0 0.25rem" },
  website: { fontSize: "0.875rem", color: "#2b6cb0", fontWeight: 600 },
  intro: { background: "white", borderRadius: "12px", padding: "1.5rem 2rem", marginBottom: "1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", fontSize: "0.95rem", lineHeight: 1.7, color: "#2d3748" },
  section: { background: "white", borderRadius: "12px", padding: "1.5rem 2rem", marginBottom: "0.75rem", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" },
  sectionHeader: { display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "2px solid #e2e8f0" },
  sectionNum: { background: "#1a365d", color: "white", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.9rem", flexShrink: 0 },
  sectionTitle: { fontFamily: "'Anton', sans-serif", fontSize: "1.1rem", color: "#1a365d", letterSpacing: "0.05em", textTransform: "uppercase", margin: 0 },
  item: { fontSize: "0.9rem", lineHeight: 1.7, color: "#2d3748", marginBottom: "0.5rem" },
  bulletList: { paddingLeft: "1.5rem", margin: "0.5rem 0" },
  bulletItem: { fontSize: "0.9rem", lineHeight: 1.7, color: "#2d3748", marginBottom: "0.25rem" },
  footer: { display: "flex", gap: "1rem", justifyContent: "center", marginTop: "2rem", paddingBottom: "2rem" },
  footerBtn: { padding: "0.75rem 1.5rem", borderRadius: "50px", border: "2px solid #cbd5e0", color: "#4a5568", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" },
  footerBtnPrimary: { padding: "0.75rem 1.5rem", borderRadius: "50px", background: "#FF6B35", color: "white", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" },
};
