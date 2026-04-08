import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Hero from "@/components/landing/Hero";
import FlowSteps from "@/components/landing/FlowSteps";
import TechShowcase from "@/components/landing/TechShowcase";
import StackBadges from "@/components/landing/StackBadges";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/inbox");

  return (
    <>
      <Hero />
      <FlowSteps />
      <TechShowcase />
      <StackBadges />
    </>
  );
}
