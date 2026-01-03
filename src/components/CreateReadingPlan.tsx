import { MONTH_LABELS, MonthNumber } from "@/types/months";
import { Card, CardHeader } from "./ui/card";
import { Plan, Book } from "@/types/models";
import { useDroppable } from "@dnd-kit/core";
import { DraggableBookCard } from "./DraggableBookCard";
import { ReadingsDraft } from "@/app/readingplan/[year]/page";
import BookCoverImage from "./BookCoverImage";
import { getCoverUrl } from "@/helpers/coverUrl";
import { Fragment } from "react";

type ReadingYearCardsProps = {
  year: number;
  readings: ReadingsDraft[];
  booksById: Map<string, Book>;
  onRemoveBook: (readingId: string) => void;
  onEditSpan: (readingId: string) => void;
};

export default function ReadingYearCards({
  year,
  readings,
  booksById,
  onRemoveBook,
  onEditSpan,
}: ReadingYearCardsProps) {
  return (
    <div>
      Yearly Reading Plan {year}
      <div className="grid grid-cols-6 gap-4 ">
        {Object.entries(MONTH_LABELS).map(([monthStr, label]) => {
          const month = Number(monthStr) as MonthNumber;
          return (
            <MonthCard
              key={month}
              month={month}
              label={label}
              readings={readings.filter(
                (r) => r.startMonth <= month && month <= r.endMonth,
              )}
              booksById={booksById}
              onRemove={onRemoveBook}
              onEditSpan={onEditSpan}
            />
          );
        })}
      </div>
    </div>
  );
}

function MonthCard({
  month,
  label,
  readings,
  booksById,
  onRemove,
  onEditSpan,
}: {
  month: MonthNumber;
  label: string;
  readings: ReadingsDraft[];
  booksById: Map<string, Book>;
  onRemove: (readingId: string) => void;
  onEditSpan: (readingId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `month:${month}`,
  });

  return (
    <Card className={`transition ${isOver ? "ring-2 ring-primary" : ""}`}>
      <CardHeader>{label}</CardHeader>
      <div
        ref={setNodeRef}
        className="flex flex-row px-6 pb-4 gap-2 flex-wrap min-h-30"
      >
        {readings.length === 0 ? (
          <div className="text-sm text-muted-foreground">Drop books here…</div>
        ) : (
          readings.map((reading) => {
            const book = booksById.get(reading.bookId);
            if (!book) return null;
            const coverUrl =
              book.image_url ||
              (book.image_path
                ? getCoverUrl(book.image_path)
                : "/no_cover_available.png");

            return (
              <Fragment key={reading.id}>
                {reading.startMonth === month ? (
                  <div className="w-[90px]">
                    <DraggableBookCard
                      type="reading"
                      book={book}
                      id={reading.id}
                    />
                    <div className="flex flex-col gap-1 mt-1 text-center">
                      <button
                        className="text-[10px] hover:underline"
                        onClick={() => onEditSpan(reading.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-[10px] text-red-500 hover:underline"
                        onClick={() => onRemove(reading.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <Card className="w-[90px] p-0 overflow-hidden opacity-50">
                    <BookCoverImage coverUrl={coverUrl} title={book.title} />
                  </Card>
                )}
              </Fragment>
            );
          })
        )}
      </div>
    </Card>
  );
}
