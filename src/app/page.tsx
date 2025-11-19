import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Hero from "./components/Hero";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // If logged in, redirect immediately to dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  // Otherwise show the landing page
  return (
    <main className="min-h-dvh flex items-center justify-center overflow-hidden p-0 m-0">
      <Hero />
    </main>
  );
}
