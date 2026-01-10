"use client";

import { useDroppable } from "@dnd-kit/core";
import { Book } from "@/types/models";
import TierBookCard from "./TierBookCard";
import { TierKey, ReadingRow } from "@/types/rating";

type Tier = TierKey | "UNRATED";

const tierColors: Record<Tier, string> = {
  S: "bg-red-500/80",
  A: "bg-orange-500/80",
  B: "bg-yellow-500/80",
  C: "bg-green-500/80",
  D: "bg-blue-500/80",
  F: "bg-gray-500/80",

  // ✅ Special styling for unrated bench
  UNRATED: "bg-muted text-muted-foreground",
};

type Props = {
  id: string;
  tier: Tier;
  label?: string;
  readingIds: string[];
  booksById: Map<string, Book>;
  readingsById: Map<string, ReadingRow>;

  // ✅ rename to Action to satisfy Next serializable prop warning
  canDragAction: (readingId: string) => boolean;

  // ✅ optional label removal (bench shelf)
  hideLabel?: boolean;
};

export default function TierRow({
  id,
  tier,
  label = "",
  readingIds,
  booksById,
  readingsById,
  canDragAction,
  hideLabel = false,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex items-stretch border-b last:border-b-0 transition
        ${isOver ? "ring-2 ring-primary ring-inset bg-primary/5" : ""}`}
    >
      {/* ✅ hide label when needed */}
      {!hideLabel && (
        <div
          className={`w-20 shrink-0 flex items-center justify-center font-black text-2xl text-white ${tierColors[tier]}`}
        >
          {label}
        </div>
      )}

      <div
        className={`flex-1 min-h-27.5 p-3 flex flex-wrap gap-3 items-center bg-background
          ${hideLabel ? "border-l-0" : ""}`}
      >
        {readingIds.length === 0 ? (
          <p className="text-xs text-muted-foreground">Drop books here…</p>
        ) : (
          readingIds.map((readingId) => {
            const reading = readingsById.get(readingId);
            if (!reading) return null;

            const book = booksById.get(reading.book_id);
            if (!book) return null;

            return (
              <TierBookCard
                key={readingId}
                readingId={readingId}
                book={book}
                locked={!canDragAction(readingId)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
