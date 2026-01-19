// Demo courses and modules for Sustainability Hub
window.COURSES = [
  {
    id: "foundations-101",
    title: "Sustainability Foundations",
    summary: "Core concepts across environmental, social, and governance (ESG) pillars.",
    category: "Foundations",
    level: "Beginner",
    estimate: 60,
    modules: [
      {
        id: "intro-esg",
        title: "Intro to ESG",
        duration: 12,
        videoUrl: "assets/video/intro-esg.mp4",
        transcript: "In this module, we define ESG and explain why it matters...",
        resources: [
          { title: "What is ESG?", url: "https://www.un.org/sustainabledevelopment/sustainable-development-goals/" },
          { title: "Materiality basics", url: "https://www.globalreporting.org/" }
        ],
        quiz: true
      },
      {
        id: "stakeholders",
        title: "Stakeholders & Materiality",
        duration: 15,
        videoUrl: "assets/video/stakeholders.mp4",
        transcript: "Identify key stakeholders and assess material topics...",
        resources: [
          { title: "Stakeholder engagement guide", url: "https://www.ifc.org/" }
        ],
        quiz: true
      },
      {
        id: "governance",
        title: "Governance & Assurance",
        duration: 18,
        videoUrl: "assets/video/governance.mp4",
        transcript: "Governance structures, assurance, and accountability...",
        resources: [],
        quiz: true
      }
    ]
  },
  {
    id: "climate-action",
    title: "Climate & Net-Zero Action",
    summary: "Measure emissions, set targets, and drive decarbonisation.",
    category: "Climate",
    level: "Intermediate",
    estimate: 75,
    modules: [
      {
        id: "ghg-basics",
        title: "GHG Accounting (Scopes 1–3)",
        duration: 20,
        videoUrl: "assets/video/ghg-basics.mp4",
        transcript: "Understand the GHG Protocol and inventory boundaries...",
        resources: [
          { title: "GHG Protocol Corporate Standard", url: "https://ghgprotocol.org/corporate-standard" },
          { title: "Science-Based Targets initiative (SBTi)", url: "https://sciencebasedtargets.org/" }
        ],
        quiz: true
      },
      {
        id: "energy-efficiency",
        title: "Energy Efficiency & Renewables",
        duration: 16,
        videoUrl: "assets/video/energy.mp4",
        transcript: "Efficiency measures, PPAs, RECs, and onsite generation...",
        resources: [],
        quiz: true
      },
      {
        id: "supplier-engagement",
        title: "Supply Chain Engagement",
        duration: 17,
        videoUrl: "assets/video/suppliers.mp4",
        transcript: "Engage suppliers for scope 3 reductions and data quality...",
        resources: [],
        quiz: true
      }
    ]
  }
];
