import ocBurgee from "../assets/sponsor-oc.png";
import appendixA from "../assets/appendix-a-course-layout.png";
import appendixB from "../assets/appendix-b-distance-course.jpg";

const sections = [
  {
    num: 1, title: "RULES",
    items: [
      "The regatta will be governed by the rules as defined in The Racing Rules of Sailing except the following:",
      "RRS 44: PENALTY AT THE TIME OF AN INCIDENT — The first two sentences of rule 44.1 are changed to: 'A boat may take a One-Turn Penalty when she may have broken one or more rules of Part 2 or rule 31 in an incident while racing. However, when she may have broken one or more rules of Part 2 while in the zone around a mark other than a starting mark, her penalty shall be a Two-Turns Penalty.'",
      "If there is a conflict between the Notice of Race (NOR) and the Sailing Instructions (SIs), the SIs will take precedence.",
    ]
  },
  {
    num: 2, title: "NOTICES TO COMPETITORS",
    items: [
      "Notices to competitors will be posted at the Oakville Club on the Yachting Board in the hallway beside the River Bar.",
    ]
  },
  {
    num: 3, title: "CHANGES TO SAILING INSTRUCTIONS",
    items: [
      "Any change to the sailing instructions will be posted before 0900 on the 15 August 2026. Except, any change to the schedule of races will be posted by 2100 on the 14 August.",
    ]
  },
  {
    num: 4, title: "SIGNALS MADE ASHORE",
    items: [
      "Signals made ashore will be displayed on the flagpole located on the dock outside clubhouse.",
      "When AP is displayed ashore \u201c1 minute\u201d is replaced with \u201cnot less than 30 minutes\u201d in the race signal AP.",
    ]
  },
  {
    num: 5, title: "SCHEDULE",
    bullets: [
      "0930 hrs — Skipper's meeting",
      "TBD — first warning signal",
      "A maximum of three races, no warning signal being made after 1530hrs",
      "A minimum of one race must be completed to constitute a regatta",
      "1630 hrs — Post racing social poolside",
      "1700 hrs — Dinner / Poolside Party",
      "1800 hrs — Awards",
    ]
  },
  {
    num: 6, title: "DIVISIONS AND STARTING ORDER",
    items: [
      "Alpha Course:",
    ],
    table: {
      headers: ["Class", "PHRF Rating", "Start", "Class Flag"],
      rows: [
        ["Etchells", "1-design", "1", "Class Pennant"],
        ["FS1 & FS2", "FS1 \u2264 120, FS2 > 120", "2", "Pennant #1"],
        ["Level", "Level", "3", "Pennant #3"],
        ["NFS1 & NFS2", "NFS1 < 176, Level \u2265 176", "4", "Pennant #4"],
      ],
    },
    moreItems: [
      "Distance Race (own course) — Distance fleet, all boats.",
    ],
  },
  {
    num: 7, title: "RACING AREAS",
    items: [
      "All course races will take place on the Oakville waterfront in the vicinity of Sixteen Mile Creek.",
      "The Distance Race may extend further than the Oakville waterfront (TBD).",
    ]
  },
  {
    num: 8, title: "THE COURSES",
    items: [
      "The diagram in Appendix A shows the course for all classes, except the Distance Race, and the order in which the marks are to be passed.",
      "The diagram in Appendix B shows the course for the Distance race provided at the skippers meeting. A middle distance (approx. 10NM). Marks are to be passed to port.",
      "The course for the Distance Race will use fixed marks as rounding points and will be published by 19:00hrs Friday August 14th.",
      "RC may move windward mark +/- 10\u00b0 without notice during the race.",
      "Last boat in fleet must finish within 30 minutes of the first boat in their fleet or be marked DNF.",
    ]
  },
  {
    num: 9, title: "MARKS",
    items: [
      "Inflatable marks used for all courses will be yellow tetrahedrons. The start and finish marks will be orange tetrahedrons.",
      "If the offset (Mark 1a) is missing, it should be ignored, and Mark 1 should be rounded normally.",
      "The race committee may, without signal, move a mark to change the direction up to 10 degrees or the length up to 10% of the previous length, provided that no boat is sailing to the mark.",
      "The distance race will use predetermined fixed marks and be a distance of 8–12NM.",
    ]
  },
  {
    num: 10, title: "THE START",
    items: [
      "The starting line will be between a staff displaying an orange flag or shape on the signal boat and the orange tetrahedron as the port-end starting mark.",
      "Boats whose warning signal has not been made shall avoid the starting area during the starting sequence for other races by remaining outside the box bound by the starting line and 100m to leeward of it.",
      "There will be at least 1 minute between starting sequences.",
      "Five minutes after a boat's start has been signaled, she shall keep clear of any boats attempting to start in their proper sequence.",
      "The Distance race will be a pursuit race and have its own start and finish line approximately .5NM south from the Sixteen Mile pier. See Appendix B for location details. The lat/long of the start finish line will be loaded into Skipper Tracker for those to download to your phone app.",
    ],
    link: { text: "sail-race-relay-production.up.railway.app/race/D1", url: "https://sail-race-relay-production.up.railway.app/race/D1" },
  },
  {
    num: 11, title: "RECALLS",
    items: [
      "The Race Committee may attempt to notify boats identified as OCS by announcing their racing numbers, or boat name, on the VHF channel described in Sailing Instruction 19. The following will not be grounds for redress:",
    ],
    bullets: [
      "Failure of a boat to receive the recall broadcast",
      "A boat's position in the sequence of broadcast numbers",
      "Failure of the Race Committee to hail a boat's number",
    ]
  },
  {
    num: 12, title: "CHANGE OF NEXT LEG OF THE COURSE",
    items: [
      "To change the next leg of the course, the race committee will lay a new mark (or move the finishing line) and remove the original mark as soon as practicable. When in a subsequent change a new mark is replaced, it will be replaced by an original mark.",
      "Substitute marks will be orange tetrahedrons.",
      "If the windward marks (mark 1 & 1a) are changed, they will be replaced by a single mark.",
      "Courses will not be shortened to less than two (2) legs.",
    ]
  },
  {
    num: 13, title: "THE FINISH",
    items: [
      "The finishing line for the course racing will be between an orange flag on the signal boat and the course side finishing mark.",
      "The finishing line for the distance race will be the starting line for that race as indicated in \u201cThe Start\u201d section above.",
      "If the race committee is absent when a boat finishes, she should report her finishing time, and her position in relation to nearby boats, to the race committee at the first reasonable opportunity.",
    ]
  },
  {
    num: 14, title: "PENALTY SYSTEM",
    items: [
      "Rule 44.1 is changed to permit a boat that has broken a rule of Part 2 or rule 31 to take a penalty after racing but prior to any protest hearing. Her penalty shall be a scoring penalty as calculated in rule 44.3(c) equal to 50% of the difference between her finishing position and the number of entries in her class, whichever is less. However, if she caused injury or serious damage or gained a significant advantage in the race or series by her breach, her penalty shall be to retire.",
    ]
  },
  {
    num: 15, title: "TIME LIMITS AND TARGET TIMES",
    items: [
      "If no boat of the Distance Race sails the course as required by RRS 28 within 4 hours after the start the race will be abandoned.",
      "Boats in the Racing Divisions failing to finish within 30 minutes after the first boat in that class sails the course and finishes, will be scored the number of participants plus one (1) without a hearing and should proceed to the starting area if another race is scheduled. This changes RRS 35, A4 and A5.",
      "A boat that retires from a race or leaves the racing area between races shall notify the Race Committee as soon as reasonably possible.",
    ]
  },
  {
    num: 16, title: "PROTESTS AND REQUESTS FOR REDRESS",
    items: [
      "Protests shall be written on the protest form provided in your race kit. Completed protest forms shall be submitted to the Jury Secretary within 30 minutes of the docking of the Committee Boat.",
      "The time and location of the protest hearing(s) will be displayed on the Official Notice Board. This posting constitutes the notice required by RRS 63.2 (Time and Place of Hearing).",
      "Hearings will start after the protest time limit has expired and will generally be heard in the order the protest forms were submitted.",
      "A request to reopen a hearing shall be delivered no later than 30 minutes after the party requesting reopening was informed of the decision on that day. This changes RRS 66.",
      "These sailing instructions are not subject to protest by a boat and may have a penalty other than DSQ at the discretion of the Protest Committee: 14, 19 and 27.",
    ]
  },
  {
    num: 17, title: "ARBITRATION",
    items: [
      "For a protest between two boats alleging a breach of a rule of Part 2 or rule 31, an arbitration meeting may be held prior to any protest hearing.",
      "One representative from each boat will meet with the arbitrator. No witnesses will be permitted.",
    ],
    bullets: [
      "The arbitrator will advise on whether one or both boats should take a penalty;",
      "the protest should be withdrawn; or",
      "the protest should go to the protest committee for a hearing.",
    ],
    moreItems: [
      "When a boat accepts a penalty or the arbitrator advises that the protest should be withdrawn, the arbitrator will allow the protest to be withdrawn. This changes rule 63.1.",
      "When a protest is withdrawn, it will not be reopened or made the subject of a request for redress.",
    ]
  },
  {
    num: 18, title: "SCORING",
    items: [
      "The low point scoring system will apply for boats starting and finishing. For boats not starting/finishing, the scoring system is as follows: DNS / DNF / RET / NSC = # of participants + 1 point; OCS / DSQ / DNC = # of participants + 2 points. This changes rule A4.2.",
      "The PHRF-LO time on time will be used to score boats in PHRF divisions.",
      "One race is required to be completed to constitute a regatta.",
      "A boat's score will be the total of her race scores. There are no drops, all scores are counted.",
    ]
  },
  {
    num: 19, title: "RADIO COMMUNICATION",
    items: [
      "Marine VHF Channel 72 Canadian shall be used by the Race Committee for radio communication during the race on Alpha course.",
      "Except in an emergency, a boat shall neither make radio transmissions while racing nor receive radio communications not available to all boats. This restriction also applies to mobile telephones.",
    ]
  },
  {
    num: 20, title: "PRIZES",
    items: [
      "Prizes will be awarded to the boats placing first, second, and third in each class for the regatta.",
      "\u2018The Oakville Club Cup\u2019 is presented to a Racing Division boat having the best overall performance by score. In the event of a tie, the winner will be determined under scoring RRS rule A8.2.",
      "\u2018The Oldershire Cup\u2019 is presented to an Oakville Club member boat having the best overall performance by score. In the event of a tie, the winner will be determined under scoring RRS rule A8.2.",
      "\u2018The Heineken Cup\u2019 is presented to the top Distance Race boat.",
      "Other prizes may be awarded.",
    ]
  },
  {
    num: 21, title: "DISCLAIMER OF LIABILITY",
    items: [
      "Competitors participate in the regatta entirely at their own risk. See rule 4, Decision to Race. The organizing authority and Host Clubs will not accept any liability for material damage or personal injury, or death sustained in conjunction with or prior to, during, or after the regatta.",
    ]
  },
  {
    num: 22, title: "INSURANCE",
    items: [
      "Each participating boat shall be insured with valid third-party liability insurance with a minimum cover of $2,000,000 CAD per incident or the equivalent for Canadian boats, and $300,000 USD per incident or the equivalent for non-Canadian boats.",
    ]
  },
];

const contacts = [
  { role: "Regatta Directors", name: "Alex McMillin and Nancy Massey" },
  { role: "OC Commodore", name: "Valdy Bockler" },
  { role: "Regatta Scorer", name: "Derek Hilson" },
  { role: "Principal Race Officer", name: "Morgan Seele" },
  { role: "OC Dock Manager", name: "Paul Carter — VHF Ch. 68 — 905-845-0231 ext. 221" },
];

export default function SailingInstructions() {
  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <span style={s.navBrand}>⛵ OCOR 2026</span>
        <a href="/regatta" style={s.navBack}>← Back to Regatta</a>
      </nav>

      <div style={s.container}>
        <div style={s.header}>
          <img src={ocBurgee} alt="Oakville Club Burgee" style={s.burgee} />
          <h1 style={s.title}>The Oakville Club Open Regatta</h1>
          <div style={s.subtitle}>Saturday August 15, 2026</div>
          <div style={s.docTitle}>Sailing Instructions</div>
          <div style={s.website}>www.ocregatta.com</div>
        </div>

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
            {sec.table && (
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {sec.table.headers.map((h, i) => <th key={i} style={s.th}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {sec.table.rows.map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f7fafc" }}>
                        {row.map((cell, j) => <td key={j} style={s.td}>{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {sec.moreItems?.map((item, i) => (
              <p key={i} style={s.item}>
                <strong>{sec.num}.{(sec.items?.length || 0) + i + 1}</strong> {item}
              </p>
            ))}
            {sec.link && (
              <p style={s.item}>
                <a href={sec.link.url} target="_blank" rel="noopener noreferrer" style={s.inlineLink}>{sec.link.text}</a>
              </p>
            )}
          </div>
        ))}

        {/* Contacts */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <span style={s.sectionNum}>✉</span>
            <h2 style={s.sectionTitle}>Contacts</h2>
          </div>
          <div style={s.contactsGrid}>
            {contacts.map((c, i) => (
              <div key={i} style={s.contactRow}>
                <div style={s.contactRoleLabel}>{c.role}</div>
                <div style={s.contactNameLabel}>{c.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Berthing */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <span style={s.sectionNum}>⚓</span>
            <h2 style={s.sectionTitle}>Berthing</h2>
          </div>
          <ul style={s.bulletList}>
            <li style={s.bulletItem}>Berthing is available on a first come, first serve basis. To reserve a slip, you must enter the regatta first, then please contact The Oakville Club's Dock Manager at 905-845-0231 extension 221 or via email at <a href="mailto:pcarter@oakvilleclub.com" style={s.inlineLink}>pcarter@oakvilleclub.com</a>.</li>
            <li style={s.bulletItem}>Boats shall follow the directions of the Oakville Club Dock Manager. Failure to comply with the directions of the Dock Manager and/or crew or organizers shall be grounds for disciplinary action and possible expulsion from the regatta.</li>
          </ul>
        </div>

        {/* Appendix A — Course Layout */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <span style={s.sectionNum}>A</span>
            <h2 style={s.sectionTitle}>Appendix A — Course Layout</h2>
          </div>
          <p style={s.item}>
            Windward-leeward course (all classes except Distance Race class).
          </p>
          <img src={appendixA} alt="Appendix A course layout diagram" style={s.diagramImg} />
        </div>

        {/* Appendix B — Distance Race */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <span style={s.sectionNum}>B</span>
            <h2 style={s.sectionTitle}>Appendix B — Distance Race Course</h2>
          </div>
          <p style={s.item}>
            The Distance Race course is 1 time around the OYS fixed markers (approx. 10NM): <strong>Start → Mark 2 West → Mark 3 East → Finish</strong>.
          </p>
          <p style={s.item}>
            Start/Finish line coordinates: 43.25937, -79.39812 and 43.25893, -79.39994.
          </p>
          <img src={appendixB} alt="Appendix B distance race course map" style={s.diagramImg} />
        </div>

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
  container: { maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem" },
  header: { background: "white", borderRadius: "16px", padding: "2.5rem", textAlign: "center", marginBottom: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", borderTop: "5px solid #1a365d" },
  burgee: { height: "80px", marginBottom: "1rem" },
  title: { fontFamily: "'Anton', sans-serif", fontSize: "1.8rem", color: "#1a365d", letterSpacing: "0.03em", textTransform: "uppercase", margin: "0 0 0.5rem" },
  subtitle: { fontSize: "1.1rem", fontWeight: 700, color: "#2d3748", marginBottom: "0.25rem" },
  docTitle: { fontFamily: "'Anton', sans-serif", fontSize: "1.4rem", color: "#FF6B35", letterSpacing: "0.05em", textTransform: "uppercase", margin: "0.5rem 0 0.25rem" },
  website: { fontSize: "0.875rem", color: "#2b6cb0", fontWeight: 600 },
  section: { background: "white", borderRadius: "12px", padding: "1.5rem 2rem", marginBottom: "0.75rem", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" },
  sectionHeader: { display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "2px solid #e2e8f0" },
  sectionNum: { background: "#1a365d", color: "white", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.9rem", flexShrink: 0 },
  sectionTitle: { fontFamily: "'Anton', sans-serif", fontSize: "1.1rem", color: "#1a365d", letterSpacing: "0.05em", textTransform: "uppercase", margin: 0 },
  item: { fontSize: "0.9rem", lineHeight: 1.7, color: "#2d3748", marginBottom: "0.5rem" },
  bulletList: { paddingLeft: "1.5rem", margin: "0.5rem 0" },
  bulletItem: { fontSize: "0.9rem", lineHeight: 1.7, color: "#2d3748", marginBottom: "0.25rem" },
  inlineLink: { color: "#2b6cb0", fontWeight: 700, textDecoration: "none" },
  tableWrap: { overflowX: "auto", margin: "0.75rem 0" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" },
  th: { textAlign: "left", padding: "8px 10px", fontSize: "0.75rem", textTransform: "uppercase", color: "#718096", borderBottom: "2px solid #e2e8f0", background: "#f7fafc" },
  td: { padding: "8px 10px", borderBottom: "1px solid #edf2f7", color: "#2d3748" },
  contactsGrid: { display: "flex", flexDirection: "column", gap: "0.6rem" },
  contactRow: { display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", padding: "0.5rem 0", borderBottom: "1px solid #edf2f7" },
  contactRoleLabel: { fontSize: "0.85rem", color: "#718096", fontWeight: 600 },
  contactNameLabel: { fontSize: "0.9rem", color: "#1a365d", fontWeight: 700 },
  diagramImg: { display: "block", maxWidth: "100%", height: "auto", margin: "1rem auto 0", borderRadius: "8px", border: "1px solid #e2e8f0" },
  footer: { display: "flex", gap: "1rem", justifyContent: "center", marginTop: "2rem", paddingBottom: "2rem" },
  footerBtn: { padding: "0.75rem 1.5rem", borderRadius: "50px", border: "2px solid #cbd5e0", color: "#4a5568", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" },
  footerBtnPrimary: { padding: "0.75rem 1.5rem", borderRadius: "50px", background: "#FF6B35", color: "white", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" },
};
