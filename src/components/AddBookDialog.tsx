import { Field, FieldSet, FieldTitle } from "@/components/ui/field";
import { createClient } from "@/lib/supabase/client";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useRef, useState } from "react";
import ImageUploader from "./ImageUploader";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BookForm {
  title: string;
  author: string;
  imagePath?: string;
}

export default function AddBookDialog({ open, onOpenChange }: Props) {
  const [form, setForm] = useState<BookForm>({
    title: "",
    author: "",
    imagePath: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const supabase = createClient();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        author: form.author.trim(),
        image_path: form.imagePath?.trim() || null,
      };

      const { data, error: supabaseError } = await supabase
        .from("books")
        .insert([payload])
        .select()
        .single();

      if (supabaseError) throw supabaseError;
      setForm({ title: "", author: "" });
      formRef.current?.reset(); // optional
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to add book";
      console.error(err);
      setError(message ?? "Failed to add book.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setForm({ title: "", author: "", imagePath: "" });
    setError(null);
    formRef.current?.reset();
    onOpenChange(false);
  }

  function handleUploadComplete({ path }: { path: string }) {
    // store both path & public url (if available)
    setForm((p) => ({ ...p, imagePath: path }));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Add Book</DialogTitle>
        <form ref={formRef} onSubmit={handleSubmit}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            {/* Left: image / uploader */}
            <div style={{ marginRight: "20px" }}>
              <ImageUploader onUploadComplete={handleUploadComplete} />
            </div>
            <FieldSet>
              <FieldTitle>Title</FieldTitle>
              <Input
                id="title"
                name="title"
                placeholder="Title"
                value={form.title}
                onChange={handleChange}
                required
              />
              <FieldTitle>Author</FieldTitle>
              <Input
                id="author"
                name="author"
                placeholder="Author"
                value={form.author}
                onChange={handleChange}
              />
              <FieldTitle>Audio Book</FieldTitle>
              <Input placeholder="Links" />
              <FieldTitle>Audio Book</FieldTitle>
              <Input placeholder="Links" />
            </FieldSet>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
