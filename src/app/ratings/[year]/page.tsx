"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Book } from "@/types/models";
import TierBoard, { TierKey, TierState } from "@/components/TierBoard";

export type ReadingRow = {
  id: string;
  book_id: string;
  year: number;
  start_month: number;
  end_month: number;
  notes: string | null;
};

export type YearlyRatingRow = {
  year: number;
  reading_id: string;
  tier: TierKey;
  position: number;
};

function isFinishedReading(reading: ReadingRow) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (reading.year < currentYear) return true;
  if (reading.year > currentYear) return false;

  return reading.end_month < currentMonth;
}

const initialTier: TierState = {
  S: [],
  A: [],
  B: [],
  C: [],
  D: [],
  F: [],
  UNRATED: [],
};

export default function RatingsYearPage() {
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();

  const year = Number(params.year);

  const [books, setBooks] = useState<Book[]>([]);
  const [readings, setReadings] = useState<ReadingRow[]>([]);
  const [tierState, setTierState] = useState<TierState>(initialTier);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: booksData, error: booksError } = await supabase
        .from("books")
        .select("*");

      if (booksError) console.error("Books:", booksError.message);
      setBooks(booksData || []);

      const { data: readingsData, error: readingsError } = await supabase
        .from("readings")
        .select("id, book_id, year, start_month, end_month")
        .eq("year", year);

      if (readingsError) console.error("Readings:", readingsError.message);
      const r = (readingsData || []) as ReadingRow[];
      setReadings(r);

      // Load saved ratings
      const { data: ratingData, error: ratingError } = await supabase
        .from("yearly_ratings")
        .select("reading_id, tier, position")
        .eq("year", year)
        .order("position", { ascending: true });

      if (ratingError) console.error("Ratings:", ratingError.message);
      const saved = (ratingData || []) as YearlyRatingRow[];

      // Build initial board model
      const allReadingIds = r.map((x) => x.id);
      const savedIds = new Set(saved.map((x) => x.reading_id));

      // Fill saved into tier lists
      saved.forEach((row) => {
        initialTier[row.tier].push(row.reading_id);
      });

      // Anything not saved goes to UNRATED
      allReadingIds.forEach((id) => {
        if (!savedIds.has(id)) initialTier.UNRATED.push(id);
      });

      setTierState(initialTier);
      setLoading(false);
    };

    fetchData();
  }, [supabase, year]);

  const booksById = useMemo(
    () => new Map(books.map((b) => [b.id, b])),
    [books],
  );
  const readingsById = useMemo(
    () => new Map(readings.map((r) => [r.id, r])),
    [readings],
  );

  async function handleSave() {
    if (!tierState) return;
    setSaving(true);

    try {
      // delete existing for year
      const { error: delError } = await supabase
        .from("yearly_ratings")
        .delete()
        .eq("year", year);

      if (delError) throw delError;

      // convert state => rows
      const payload: YearlyRatingRow[] = [];
      (["S", "A", "B", "C", "D"] as TierKey[]).forEach((tier) => {
        tierState[tier].forEach((readingId, index) => {
          payload.push({
            year,
            reading_id: readingId,
            tier,
            position: index,
          });
        });
      });

      if (payload.length > 0) {
        const { error: insError } = await supabase
          .from("yearly_ratings")
          .insert(payload);

        if (insError) throw insError;
      }

      alert("Saved ✅");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      alert(msg);
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !tierState) {
    return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tier List {year}</h1>
          <p className="text-sm text-muted-foreground">
            Drag finished books into tiers. Unfinished books are locked.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/ratings")}>
            Back
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      <div className="bg-muted/20 p-4 rounded-xl border">
        <TierBoard
          year={year}
          tierState={tierState}
          setTierStateAction={setTierState}
          booksById={booksById}
          readingsById={readingsById}
          canDragAction={(readingId) => {
            const r = readingsById.get(readingId);
            if (!r) return false;
            return isFinishedReading(r);
          }}
        />
      </div>
    </div>
  );
}
