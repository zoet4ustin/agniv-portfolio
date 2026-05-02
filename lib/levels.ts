export type Enemy = {
  id: string;
  label: string;
  solution: string;
  isCurrentBattle?: boolean;
};

export type Platform = { x: number; y: number; width: number };

export type EnemyPlacement = {
  enemyId: string;
  x: number;
  y: number;
  patrolMin: number;
  patrolMax: number;
};

export type Level = {
  slug: string;
  company: string;
  locationName: string;
  theme: string;
  enemies: Enemy[];
  caseStudy: {
    title: string;
    problem: string;
    approach: string;
    outcome: string;
    metrics: string[];
  };
  isCurrentlyPlaying?: boolean;
  playerStart: { x: number; y: number };
  worldWidth: number;
  platforms: Platform[];
  enemyPlacements: EnemyPlacement[];
  flagPosition: { x: number; y: number };
  skyColor: string;
  groundColor: string;
  nextLevelSlug?: string;
};

const GROUND_Y = 400;
const ENEMY_H = 28;
const PLAYER_H = 40;
const onGround = GROUND_Y - ENEMY_H;
const playerOnGround = GROUND_Y - PLAYER_H;

export const levels: Level[] = [
  {
    slug: "flipkart",
    company: "Flipkart",
    locationName: "Flipkart Castle",
    theme: "#1F3A5F",
    skyColor: "#87CEEB",
    groundColor: "#5fb850",
    playerStart: { x: 80, y: playerOnGround },
    worldWidth: 2400,
    platforms: [
      { x: 600, y: 300, width: 200 },
      { x: 1200, y: 240, width: 200 },
    ],
    flagPosition: { x: 2300, y: GROUND_Y },
    nextLevelSlug: "jupiter",
    enemies: [
      {
        id: "fake-reviews",
        label: "Fake reviews",
        solution: "Built rule engine flagging reviewer-velocity anomalies",
      },
      {
        id: "counterfeit-sellers",
        label: "Counterfeit sellers",
        solution: "Seller risk-scoring workflow improved authenticity detection by 15%",
      },
      {
        id: "payment-fraud",
        label: "Payment fraud patterns",
        solution: "ML risk model + third-party intelligence APIs cut fraud incidents materially",
      },
    ],
    enemyPlacements: [
      {
        enemyId: "fake-reviews",
        x: 400,
        y: onGround,
        patrolMin: 400,
        patrolMax: 500 - ENEMY_H,
      },
      {
        enemyId: "counterfeit-sellers",
        x: 620,
        y: 300 - ENEMY_H,
        patrolMin: 600,
        patrolMax: 800 - ENEMY_H,
      },
      {
        enemyId: "payment-fraud",
        x: 1500,
        y: onGround,
        patrolMin: 1500,
        patrolMax: 1700 - ENEMY_H,
      },
    ],
    caseStudy: {
      title: "Fraud & Risk Management at Flipkart",
      problem:
        "India's largest e-commerce platform faced fraud across reviews, sellers, and payments. Trust was the platform's moat — every fraud incident chipped at it.",
      approach:
        "Owned the FRM product roadmap. Combined a rule engine for velocity-based anomalies, ML-based risk scoring for transaction patterns, and third-party intelligence APIs for cross-platform signal.",
      outcome:
        "Materially reduced fraud incidents on the platform, improved seller authenticity detection by ~15%, supported regulatory compliance.",
      metrics: [
        "+15% authenticity detection",
        "Millions of transactions protected daily",
        "0 critical fraud escalations during tenure",
      ],
    },
  },
  {
    slug: "jupiter",
    company: "Jupiter Money",
    locationName: "Jupiter Money Tower",
    theme: "#4F46E5",
    skyColor: "#2D1B69",
    groundColor: "#1E1B4B",
    playerStart: { x: 80, y: 360 },
    worldWidth: 2400,
    platforms: [
      { x: 500, y: 320, width: 180 },
      { x: 900, y: 260, width: 160 },
      { x: 1400, y: 300, width: 200 },
    ],
    flagPosition: { x: 2300, y: GROUND_Y },
    nextLevelSlug: "rozana",
    enemies: [
      {
        id: "long-onboarding",
        label: "25-min onboarding",
        solution: "Re-sequenced flow, integrated PAN/Aadhaar/bureau APIs",
      },
      {
        id: "conversion-ceiling",
        label: "5% conversion ceiling",
        solution: "Funnel A/B tests, micro-friction removal",
      },
      {
        id: "rbi-compliance",
        label: "RBI compliance gaps",
        solution: "Embedded KYC/AML rules in transaction path",
      },
    ],
    enemyPlacements: [
      {
        enemyId: "long-onboarding",
        x: 300,
        y: onGround,
        patrolMin: 300,
        patrolMax: 450 - ENEMY_H,
      },
      {
        enemyId: "conversion-ceiling",
        x: 920,
        y: 260 - ENEMY_H,
        patrolMin: 920,
        patrolMax: 1040 - ENEMY_H,
      },
      {
        enemyId: "rbi-compliance",
        x: 1700,
        y: onGround,
        patrolMin: 1700,
        patrolMax: 1900 - ENEMY_H,
      },
    ],
    caseStudy: {
      title: "Onboarding Rebuild at Jupiter Money",
      problem:
        "Onboarding took 25 minutes and converted at 5%. Users were dropping off at every form field. New active users were stalling YoY.",
      approach:
        "Rebuilt the flow end-to-end. Re-sequenced steps to surface value earlier. Integrated PAN, Aadhaar, and bureau APIs to remove manual entry. Embedded RBI KYC/AML rules into the transaction path instead of bolting them on top.",
      outcome:
        "Onboarding under 10 minutes. Conversion 5% to 9%. 3x active users YoY.",
      metrics: [
        "25 min to <10 min",
        "5% to 9% conversion",
        "3x active users YoY",
        "0 regulatory escalations",
      ],
    },
  },
  {
    slug: "rozana",
    company: "Rozana",
    locationName: "Rozana Village",
    theme: "#16A34A",
    skyColor: "#FED7AA",
    groundColor: "#15803D",
    playerStart: { x: 80, y: 360 },
    worldWidth: 2400,
    platforms: [
      { x: 400, y: 310, width: 200 },
      { x: 800, y: 270, width: 180 },
      { x: 1300, y: 320, width: 220 },
    ],
    flagPosition: { x: 2300, y: GROUND_Y },
    nextLevelSlug: "cars24",
    enemies: [
      {
        id: "catalog-dropoffs",
        label: "Catalog drop-offs",
        solution: "Contextual recommendation engine (seasonality, region, connectivity-aware)",
      },
      {
        id: "indian-language-search",
        label: "Indian-language search miss",
        solution: "Semantic search + RAG retrieval tuned to local queries",
      },
      {
        id: "support-overload",
        label: "Support overload",
        solution: "AI helpdesk with semantic chunking, 28% resolution time cut",
      },
    ],
    enemyPlacements: [
      {
        enemyId: "catalog-dropoffs",
        x: 420,
        y: 310 - ENEMY_H,
        patrolMin: 400,
        patrolMax: 600 - ENEMY_H,
      },
      {
        enemyId: "indian-language-search",
        x: 820,
        y: 270 - ENEMY_H,
        patrolMin: 800,
        patrolMax: 980 - ENEMY_H,
      },
      {
        enemyId: "support-overload",
        x: 1620,
        y: onGround,
        patrolMin: 1600,
        patrolMax: 1850 - ENEMY_H,
      },
    ],
    caseStudy: {
      title: "₹300 Cr+ Rural Commerce P&L at Rozana",
      problem:
        "Rural commerce platform with low-literacy, low-bandwidth users. Search was miss-prone in Indian languages. Catalog drop-offs were high. Support couldn't keep up.",
      approach:
        "Owned the platform-wide product vision and a 10+ PM org. Rebuilt discovery with semantic search and RAG retrieval tuned to Indian-language queries. Shipped contextual recommendations (seasonality, region, connectivity-aware). Deployed an AI helpdesk with semantic chunking.",
      outcome:
        "30% YoY growth on the portfolio. CTR +18%. ~35% of support queries resolved instantly. Inventory accuracy +40%. 95%+ fill rates in remote villages.",
      metrics: [
        "30% YoY growth",
        "CTR +18%",
        "35% queries auto-resolved",
        "Inventory accuracy +40%",
      ],
    },
  },
  {
    slug: "cars24",
    company: "Cars24",
    locationName: "Cars24 City",
    theme: "#DC2626",
    skyColor: "#7C2D12",
    groundColor: "#1F2937",
    isCurrentlyPlaying: true,
    playerStart: { x: 80, y: 360 },
    worldWidth: 2800,
    platforms: [
      { x: 400, y: 320, width: 180 },
      { x: 800, y: 260, width: 160 },
      { x: 1300, y: 290, width: 200 },
      { x: 1800, y: 240, width: 180 },
    ],
    flagPosition: { x: 2700, y: GROUND_Y },
    enemies: [
      {
        id: "created-to-pay",
        label: "20% Created-to-Pay funnel",
        solution: "Dynamic bottom sheet + personalization + Lead Mgmt module to 35%",
      },
      {
        id: "vendor-crm-cost",
        label: "Vendor CRM costs",
        solution: "AI-built in-house CRM, 2-person hackathon team",
      },
      {
        id: "cold-cohorts",
        label: "Cold marketing cohorts",
        solution: "Behavioral lead scoring, +25% U2L",
      },
      {
        id: "dau-mau-stickiness",
        label: "DAU/MAU stickiness",
        solution: "Currently fighting — DAU/MAU climbing in real-time",
        isCurrentBattle: true,
      },
    ],
    enemyPlacements: [
      {
        enemyId: "created-to-pay",
        x: 420,
        y: 320 - ENEMY_H,
        patrolMin: 400,
        patrolMax: 580 - ENEMY_H,
      },
      {
        enemyId: "vendor-crm-cost",
        x: 920,
        y: onGround,
        patrolMin: 900,
        patrolMax: 1100 - ENEMY_H,
      },
      {
        enemyId: "cold-cohorts",
        x: 1320,
        y: 290 - ENEMY_H,
        patrolMin: 1300,
        patrolMax: 1500 - ENEMY_H,
      },
      {
        // Placed on the ground between Platform 4 and the flag so the player
        // must clear it to win. Patrol range leaves enough clear approach
        // (~250px from Platform 4 end at x=1980) and landing room before the
        // flag at x=2700, but it's narrow enough that the bounce/jump timing
        // matters.
        enemyId: "dau-mau-stickiness",
        x: 2300,
        y: onGround,
        patrolMin: 2250,
        patrolMax: 2450 - ENEMY_H,
      },
    ],
    caseStudy: {
      title: "Platform-Led U2L & Stickiness at Cars24",
      problem:
        "43M-MAU automotive platform across CarInfo, VehicleInfo, and Cars24. Most users come for RC search and leave. DAU/MAU at 7%. Created-to-Pay conversion at 20%. CEO wants U2L and stickiness fixed.",
      approach:
        "Lead a 4-PM team reporting to CEO. Shipped Garage (new revenue surface), behavioral lead scoring + prediction layer powering Marketing cohorts, dynamic personalization screens, and a BFF + CMS config layer so non-engineers can ship UI changes.",
      outcome:
        "Created-to-Pay funnel 20% to 35% in one quarter. Garage at ₹5 Cr/month run-rate within 2 months. +25% U2L from lead scoring. Service History gross sales +25%, net profit +20%.",
      metrics: [
        "Funnel 20% to 35%",
        "Garage ₹5 Cr/month",
        "+25% U2L",
        "+25% Service History gross",
      ],
    },
  },
];

export function getLevel(slug: string): Level | undefined {
  return levels.find((l) => l.slug === slug);
}
