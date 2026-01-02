import { useDraggable } from "@dnd-kit/core";
import { Book } from "@/types/models";
import { getCoverUrl } from "@/helpers/coverUrl";
import { Card } from "./ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import BookCoverImage from "./BookCoverImage";

type props = {
  id: string;
  book: Book;
  type: string;
};

export function DraggableBookCard({ id, book, type }: props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `${type}:${id}`,
    });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  const coverUrl =
    book.image_url ||
    (book.image_path
      ? getCoverUrl(book.image_path)
      : "/no_cover_available.png");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card
          ref={setNodeRef}
          style={style}
          className={` z-9999 w-[90px] aspect-3/4 shrink-0 relative overflow-hidden p-0 cursor-grab ${
            isDragging ? "opacity-50" : ""
          }`}
          {...listeners}
          {...attributes}
        >
          <BookCoverImage coverUrl={coverUrl} title={book.title} />
        </Card>
      </TooltipTrigger>
      <TooltipContent>
        <p>{book.title}</p>
      </TooltipContent>
    </Tooltip>
  );
}
