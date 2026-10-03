import type { Metadata } from "next";
import { generateMetadata as showroomGenerateMetadata } from "./showroom/page";
import ShowroomPage from "./showroom/page";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return showroomGenerateMetadata();
}

export default async function HomePage() {
  return <ShowroomPage />;
}
