import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import ImageUploader from "./ImageUploader";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BookForm {
  title: string;
  author: string;
  imagePath?: string;
  imageUrl?: string;
  physicalBookLink: string;
  physicalAudioLink: string;
  description: string;
}

const emptyForm: BookForm = {
  title: "",
  author: "",
  imagePath: "",
  imageUrl: "",
  physicalBookLink: "",
  physicalAudioLink: "",
  description: "",
};

export default function AddBookDialog({ open, onOpenChange }: Props) {
  const supabase = createClient();
  const formRef = useRef<HTMLFormElement | null>(null);

  const [form, setForm] = useState<BookForm>(emptyForm);

  const [bookUrl, setBookUrl] = useState("");
  const [fetching, setFetching] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetAll() {
    setForm(emptyForm);
    setBookUrl("");
    setError(null);
    formRef.current?.reset();
  }

  function handleClose() {
    resetAll();
    onOpenChange(false);
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleUploadComplete({ path }: { path: string }) {
    setForm((prev) => ({
      ...prev,
      imagePath: path,
      imageUrl: "", // remove remote cover if user uploads a new one
    }));
  }

  async function fetchMetadata() {
    if (!bookUrl.trim()) return;

    setFetching(true);
    setError(null);

    try {
      const res = await fetch("/api/book-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: bookUrl.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to fetch metadata");
      }

      setForm((prev) => ({
        ...prev,
        title: data.title || prev.title,
        author: data.author || prev.author,
        imageUrl: data.coverUrl || prev.imageUrl,
        description: data.description || prev.description,
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Fetch failed";
      setError(message);
    } finally {
      setFetching(false);
    }
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
        description: form.description.trim() || null,
        image_path: form.imagePath?.trim() || null,
        image_url: form.imageUrl?.trim() || null,
        physical_book_link: form.physicalBookLink.trim() || null,
        audio_book_link: form.physicalAudioLink.trim() || null,
      };

      const { error: supabaseError } = await supabase
        .from("books")
        .insert([payload]);

      if (supabaseError) throw supabaseError;

      resetAll();
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to add book.";
      console.error(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const coverPreview = form.imageUrl
    ? form.imageUrl
    : form.imagePath
      ? null // you can show storage preview later
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add book</DialogTitle>
        </DialogHeader>

        {/* Fetch section */}
        <div className="rounded-lg border p-3 space-y-2">
          <p className="text-sm font-medium">Fetch details from Goodreads</p>
          <div className="flex gap-2">
            <Input
              value={bookUrl}
              onChange={(e) => setBookUrl(e.target.value)}
              placeholder="https://www.goodreads.com/book/show/..."
            />
            <Button
              type="button"
              onClick={fetchMetadata}
              disabled={fetching || !bookUrl.trim()}
            >
              {fetching ? "Fetching..." : "Fetch"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Paste a Goodreads link to auto-fill title, author, and cover.
          </p>
        </div>

        <Separator />

        {/* Main form */}
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-[180px_1fr] gap-6">
            {/* LEFT: Cover */}
            <div className="space-y-2">
              <div className="w-[180px] h-[260px] rounded-md overflow-hidden border bg-muted flex items-center justify-center">
                {form.imageUrl ? (
                  <img
                    src={form.imageUrl}
                    alt="cover preview"
                    className="w-full h-full"
                  />
                ) : (
                  <ImageUploader onUploadComplete={handleUploadComplete} />
                )}
              </div>

              {form.imageUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setForm((prev) => ({ ...prev, imageUrl: "" }))}
                >
                  Remove cover
                </Button>
              )}
            </div>

            {/* RIGHT: Fields */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  name="title"
                  placeholder="Title"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Author</label>
                <Input
                  name="author"
                  placeholder="Author"
                  value={form.author}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">
                    Physical book link
                  </label>
                  <Input
                    name="physicalBookLink"
                    placeholder="https://..."
                    value={form.physicalBookLink}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Audio book link</label>
                  <Input
                    name="physicalAudioLink"
                    placeholder="https://..."
                    value={form.physicalAudioLink}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  name="description"
                  placeholder="Short description..."
                  value={form.description}
                  onChange={handleChange}
                  className="min-h-[110px]"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading || fetching}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={loading || fetching}>
              {loading ? "Saving..." : "Add book"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
