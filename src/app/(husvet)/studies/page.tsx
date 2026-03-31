import type { Metadata } from "next";
import { studiesPageContent } from "../_content/studies-content";
import { StudiesExperience } from "./studies-experience";

export const metadata: Metadata = {
  title: studiesPageContent.seo.title,
  description: studiesPageContent.seo.description,
};

export default function StudiesPage() {
  return <StudiesExperience content={studiesPageContent} />;
}
