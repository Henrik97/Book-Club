"use client";

import { Dispatch, SetStateAction, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  DragOverEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import TierRow from "@/components/TierRow";
import TierBookCard from "@/components/TierBookCard";
import { Book } from "@/types/models";
import { ReadingRow } from "@/app/ratings/[year]/page";
import TierBookCardOverlay from "./TierBookCardOverlay";

export type TierKey = "S" | "A" | "B" | "C" | "D" | "F";
export type ListKey = TierKey | "UNRATED";
export type TierState = Record<ListKey, string[]>;

type Props = {
  year: number;
  tierState: TierState;
  setTierStateAction: Dispatch<SetStateAction<TierState>>;
  booksById: Map<string, Book>;
  readingsById: Map<string, ReadingRow>;
  canDragAction: (readingId: string) => boolean;
};

const TIERS: { key: TierKey; label: string }[] = [
  { key: "S", label: "S" },
  { key: "A", label: "A" },
  { key: "B", label: "B" },
  { key: "C", label: "C" },
  { key: "D", label: "D" },
  { key: "F", label: "F" },
];

function findContainer(state: TierState, readingId: string): ListKey | null {
  for (const key of Object.keys(state) as ListKey[]) {
    if (state[key].includes(readingId)) return key;
  }
  return null;
}

export default function TierBoard({
  tierState,
  setTierStateAction,
  booksById,
  readingsById,
  canDragAction,
}: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overContainer, setOverContainer] = useState<ListKey | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const activeReading = activeId ? readingsById.get(activeId) : null;
  const activeBook = activeReading
    ? booksById.get(activeReading.book_id)
    : null;

  function onDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    if (!canDragAction(id)) return;
    setActiveId(id);
  }

  function onDragOver(event: DragOverEvent) {
    const overId = event.over?.id;
    if (!overId) {
      setOverContainer(null);
      return;
    }

    const overStr = String(overId);

    // Hovering tier container
    if (overStr.startsWith("tier:")) {
      setOverContainer(overStr.replace("tier:", "") as ListKey);
      return;
    }

    // Hovering another item -> detect its container
    const container = findContainer(tierState, overStr);
    setOverContainer(container);
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    setOverContainer(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (!canDragAction(activeId)) return;

    const activeContainer = findContainer(tierState, activeId);
    if (!activeContainer) return;

    if (overId.startsWith("tier:")) {
      const target = overId.replace("tier:", "") as ListKey;
      if (target === activeContainer) return;

      setTierStateAction((prev) => {
        const next = structuredClone(prev);
        next[activeContainer] = next[activeContainer].filter(
          (id) => id !== activeId,
        );
        next[target].push(activeId);
        return next;
      });
      return;
    }

    const overContainer = findContainer(tierState, overId);
    if (!overContainer) return;

    if (activeContainer === overContainer) {
      const oldIndex = tierState[activeContainer].indexOf(activeId);
      const newIndex = tierState[activeContainer].indexOf(overId);

      if (oldIndex !== newIndex) {
        setTierStateAction((prev) => ({
          ...prev,
          [activeContainer]: arrayMove(
            prev[activeContainer],
            oldIndex,
            newIndex,
          ),
        }));
      }
    } else {
      setTierStateAction((prev) => {
        const next = structuredClone(prev);

        next[activeContainer] = next[activeContainer].filter(
          (id) => id !== activeId,
        );

        const overIndex = next[overContainer].indexOf(overId);
        next[overContainer].splice(overIndex, 0, activeId);

        return next;
      });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
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
              canDragAction={canDragAction}
            />
          </SortableContext>
        ))}

        {/* Unrated shelf */}
        <div
          className={`border-t bg-muted/30 p-4 transition ${
            overContainer === "UNRATED"
              ? "ring-2 ring-primary ring-inset bg-primary/5"
              : ""
          }`}
          id="tier:UNRATED"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold">Unrated</p>
            <p className="text-xs text-muted-foreground">
              {tierState.UNRATED.length} books
            </p>
          </div>

          <SortableContext
            items={tierState.UNRATED}
            strategy={rectSortingStrategy}
          >
            <div className="flex flex-wrap gap-3">
              {tierState.UNRATED.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  All books are rated 🎉
                </p>
              ) : (
                tierState.UNRATED.map((readingId) => {
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
          </SortableContext>
        </div>
      </div>

      <DragOverlay>
        {activeBook ? (
          <div>
            <TierBookCardOverlay book={activeBook} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
