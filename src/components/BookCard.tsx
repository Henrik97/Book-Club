import Image from "next/image";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { getCoverUrl } from "@/helpers/coverUrl";
import { Book } from "@/types/models";

interface Props {
  book: Book;
  onClick: () => void;
}

export default function BookCard({ book, onClick }: Props) {
  const coverUrl =
    book.image_url ||
    (book.image_path
      ? getCoverUrl(book.image_path)
      : "/no_cover_available.png");

  return (
    <Card
      onClick={onClick}
      className="cursor-pointer hover:shadow-md transition-shadow"
    >
      <CardHeader className="space-y-2">
        <div className="relative w-full aspect-[3/4] overflow-hidden rounded-md bg-muted">
          <Image
            src={coverUrl}
            alt={book.title}
            fill
            className=""
            sizes="(max-width: 768px) 50vw, 20vw"
            unoptimized={coverUrl.startsWith("http")}
          />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-base line-clamp-2">{book.title}</CardTitle>
          <CardDescription className="line-clamp-1">
            {book.author}
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}
