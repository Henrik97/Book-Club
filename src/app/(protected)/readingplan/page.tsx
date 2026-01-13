"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReadingPlanHomePage() {
  const supabase = createClient();

  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  const [yearsWithPlans, setYearsWithPlans] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchYears = async () => {
      setLoading(true);

      // Get distinct years from readings
      const { data, error } = await supabase.from("readings").select("year");

      if (error) {
        console.error("Error fetching years:", error.message);
        setLoading(false);
        return;
      }

      const years = Array.from(new Set((data ?? []).map((r) => r.year))).sort(
        (a, b) => b - a,
      );

      setYearsWithPlans(years);
      setLoading(false);
    };

    fetchYears();
  }, [supabase]);

  const hasCurrentPlan = yearsWithPlans.includes(currentYear);

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold">Reading Plans</h1>
        <p className="text-sm text-muted-foreground">
          Manage yearly reading plans and review past schedules.
        </p>
      </div>

      {/* Current Year Highlight */}
      <Card>
        <CardHeader>
          <CardTitle>{currentYear} Plan</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {hasCurrentPlan
              ? "View the active plan for this year."
              : "No plan exists for this year yet."}
          </p>

          {hasCurrentPlan ? (
            <Link href={`/readingplan/${currentYear}`}>
              <Button>View plan</Button>
            </Link>
          ) : (
            <Link href={`/readingplan/${currentYear}/edit`}>
              <Button>Create plan</Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Next Year CTA */}
      <Card>
        <CardHeader>
          <CardTitle>Plan ahead</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Start planning next year’s reading list.
          </p>
          <Link href={`/readingplan/${nextYear}/edit`}>
            <Button variant="outline">Create {nextYear} plan</Button>
          </Link>
        </CardContent>
      </Card>

      {/* History */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Past plans</h2>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : yearsWithPlans.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No reading plans created yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {yearsWithPlans.map((year) => (
              <Card key={year}>
                <CardHeader>
                  <CardTitle>{year}</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Link href={`/readingplan/${year}`} className="w-full">
                    <Button className="w-full">View</Button>
                  </Link>

                  <Link href={`/readingplan/${year}/edit`} className="w-full">
                    <Button variant="outline" className="w-full">
                      Edit
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
