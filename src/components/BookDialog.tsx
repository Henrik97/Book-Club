import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

interface BookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: {
    title: string;
    author: string;
    description?: string;
    imageUrl?: string;
    rating?: number;
  } | null;
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
          {book.imageUrl && (
            <Image
              src={book.imageUrl}
              alt={book.title}
              className="w-full h-64 object-cover rounded-md"
            />
          )}
          <p className="text-sm">{book.description || "No description yet."}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
