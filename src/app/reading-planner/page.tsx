"use client";
import BookCatalog from "@/components/BookCatalog";
import ReadingYearCards from "@/components/CreateReadingPlan";
import { Book } from "@/types/models";
import { MonthNumber } from "@/types/months";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, useMemo } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { getCoverUrl } from "@/helpers/coverUrl";

export type ReadingsDraft = {
  id: string;
  bookId: string;
  startMonth: MonthNumber;
  endMonth: MonthNumber;
};

export default function ReadingsPlanner() {
  const [books, setBooks] = useState<Book[]>([]);
  const [booksInCatalog, setBooksInCatalog] = useState<Book[]>([]);
  const [readings, setReadings] = useState<ReadingsDraft[]>([]);
  const [editSpanDialog, setEditSpanDialog] = useState(false);
  const [editBook, setBookForEditing] = useState<Book | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchBooks = async () => {
      const { data, error } = await supabase.from("books").select("*");
      if (error) {
        console.error("Error fetching books:", error.message);
      } else {
        setBooks(data || []);
        setBooksInCatalog(data || []);
      }
    };
    fetchBooks();
  }, [supabase]);

  const booksById = useMemo(() => {
    return new Map(books.map((book) => [book.id, book]));
  }, [books]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id); // e.g. "book:uuid"
    const overId = String(over.id); // e.g. "month:3"

    const bookId = activeId.replace("book:", "");
    if (!overId.startsWith("month:")) return;
    const month = Number(overId.replace("month:", "")) as MonthNumber;

    // if (activeId === "book:") {
    if (activeId.startsWith("book:")) {
      setReadings((prev) => [
        ...prev,
        { id: crypto.randomUUID(), bookId, startMonth: month, endMonth: month },
      ]);
    }

    if (activeId.startsWith("reading")) {
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

  function createReadingPlan() {
    console.log(readings);
  }

  function onEditSpan(readingId: string) {
    const reading = readings.find((r) => r.id === readingId);
    const book = booksById.get(reading?.bookId || "");
    if (!book) return;
    setBookForEditing(book);
    setEditSpanDialog(true);
  }

  return (
    <>
      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex flex-row gap-8 p-4">
          <ReadingYearCards
            year={2026}
            readings={readings}
            booksById={booksById}
            onRemoveBook={removeBookFromPlan}
            onEditSpan={onEditSpan}
          />
          <BookCatalog books={booksInCatalog} />
        </div>
      </DndContext>
      <Button onClick={createReadingPlan}>Create Reading Plan</Button>

      {editBook && (
        <Dialog open={editSpanDialog} onOpenChange={setEditSpanDialog}>
          <DialogContent className="h-96 w-96">
            <DialogTitle>Change Period</DialogTitle>
            <Image
              src={getCoverUrl(editBook?.image_path)}
              fill
              alt={editBook.title}
              className="rounded"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
