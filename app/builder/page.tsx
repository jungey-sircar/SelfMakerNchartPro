import type { Metadata } from "next";
import WebsiteBuilderStudio from "../../components/WebsiteBuilderStudio";

export const metadata: Metadata = {
  title: "NChartPro Builder",
  description:
    "Use Nemotron to propose edits, generate sections, and update the NChartPro website from a dedicated builder workspace.",
};

export default function BuilderPage() {
  return <WebsiteBuilderStudio />;
}