"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Book } from "@/types/models";
import { getCoverUrl } from "@/helpers/coverUrl";
import Image from "next/image";
import { Lock } from "lucide-react";

type Props = {
  readingId: string;
  book: Book;
  locked?: boolean;
};

export default function TierBookCard({ readingId, book, locked }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: readingId,
    disabled: locked,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const coverUrl =
    book.image_url ||
    (book.image_path
      ? getCoverUrl(book.image_path)
      : "/no_cover_available.png");

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative w-22.5 h-32.5 rounded-md overflow-hidden border bg-muted cursor-grab
        transition hover:scale-[1.03] hover:shadow-md
        ${isDragging ? "opacity-60 scale-105 shadow-lg" : ""}
        ${locked ? "opacity-40 cursor-not-allowed hover:scale-100" : ""}`}
      title={locked ? "Not finished yet" : book.title}
    >
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

      {locked && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="flex items-center gap-1 text-white text-xs font-semibold">
            <Lock size={14} />
            Locked
          </div>
        </div>
      )}
    </div>
  );
}
