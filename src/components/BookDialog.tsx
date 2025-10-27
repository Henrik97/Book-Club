import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Book } from "@/models/book";
import Image from "next/image";

interface BookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: Book;
}

export function BookDialog({ open, onOpenChange, book }: BookDialogProps) {
  if (!book) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{book.title}</DialogTitle>
          <p className="text-sm text-muted-foreground">{book.author}</p>
        </DialogHeader>
        <div className="mt-2 space-y-2">
          {book.image_url && (
            <Image
              src={book.image_url}
              alt={book.title}
              className="w-full h-200 object-cover rounded-md"
              width={40}
              height={100}
            />
          )}
          <p className="text-sm">{book.description || "No description yet."}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
