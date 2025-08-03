"use client";

import { useSession } from "next-auth/react";

export default function Home() {
  const session = useSession();
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <p>
          {session.data
            ? JSON.stringify(session.data)
            : "No session data available"}
        </p>
      </main>
    </div>
  );
}
