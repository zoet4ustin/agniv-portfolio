export type Cluster = "craft" | "depth" | "leadership";

export type SkillProofPoint = {
  description: string;
  outcome: string;
  companySlug: "flipkart" | "jupiter" | "rozana" | "cars24";
};

export type Skill = {
  id: string;
  name: string;
  cluster: Cluster;
  blurb: string;
  proofPoints: SkillProofPoint[];
};

export const CLUSTERS: Record<Cluster, { label: string; color: string }> = {
  craft: { label: "Product Craft", color: "#A78BFA" },
  depth: { label: "Technical & AI Depth", color: "#22D3EE" },
  leadership: { label: "Leadership & Influence", color: "#FB923C" },
};

export const SKILLS: Skill[] = [
  // ── CLUSTER 1: PRODUCT CRAFT ──
  {
    id: "product-strategy",
    name: "Product Strategy & Roadmap",
    cluster: "craft",
    blurb:
      "I shape the multi-year product vision and translate it into quarterly roadmaps that survive contact with reality. Operates close to the metric, not the deck.",
    proofPoints: [
      {
        description: "Owned ₹300 Cr+ rural commerce P&L; set multi-year vision",
        outcome: "30% YoY growth on the portfolio",
        companySlug: "rozana",
      },
      {
        description: "Cars24 platform vision across CarInfo, VehicleInfo, Cars24",
        outcome: "Owns U2L and DAU/MAU mandate from CEO",
        companySlug: "cars24",
      },
    ],
  },
  {
    id: "funnel-conversion",
    name: "Funnel & Conversion Optimization",
    cluster: "craft",
    blurb:
      "I instrument funnels obsessively, identify the drop-off, and ship targeted experiments. The wins compound across the product surface.",
    proofPoints: [
      {
        description: "Onboarding rebuild at Jupiter Money",
        outcome: "25 min to <10 min, 5% to 9% conversion",
        companySlug: "jupiter",
      },
      {
        description:
          "Created-to-Pay funnel at Cars24 (dynamic bottom sheet, personalization, lead mgmt)",
        outcome: "20% to 35% in one quarter",
        companySlug: "cars24",
      },
    ],
  },
  {
    id: "zero-to-one",
    name: "0-to-1 Product Shipping",
    cluster: "craft",
    blurb:
      "Comfortable in ambiguity. I have shipped multiple products from zero — sometimes with 2-person teams in a hackathon, sometimes as multi-quarter platform plays.",
    proofPoints: [
      {
        description: "Garage launched at Cars24 — new revenue surface",
        outcome: "~₹5 Cr/month gross sales run-rate in 2 months",
        companySlug: "cars24",
      },
      {
        description: "Multi-benefit credit card launched at Jupiter Money",
        outcome: "3x YoY growth in active card usage",
        companySlug: "jupiter",
      },
      {
        description: "In-house AI CRM at Cars24 in 2-person hackathon",
        outcome: "Replaced third-party SaaS vendor",
        companySlug: "cars24",
      },
    ],
  },
  {
    id: "discovery-insight",
    name: "Discovery & Customer Insight",
    cluster: "craft",
    blurb:
      "I do the unglamorous work of talking to users, watching session recordings, and reading support tickets. Especially in markets the team has never seen.",
    proofPoints: [
      {
        description: "Research with India + Europe consumers at Urbanic",
        outcome: "+30% installs over launch period",
        companySlug: "flipkart",
      },
      {
        description:
          "Discovery rebuild at Rozana for low-literacy, low-bandwidth users",
        outcome: "CTR +18%, dramatic drop in catalog abandonment",
        companySlug: "rozana",
      },
    ],
  },

  // ── CLUSTER 2: TECHNICAL & AI DEPTH ──
  {
    id: "ai-ml-product",
    name: "AI/ML Product",
    cluster: "depth",
    blurb:
      "I build directly with AI tooling, not just ship features that wrap existing models. RAG, behavioral scoring, predictive cohorts, agentic internal tools.",
    proofPoints: [
      {
        description: "Behavioral lead scoring layer at Cars24",
        outcome: "User-to-Lead conversion +25%",
        companySlug: "cars24",
      },
      {
        description: "RAG-based discovery for Indian-language queries at Rozana",
        outcome: "CTR +18%",
        companySlug: "rozana",
      },
      {
        description:
          "AI helpdesk with semantic chunking + contextual retrieval at Rozana",
        outcome: "~35% queries auto-resolved, -28% resolution time",
        companySlug: "rozana",
      },
    ],
  },
  {
    id: "consumer-fintech",
    name: "Consumer Fintech",
    cluster: "depth",
    blurb:
      "Cards, credit, payments, KYC, and the regulatory dance around all of them. I have shipped against RBI guidelines and integrated with NPCI, Visa, and Mastercard.",
    proofPoints: [
      {
        description: "Owned credit & payments stack at Jupiter Money",
        outcome: "+8% authorization success, 0 regulatory escalations",
        companySlug: "jupiter",
      },
      {
        description:
          "Embedded RBI KYC/AML rules across the transaction path",
        outcome: "Survived multiple audit cycles while scaling volume",
        companySlug: "jupiter",
      },
      {
        description:
          "Killed a near-shipped feature 48 hours before launch on RBI compliance grounds",
        outcome: "Now part of every fintech feature scoping checklist",
        companySlug: "jupiter",
      },
    ],
  },
  {
    id: "platform-thinking",
    name: "Platform Thinking",
    cluster: "depth",
    blurb:
      "I think in BFF layers, CMS configs, and reusable components. The right platform investment turns a one-off feature into a system that ships faster forever.",
    proofPoints: [
      {
        description:
          "Migrated Cars24 consumer surfaces behind a BFF + CMS config layer",
        outcome:
          "Non-engineers ship UI changes; experiment cycle weeks to hours",
        companySlug: "cars24",
      },
      {
        description:
          "Architected payments stack with NPCI, Visa, Mastercard at Jupiter",
        outcome: "High-reliability, ISO 8583 dual/single-message routing",
        companySlug: "jupiter",
      },
    ],
  },
  {
    id: "data-driven",
    name: "Data-Driven Decision Making",
    cluster: "depth",
    blurb:
      "SQL, A/B testing, cohort analysis. I run the numbers myself before bringing them to the team — saves cycles, sharpens conviction.",
    proofPoints: [
      {
        description: "Hub-level demand forecasting model at Rozana",
        outcome:
          "Inventory accuracy +40%, fill rates 95%+ in remote villages",
        companySlug: "rozana",
      },
      {
        description:
          "User prediction layer (next-action, churn, intent) at Cars24",
        outcome: "~20% lift in average sessions per user",
        companySlug: "cars24",
      },
    ],
  },

  // ── CLUSTER 3: LEADERSHIP & INFLUENCE ──
  {
    id: "pm-hiring-mentoring",
    name: "PM Hiring & Mentoring",
    cluster: "leadership",
    blurb:
      "I have hired, leveled, and grown PMs. Currently 4 direct reports at Cars24. Previously a 10+ PM org at Rozana with OKR rituals I designed.",
    proofPoints: [
      {
        description: "Built and ran a 10+ PM org at Rozana",
        outcome:
          "Institutionalized OKRs, mentored 3 PMs to senior+ levels",
        companySlug: "rozana",
      },
      {
        description: "Currently leading 4 PMs at Cars24",
        outcome: "Hybrid IC + manager covering 3-tenant platform",
        companySlug: "cars24",
      },
    ],
  },
  {
    id: "cross-functional",
    name: "Cross-Functional Leadership",
    cluster: "leadership",
    blurb:
      "I rally engineering, design, data, and marketing around a shared bet. The hardest part is keeping them aligned when the bet has to change mid-quarter.",
    proofPoints: [
      {
        description:
          "Aligned eng + data + growth on Cars24 funnel rebuild in one quarter",
        outcome: "Funnel 20% to 35% with three coordinated bets",
        companySlug: "cars24",
      },
      {
        description:
          "Coordinated NPCI, Visa, Mastercard integrations with eng + risk teams at Jupiter",
        outcome: "+8% authorization success at scale",
        companySlug: "jupiter",
      },
    ],
  },
  {
    id: "executive-stakeholder",
    name: "Executive Stakeholder Management",
    cluster: "leadership",
    blurb:
      "I report directly to CEOs and have presented to boards. Earned the room by being concise, clear about tradeoffs, and unafraid to deliver bad news.",
    proofPoints: [
      {
        description:
          "Reporting to CEO at Cars24 on platform U2L & DAU/MAU mandate",
        outcome: "CEO-level alignment on quarterly platform bets",
        companySlug: "cars24",
      },
      {
        description: "Board-level updates at Rozana on ₹300 Cr+ portfolio",
        outcome:
          "Maintained leadership confidence through 30% YoY growth quarters",
        companySlug: "rozana",
      },
    ],
  },
  {
    id: "crisis-decisions",
    name: "Crisis Decision-Making",
    cluster: "leadership",
    blurb:
      "When something must be killed, paused, or rebuilt under time pressure, I make the call. Calmly, with the data, and with the team in the room.",
    proofPoints: [
      {
        description:
          "Killed a near-shipped feature 48 hours before launch at Jupiter (RBI compliance conflict)",
        outcome: "Avoided regulatory escalation; learning institutionalized",
        companySlug: "jupiter",
      },
      {
        description:
          "Owned fraud incident response at Flipkart across reviews, sellers, payments",
        outcome: "Materially reduced incidents while platform scaled",
        companySlug: "flipkart",
      },
    ],
  },
];
