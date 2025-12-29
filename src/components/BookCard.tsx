import Image from "next/image";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { getCoverUrl } from "@/helpers/coverUrl";
import { Book } from "@/models/book";
interface Props {
  book: Book;
  onClick: () => void;
}
export default function BookCard({ book, onClick }: Props) {
  const coverUrl = getCoverUrl(book?.image_path ?? "");

  return (
    <Card onClick={onClick}>
      <CardHeader>
        {book?.image_path && (
          <div className="relative w-full h-56 mb-2">
            <Image
              src={coverUrl ?? ""}
              alt={book?.title}
              fill
              className="object-cover rounded-md"
            />
          </div>
        )}
        <CardTitle>{book?.title}</CardTitle>
        <CardDescription>{book?.author}</CardDescription>
      </CardHeader>
    </Card>
  );
}
