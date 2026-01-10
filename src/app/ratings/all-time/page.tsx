"use client";

import AllTimeTierBoard from "@/components/AllTimeTierBoard";

export default function AllTimeRatingsPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">All-Time Tier List</h1>
        <p className="text-muted-foreground">
          Rate every finished book in the club’s history.
        </p>
      </div>

      <AllTimeTierBoard />
    </div>
  );
}
