"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Book } from "@/types/models";
import { MonthNumber } from "@/types/months";
import { closestCenter, DndContext, DragEndEvent } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import BookCatalog from "@/components/BookCatalog";
import ReadingYearCards from "@/components/CreateReadingPlan";
import EditReadSpanDialog from "@/components/EditReadSpanDialog";

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

export default function ReadingPlanEditPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const year = Number(params.year);

  const [books, setBooks] = useState<Book[]>([]);
  const [readings, setReadings] = useState<ReadingsDraft[]>([]);
  const [loading, setLoading] = useState(true);

  const [editSpanDialog, setEditSpanDialog] = useState(false);
  const [editingReading, setEditingReading] = useState<ReadingsDraft | null>(
    null,
  );

  const plannedBookIds = useMemo(
    () => new Set(readings.map((r) => r.bookId)),
    [readings],
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: booksData, error: booksError } = await supabase
        .from("books")
        .select("*");

      if (booksError) {
        console.error("Books error:", booksError.message);
      } else {
        setBooks(booksData || []);
      }

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

  const booksInCatalog = useMemo(() => {
    return books.filter((b) => !plannedBookIds.has(b.id));
  }, [books, plannedBookIds]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (!overId.startsWith("month:")) return;
    const month = Number(overId.replace("month:", "")) as MonthNumber;

    // drop book from catalog
    if (activeId.startsWith("book:")) {
      const bookId = activeId.replace("book:", "");
      if (plannedBookIds.has(bookId)) return;

      setReadings((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          bookId,
          startMonth: month,
          endMonth: month,
        },
      ]);
      return;
    }

    // move an existing reading
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

  function onEditSpan(readingId: string) {
    const reading = readings.find((r) => r.id === readingId);
    if (!reading) return;
    setEditingReading(reading);
    setEditSpanDialog(true);
  }

  function handleEditSpanSave(endMonth: number) {
    if (!editingReading) return;
    if (endMonth < editingReading.startMonth || endMonth > 12) return;

    setReadings((prev) =>
      prev.map((item) =>
        item.id === editingReading.id
          ? { ...item, endMonth: endMonth as MonthNumber }
          : item,
      ),
    );

    setEditSpanDialog(false);
    setEditingReading(null);
  }

  async function savePlan() {
    // easiest approach: clear the year and reinsert
    const { error: deleteError } = await supabase
      .from("readings")
      .delete()
      .eq("year", year);

    if (deleteError) {
      console.error(deleteError.message);
      return;
    }

    const payload = readings.map((r) => ({
      book_id: r.bookId,
      year,
      start_month: r.startMonth,
      end_month: r.endMonth,
    }));

    const { error: insertError } = await supabase
      .from("readings")
      .insert(payload);

    if (insertError) {
      console.error(insertError.message);
      return;
    }

    router.push(`/readingplan/${year}`);
  }

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Edit plan {year}</h1>
          <p className="text-sm text-muted-foreground">
            Drag books into months and save the plan.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/readingplan/${year}`)}
          >
            Cancel
          </Button>
          <Button onClick={savePlan}>Save plan</Button>
        </div>
      </div>

      <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <div className="space-y-6">
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
    </div>
  );
}
