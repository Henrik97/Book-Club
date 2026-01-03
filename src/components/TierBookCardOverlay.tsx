"use client";

import { Book } from "@/types/models";
import { getCoverUrl } from "@/helpers/coverUrl";
import Image from "next/image";

type Props = {
  book: Book;
};

export default function TierBookCardOverlay({ book }: Props) {
  const coverUrl =
    book.image_url ||
    (book.image_path
      ? getCoverUrl(book.image_path)
      : "/no_cover_available.png");

  return (
    <div className="relative w-22.5 h-32.5 rounded-md overflow-hidden border bg-muted shadow-xl">
      <Image
        src={coverUrl}
        alt={book.title}
        fill
        className="object-cover"
        unoptimized
      />
      <div className="absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-1 left-1 right-1 text-[10px] text-white font-medium truncate">
        {book.title}
      </div>
    </div>
  );
}
