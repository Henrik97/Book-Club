import { Book } from "@/types/models";
import { DraggableBookCard } from "./DraggableBookCard";

interface Props {
  books: Book[];
}

export default function BookCatalog({ books }: Props) {
  return (
    <div>
      <span>Book Catalog Component</span>

      <div className="grid grid-cols-2 gap-4 w-80">
        {books.map((book) => (
          <DraggableBookCard
            key={book.id}
            type={"book"}
            id={book.id}
            book={book}
          />
        ))}
      </div>
    </div>
  );
}
