import Image from "next/image";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { getCoverUrl } from "@/helpers/coverUrl";
import { Book } from "@/types/models";
interface Props {
  book: Book;
  onClick: () => void;
}
export default function BookCard({ book, onClick }: Props) {
  const coverUrl = getCoverUrl(book.image_path);

  return (
    <Card onClick={onClick}>
      <CardHeader>
        <div className="relative w-full h-56 mb-2">
          <Image
            src={coverUrl}
            alt={book?.title}
            fill
            className="object-cover rounded-md"
          />
        </div>
        <CardTitle>{book?.title}</CardTitle>
        <CardDescription>{book?.author}</CardDescription>
      </CardHeader>
    </Card>
  );
}
