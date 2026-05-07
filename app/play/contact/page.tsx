import type { Metadata } from "next";
import ContactExhibit from "@/components/ContactExhibit";

export const metadata: Metadata = {
  title: "Get in touch — Agniv Kashyap",
};

// Static route — Next.js prefers this over the dynamic [level] sibling
// for the literal /play/contact URL.
export default function ContactPage() {
  return <ContactExhibit />;
}
