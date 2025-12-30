import { MONTH_LABELS, MonthNumber } from "@/types/months";
import { Card, CardHeader } from "./ui/card";
import { Plan, Book } from "@/types/models";
import { useDroppable } from "@dnd-kit/core";
import { DraggableBookCard } from "./DraggableBookCard";
import { ReadingsDraft } from "@/app/reading-planner/page";

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
    <div className="grid grid-cols-1 gap-4 w-3xl">
      Yearly Reading Plan {year}
      {Object.entries(MONTH_LABELS).map(([month, label]) => (
        <MonthCard
          key={month}
          month={Number(month) as MonthNumber}
          label={label}
          readings={readings.filter(
            (r) => r.startMonth === (Number(month) as MonthNumber),
          )}
          booksById={booksById}
          onRemove={onRemoveBook}
          onEditSpan={onEditSpan}
        />
      ))}
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
    <Card
      ref={setNodeRef}
      className={`transition ${isOver ? "ring-2 ring-primary" : ""}`}
    >
      <CardHeader>{label}</CardHeader>
      <div className="flex flex-row px-6 pb-4 space-y-2">
        {readings.length === 0 ? (
          <div className="text-sm text-muted-foreground">Drop books here…</div>
        ) : (
          readings.map((reading) => {
            const book = booksById.get(reading.bookId);
            if (!book) return null;

            return (
              <div key={reading.id}>
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
            );
          })
        )}
      </div>
    </Card>
  );
}
