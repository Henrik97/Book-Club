"use client";
import BookCatalog from "@/components/BookCatalog";
import ReadingYearCards from "@/components/CreateReadingPlan";
import { Book } from "@/types/models";
import { MonthNumber } from "@/types/months";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, useMemo } from "react";
import { closestCenter, DndContext, DragEndEvent } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import EditReadSpanDialog from "@/components/EditReadSpanDialog";

export type ReadingsDraft = {
  id: string;
  bookId: string;
  startMonth: MonthNumber;
  endMonth: MonthNumber;
};

export default function ReadingsPlanner() {
  const [books, setBooks] = useState<Book[]>([]);
  const [readBookIds, setReadBookIds] = useState<Set<string>>(new Set());
  const [readings, setReadings] = useState<ReadingsDraft[]>([]);
  const [editSpanDialog, setEditSpanDialog] = useState(false);
  const [editingReading, setEditingReading] = useState<ReadingsDraft | null>(
    null,
  );
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: booksData, error: booksError } = await supabase
        .from("books")
        .select("*");
      if (booksError) {
        console.error("Error fetching books:", booksError.message);
      } else {
        setBooks(booksData || []);
      }
      const { data: readingsData, error: readingsError } = await supabase
        .from("readings")
        .select("book_id");
      if (readingsError) {
        console.log(readingsError);
      } else {
        setReadBookIds(new Set((readingsData ?? []).map((r) => r.book_id)));
      }
    };
    fetchData();
  }, [supabase]);

  const plannedBookIds = useMemo(
    () => new Set(readings.map((r) => r.bookId)),
    [readings],
  );

  const booksInCatalog = useMemo(() => {
    return books.filter(
      (b) => !readBookIds.has(b.id) && !plannedBookIds.has(b.id),
    );
  }, [books, readBookIds, plannedBookIds]);

  const booksById = useMemo(
    () => new Map(books.map((b) => [b.id, b])),
    [books],
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id); // e.g. "book:uuid"
    const overId = String(over.id); // e.g. "month:3"

    if (!overId.startsWith("month:")) return;
    const month = Number(overId.replace("month:", "")) as MonthNumber;

    if (activeId.startsWith("book:")) {
      const bookId = activeId.replace("book:", "");
      if (plannedBookIds.has(bookId)) return;
      setReadings((prev) => [
        ...prev,
        { id: crypto.randomUUID(), bookId, startMonth: month, endMonth: month },
      ]);
    }

    if (activeId.startsWith("reading:")) {
      const readingId = activeId.replace("reading:", "");
      setReadings((prev) =>
        prev.map((item) => {
          if (item.id !== readingId) return item;
          const duration = item.endMonth - item.startMonth;
          const newStartMonth = month;
          const newEndMonth = Math.min(
            12,
            newStartMonth + duration,
          ) as MonthNumber;

          return { ...item, startMonth: newStartMonth, endMonth: newEndMonth };
        }),
      );
    }
  }

  function removeBookFromPlan(readingId: string) {
    setReadings((prev) => prev.filter((r) => r.id !== readingId));
  }

  async function createReadingPlan() {
    const { error } = await supabase.from("readings").insert(
      readings.map((r) => ({
        book_id: r.bookId,
        year: year,
        start_month: r.startMonth,
        end_month: r.endMonth,
      })),
    );
    if (error) console.log(error.message);
  }

  function onEditSpan(readingId: string) {
    const reading = readings.find((r) => r.id === readingId);
    const book = booksById.get(reading?.bookId || "");
    if (!book) return;
    if (!reading) return;
    setEditingReading(reading);
    setEditSpanDialog(true);
  }

  function handleEditSpanSave(endMonth: number) {
    if (!editingReading) return;

    if (endMonth < editingReading.startMonth || endMonth > 12) return;
    const newEndMonth = endMonth as MonthNumber;

    setReadings((prev) =>
      prev.map((item) =>
        item.id === editingReading.id
          ? { ...item, endMonth: newEndMonth }
          : item,
      ),
    );

    setEditSpanDialog(false);
    setEditingReading(null);
  }

  return (
    <>
      <Button onClick={createReadingPlan}>Create Reading Plan</Button>
      <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <div className="flex flex-col gap-8 p-4">
          <BookCatalog books={booksInCatalog} />
          <ReadingYearCards
            year={year}
            readings={readings}
            booksById={booksById}
            onRemoveBook={removeBookFromPlan}
            onEditSpan={onEditSpan}
          />
        </div>
      </DndContext>

      {editingReading && (
        <EditReadSpanDialog
          open={editSpanDialog}
          book={booksById.get(editingReading.bookId)}
          reading={editingReading}
          onOpenChange={(open) => {
            setEditSpanDialog(open);
            if (!open) setEditingReading(null);
          }}
          handleSave={handleEditSpanSave}
        />
      )}
    </>
  );
}
