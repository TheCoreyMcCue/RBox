import Image from "next/image";
import Hero from "./components/Hero";

export default async function Home() {
  return (
    <main className="flex flex-col items-center justify-between">
      <Hero />
    </main>
  );
}
