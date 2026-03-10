// src/app/carpenters/profile/edit/page.tsx
import { prisma } from "@/lib/prisma";

export default async function EditPortfolioPage() {
  // TODO: load the logged-in carpenter and their portfolio
  // const profile = await prisma.carpenterProfile.findFirst({ ... });

  return (
    <main className="min-h-screen px-6 py-10 text-white">
      <h1 className="text-3xl font-bold mb-4">Edit Portfolio</h1>
      <p>Portfolio editing UI will come here.</p>
    </main>
  );
}
