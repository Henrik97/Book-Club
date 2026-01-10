"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";

import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import { Button } from "@/components/ui/button";
import TierRow from "@/components/TierRow";
import TierBookCard from "@/components/TierBookCard";

import { Book } from "@/types/models";
import { TierKey, TierState, ReadingRow, RatingRow } from "@/types/rating";

const TIERS: { key: TierKey; label: string }[] = [
  { key: "S", label: "S" },
  { key: "A", label: "A" },
  { key: "B", label: "B" },
  { key: "C", label: "C" },
  { key: "D", label: "D" },
  { key: "F", label: "F" },
];

const emptyTierState: TierState = {
  S: [],
  A: [],
  B: [],
  C: [],
  D: [],
  F: [],
  UNRATED: [],
};

export default function AllTimeTierBoard() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [books, setBooks] = useState<Book[]>([]);
  const [readings, setReadings] = useState<ReadingRow[]>([]);
  const [tierState, setTierState] = useState<TierState>(emptyTierState);

  const [activeId, setActiveId] = useState<string | null>(null);

  const booksById = useMemo(
    () => new Map(books.map((b) => [b.id, b])),
    [books],
  );
  const readingsById = useMemo(
    () => new Map(readings.map((r) => [r.id, r])),
    [readings],
  );

  // ------------------------------------------------------------
  // Fetch finished readings + books + existing all_time_ratings
  // ------------------------------------------------------------
  //

  useEffect(() => {
    const run = async () => {
      setLoading(true);

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      const { data: finishedReadings, error: readingsError } = await supabase
        .from("readings")
        .select("id, book_id, year, start_month, end_month, notes")
        .order("year", { ascending: true })
        .order("start_month", { ascending: true })
        .range(0, 9999);

      if (readingsError) {
        console.error(readingsError);
        setLoading(false);
        return;
      }

      const readingRows = (finishedReadings ?? []) as ReadingRow[];
      setReadings(readingRows);

      // ✅ fetch books used by finished readings
      const bookIds = [...new Set(readingRows.map((r) => r.book_id))];

      const { data: bookRows, error: booksError } = await supabase
        .from("books")
        .select("*")
        .in("id", bookIds)
        .range(0, 9999);

      if (booksError) {
        console.error(booksError);
        setLoading(false);
        return;
      }
      setBooks((bookRows ?? []) as Book[]);

      // ✅ fetch all-time ratings
      const { data: ratingRows, error: ratingError } = await supabase
        .from("all_time_ratings")
        .select("reading_id, tier, position");

      if (ratingError) {
        console.error(ratingError);
        setLoading(false);
        return;
      }

      const ratings = (ratingRows ?? []) as RatingRow[];

      // ✅ build tier state
      const next: TierState = structuredClone(emptyTierState);

      for (const tier of TIERS) {
        next[tier.key] = ratings
          .filter((r) => r.tier === tier.key)
          .sort((a, b) => a.position - b.position)
          .map((r) => r.reading_id);
      }

      const ratedSet = new Set(ratings.map((r) => r.reading_id));
      next.UNRATED = readingRows
        .map((r) => r.id)
        .filter((id) => !ratedSet.has(id));

      setTierState(next);
      setLoading(false);
    };

    run();
  }, [supabase]);

  // ------------------------------------------------------------
  // DnD helpers
  // ------------------------------------------------------------
  function findTier(readingId: string): TierKey | "UNRATED" | null {
    for (const tier of [...TIERS.map((t) => t.key), "UNRATED"] as const) {
      if (tierState[tier].includes(readingId)) return tier;
    }
    return null;
  }

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveId(null);

    const { active, over } = event;
    if (!over) return;

    const activeReadingId = String(active.id);
    const overId = String(over.id);

    const fromTier = findTier(activeReadingId);
    if (!fromTier) return;

    // Dropping on a tier row container
    if (overId.startsWith("tier:")) {
      const target = overId.replace("tier:", "") as TierKey | "UNRATED";

      setTierState((prev) => {
        const next = structuredClone(prev);

        next[fromTier] = next[fromTier].filter((id) => id !== activeReadingId);

        if (!next[target].includes(activeReadingId)) {
          next[target].push(activeReadingId);
        }

        return next;
      });

      return;
    }

    // Dropping on another reading card
    const toTier = findTier(overId);
    if (!toTier) return;

    if (fromTier === toTier) {
      setTierState((prev) => {
        const oldIndex = prev[fromTier].indexOf(activeReadingId);
        const newIndex = prev[fromTier].indexOf(overId);
        if (oldIndex === -1 || newIndex === -1) return prev;

        return {
          ...prev,
          [fromTier]: arrayMove(prev[fromTier], oldIndex, newIndex),
        };
      });
    } else {
      setTierState((prev) => {
        const next = structuredClone(prev);

        next[fromTier] = next[fromTier].filter((id) => id !== activeReadingId);

        const targetIndex = next[toTier].indexOf(overId);
        next[toTier].splice(targetIndex, 0, activeReadingId);

        return next;
      });
    }
  }

  // ------------------------------------------------------------
  // Save
  // ------------------------------------------------------------
  async function handleSave() {
    setSaving(true);

    const payload: { reading_id: string; tier: TierKey; position: number }[] =
      [];

    TIERS.forEach((tier) => {
      tierState[tier.key].forEach((readingId, index) => {
        payload.push({
          reading_id: readingId,
          tier: tier.key,
          position: index,
        });
      });
    });

    const { error } = await supabase.from("all_time_ratings").upsert(payload, {
      onConflict: "reading_id",
    });

    if (error) {
      console.error(error);
      alert(error.message);
    } else {
      alert("✅ All-time tier list saved!");
    }

    setSaving(false);
  }

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      <DndContext
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="rounded-xl border bg-background overflow-hidden">
          {TIERS.map((tier) => (
            <SortableContext
              key={tier.key}
              items={tierState[tier.key]}
              strategy={rectSortingStrategy}
            >
              <TierRow
                id={`tier:${tier.key}`}
                tier={tier.key}
                label={tier.label}
                readingIds={tierState[tier.key]}
                booksById={booksById}
                readingsById={readingsById}
                canDragAction={() => true}
              />
            </SortableContext>
          ))}

          {/* ✅ Bench Shelf */}
          <div className="border-t bg-muted/30 p-3">
            <div className="text-xs font-semibold text-muted-foreground mb-2">
              Bench (Unrated)
            </div>

            <SortableContext
              items={tierState.UNRATED}
              strategy={rectSortingStrategy}
            >
              <TierRow
                id="tier:UNRATED"
                tier={"S"} // ✅ hack so TierRow type doesn't break
                label="" // hidden anyway
                readingIds={tierState.UNRATED}
                booksById={booksById}
                readingsById={readingsById}
                canDragAction={() => true}
                hideLabel
              />
            </SortableContext>
          </div>
        </div>

        {/* ✅ Drag Overlay */}
        <DragOverlay>
          {activeId
            ? (() => {
                const reading = readingsById.get(activeId);
                if (!reading) return null;
                const book = booksById.get(reading.book_id);
                if (!book) return null;
                return (
                  <TierBookCard readingId={activeId} book={book} overlay />
                );
              })()
            : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
