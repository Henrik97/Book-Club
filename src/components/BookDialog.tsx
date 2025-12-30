import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCoverUrl } from "@/helpers/coverUrl";
import { Book } from "@/types/models";
import Image from "next/image";

interface BookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: Book;
}

export function BookDialog({ open, onOpenChange, book }: BookDialogProps) {
  if (!book) return null;

  const coverUrl = getCoverUrl(book.image_path);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{book.title}</DialogTitle>
          <p className="text-sm text-muted-foreground">{book.author}</p>
        </DialogHeader>
        <div className="mt-2 space-y-2">
          {book.image_path && (
            <Image
              src={coverUrl || "/placeholder-book.png"}
              alt={book.title}
              className="w-full h-200 object-cover rounded-md"
              width={40}
              height={100}
              unoptimized
            />
          )}
          <p className="text-sm">{book.description || "No description yet."}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
