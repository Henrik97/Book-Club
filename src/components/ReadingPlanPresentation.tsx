import { MONTH_LABELS } from "@/types/months";
import { Book } from "@/types/models";
import { getCoverUrl } from "@/helpers/coverUrl";
import Image from "next/image";
import { ReadingsDraft } from "@/app/readingplan/[year]/page";

type Props = {
  year: number;
  readings: ReadingsDraft[];
  booksById: Map<string, Book>;
};

export default function ReadingPlanPresentation({
  year,
  readings,
  booksById,
}: Props) {
  const sorted = [...readings].sort((a, b) => a.startMonth - b.startMonth);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Reading plan {year}</h2>
        <p className="text-sm text-muted-foreground">
          Timeline view of the year
        </p>
      </div>

      <div className="relative flex flex-col gap-10">
        {/* center vertical line */}
        <div className="absolute left-1/2 top-0 h-full w-[2px] bg-muted -translate-x-1/2" />

        {sorted.map((reading, idx) => {
          const book = booksById.get(reading.bookId);
          if (!book) return null;

          const coverUrl =
            book.image_url ||
            (book.image_path
              ? getCoverUrl(book.image_path)
              : "/no_cover_available.png");

          const startLabel = MONTH_LABELS[reading.startMonth];
          const endLabel = MONTH_LABELS[reading.endMonth];

          const isLeft = idx % 2 === 0;

          return (
            <div
              key={reading.id}
              className={`relative flex w-full ${
                isLeft ? "justify-start" : "justify-end"
              }`}
            >
              {/* timeline dot */}
              <div className="absolute left-1/2 top-6 w-4 h-4 bg-background border-4 border-primary rounded-full -translate-x-1/2 z-10" />

              {/* content card */}
              <div
                className={`w-[90%] sm:w-[420px] rounded-lg border bg-card shadow-sm p-4 ${
                  isLeft ? "mr-auto pr-8" : "ml-auto pl-8"
                }`}
              >
                <div className="flex gap-4">
                  {/* cover */}
                  <div className="relative w-16 h-24 shrink-0 overflow-hidden rounded bg-muted">
                    <Image
                      src={coverUrl}
                      fill
                      alt={book.title}
                      className="object-cover"
                      unoptimized={coverUrl.startsWith("http")}
                    />
                  </div>

                  {/* text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold truncate">{book.title}</h3>
                      {startLabel === endLabel ? (
                        <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground whitespace-nowrap">
                          {startLabel}
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground whitespace-nowrap">
                          {startLabel} → {endLabel}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {book.author}
                    </p>

                    <p className="text-sm mt-2 text-muted-foreground">
                      Planned reading period:{" "}
                      <span className="font-medium text-foreground">
                        {startLabel} to {endLabel}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {sorted.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No readings planned yet.
          </p>
        )}
      </div>
    </div>
  );
}
