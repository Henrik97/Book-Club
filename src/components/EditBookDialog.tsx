"use client";

import { useState, useEffect } from "react";
import { Book } from "@/types/models";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: Book;
  onSaved?: () => void;
}

export default function EditBookDialog({
  open,
  onOpenChange,
  book,
  onSaved,
}: Props) {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [description, setDescription] = useState(book.description ?? "");
  const [physicalBookLink, setPhysicalBookLink] = useState(
    book.physical_book_link ?? "",
  );
  const [audioBookLink, setAudioBookLink] = useState(
    book.audio_book_link ?? "",
  );

  useEffect(() => {
    if (!open) return;
    setTitle(book.title);
    setAuthor(book.author);
    setDescription(book.description ?? "");
    setPhysicalBookLink(book.physical_book_link ?? "");
    setAudioBookLink(book.audio_book_link ?? "");
  }, [open, book]);

  async function handleSave() {
    setSaving(true);

    const { error } = await supabase
      .from("books")
      .update({
        title: title.trim(),
        author: author.trim(),
        description: description.trim() || null,
        physical_book_link: physicalBookLink.trim() || null,
        audio_book_link: audioBookLink.trim() || null,
      })
      .eq("id", book.id);

    setSaving(false);

    if (error) {
      console.error(error.message);
      return;
    }

    onOpenChange(false);
    onSaved?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit book</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium">Author</label>
            <Input value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              className="min-h-[120px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Physical book link</label>
            <Input
              value={physicalBookLink}
              onChange={(e) => setPhysicalBookLink(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Audio book link</label>
            <Input
              value={audioBookLink}
              onChange={(e) => setAudioBookLink(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
