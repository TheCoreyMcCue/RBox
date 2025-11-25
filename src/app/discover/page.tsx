export const dynamic = "force-dynamic";
// src/app/discover/page.tsx
import { getAllUsers } from "@/lib/actions/user.action";
import DiscoverClient from "./DiscoverClient";
import bg_discover from "../../../public/recipecards.png";

// 🔒 Server Component — no "use client"
export default async function DiscoverPage() {
  // Fetch users on the server
  const rawUsers = await getAllUsers();
  // Fully serialize (removes ObjectId prototypes)
  const users = JSON.parse(JSON.stringify(rawUsers));

  return (
    <div className="min-h-[90vh]">
      <DiscoverClient users={users} bgImage={bg_discover.src} />
    </div>
  );
}
