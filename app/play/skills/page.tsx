import type { Metadata } from "next";
import SkillsConstellation from "@/components/SkillsConstellation";

export const metadata: Metadata = {
  title: "Skills Tree — Agniv Kashyap",
};

// Static route — Next.js prefers this over the dynamic [level] sibling
// for the literal /play/skills URL.
export default function SkillsPage() {
  return <SkillsConstellation />;
}
