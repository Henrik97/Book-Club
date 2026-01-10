import { Book } from "@/types/models";
import { DraggableBookCard } from "./DraggableBookCard";

interface Props {
  books: Book[];
}

export default function BookCatalog({ books }: Props) {
  return (
    <div className="space-y-2 min-w-0">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Book Catalog
        </span>
        <span className="text-xs text-muted-foreground">
          {books.length} available
        </span>
      </div>

      <div className="w-full overflow-x-auto">
        <div className="flex gap-3 pb-3">
          {books.map((book) => (
            <div key={book.id} className="shrink0">
              <DraggableBookCard type="book" id={book.id} book={book} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
