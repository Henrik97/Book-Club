import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { getCoverUrl } from "@/helpers/coverUrl";
import { Book } from "@/types/models";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import EditBookDialog from "./EditBookDialog";

interface BookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: Book;
  onDeleted?: () => void;
  onUpdated?: () => void;
}

export function BookDialog({
  open,
  onOpenChange,
  book,
  onDeleted,
  onUpdated,
}: BookDialogProps) {
  const supabase = createClient();

  const [deleting, setDeleting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  if (!book) return null;

  const coverUrl =
    book.image_url ||
    (book.image_path
      ? getCoverUrl(book.image_path)
      : "/no_cover_available.png");

  const isRemote = coverUrl.startsWith("http");

  async function handleDelete() {
    const ok = window.confirm(`Delete "${book.title}"? This cannot be undone.`);
    if (!ok) return;

    setDeleting(true);

    const { error } = await supabase.from("books").delete().eq("id", book.id);

    setDeleting(false);

    if (error) {
      console.error(error.message);
      return;
    }

    onOpenChange(false);
    onDeleted?.();
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{book.title}</DialogTitle>
            <p className="text-sm text-muted-foreground">{book.author}</p>
          </DialogHeader>

          <div className="grid grid-cols-[180px_1fr] gap-6">
            {/* Cover */}
            <div className="w-[180px]">
              <div className="relative w-full aspect-[3/4] overflow-hidden rounded-md border bg-muted">
                <Image
                  src={coverUrl}
                  alt={book.title}
                  fill
                  className="object-cover"
                  sizes="180px"
                  unoptimized={isRemote}
                />
              </div>
            </div>

            {/* Info */}
            <div className="space-y-4">
              {/* Description */}
              <div>
                <p className="text-sm font-medium">Description</p>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {book.description?.trim() || "No description yet."}
                </p>
              </div>

              {/* Links */}
              {(book.physical_book_link || book.audio_book_link) && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Links</p>

                  {book.physical_book_link && (
                    <a
                      href={book.physical_book_link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm underline text-primary block"
                    >
                      Physical book link
                    </a>
                  )}

                  {book.audio_book_link && (
                    <a
                      href={book.audio_book_link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm underline text-primary block"
                    >
                      Audio book link
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditOpen(true)}>
                Edit
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <EditBookDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        book={book}
        onSaved={() => {
          setEditOpen(false);
          onUpdated?.();
        }}
      />
    </>
  );
}
