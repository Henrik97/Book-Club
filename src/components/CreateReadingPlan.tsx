import { MONTH_LABELS, MonthNumber } from "@/types/months";
import { Card, CardHeader } from "./ui/card";
import { Plan, Book } from "@/types/models";
import { useDroppable } from "@dnd-kit/core";
import { DraggableBookCard } from "./DraggableBookCard";
import { ReadingsDraft } from "@/app/reading-planner/page";
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
            const coverUrl = getCoverUrl(book.image_path);

            return (
              <Fragment key={reading.id}>
                {reading.startMonth === month ? (
                  <div>
                    <DraggableBookCard
                      type={"reading"}
                      book={book}
                      id={reading.id}
                    />
                    <div className="flex space-x-2 mt-1 justify-center">
                      <button
                        className="text-xs hover:underline"
                        onClick={() => onEditSpan(reading.id)}
                      >
                        Edit Span
                      </button>
                      <button
                        className="text-xs text-red-500 hover:underline"
                        onClick={() => onRemove(reading.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <Card className={"p-0 overflow-hidden opacity-50"}>
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
