"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Book } from "@/types/models";
import { MonthNumber } from "@/types/months";
import ReadingPlanPresentation from "@/components/ReadingPlanPresentation";

type ReadingRow = {
  id: string;
  book_id: string;
  start_month: number;
  end_month: number;
};

export type ReadingsDraft = {
  id: string;
  bookId: string;
  startMonth: MonthNumber;
  endMonth: MonthNumber;
};

export default function ReadingPlanYearPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const year = Number(params.year);

  const [books, setBooks] = useState<Book[]>([]);
  const [readings, setReadings] = useState<ReadingsDraft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Load books (for lookup)
      const { data: booksData, error: booksError } = await supabase
        .from("books")
        .select("*");

      if (booksError) {
        console.error("Books error:", booksError.message);
      } else {
        setBooks(booksData || []);
      }

      // Load readings for this year
      const { data: readingsData, error: readingsError } = await supabase
        .from("readings")
        .select("id, book_id, start_month, end_month")
        .eq("year", year);

      if (readingsError) {
        console.error("Readings error:", readingsError.message);
      } else {
        setReadings(
          ((readingsData || []) as ReadingRow[]).map((r) => ({
            id: r.id,
            bookId: r.book_id,
            startMonth: r.start_month as MonthNumber,
            endMonth: r.end_month as MonthNumber,
          })),
        );
      }

      setLoading(false);
    };

    fetchData();
  }, [supabase, year]);

  const booksById = useMemo(
    () => new Map(books.map((b) => [b.id, b])),
    [books],
  );

  const hasPlan = readings.length > 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Reading Plan {year}</h1>
          <p className="text-sm text-muted-foreground">
            View the planned readings for the year.
          </p>
        </div>

        <div className="flex gap-2">
          {hasPlan && (
            <Button
              variant="outline"
              onClick={() => router.push(`/readingplan/${year}/edit`)}
            >
              Edit plan
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !hasPlan ? (
        <div className="rounded-lg border p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            No reading plan exists for {year} yet.
          </p>
          <Button onClick={() => router.push(`/readingplan/${year}/edit`)}>
            Create plan
          </Button>
        </div>
      ) : (
        <ReadingPlanPresentation
          year={year}
          readings={readings}
          booksById={booksById}
        />
      )}
    </div>
  );
}
