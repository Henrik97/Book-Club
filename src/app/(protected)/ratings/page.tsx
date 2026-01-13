"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RatingsHomePage() {
  const supabase = createClient();
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchYears = async () => {
      setLoading(true);

      const { data, error } = await supabase.from("readings").select("year");

      if (error) {
        console.error("Failed to load reading years:", error.message);
        setLoading(false);
        return;
      }

      const uniqueYears = Array.from(
        new Set((data ?? []).map((r) => r.year)),
      ).sort((a, b) => b - a);

      setYears(uniqueYears);
      setLoading(false);
    };

    fetchYears();
  }, [supabase]);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-semibold">Ratings</h1>
        <p className="text-sm text-muted-foreground">
          Tier lists for each reading year. (More modes like “All Time” coming
          later.)
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : years.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No ratings yet</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Create a reading plan first, then come back to rank the books.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>All Time</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Link href={"/ratings/all-time"} className="w-full">
                <Button className="w-full">Open tier list</Button>
              </Link>
            </CardContent>
          </Card>
          {years.map((y) => (
            <Card key={y}>
              <CardHeader>
                <CardTitle>{y}</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Link href={`/ratings/${y}`} className="w-full">
                  <Button className="w-full">Open tier list</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
