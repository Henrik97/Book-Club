"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import BookCard from "@/components/BookCard";
import { BookDialog } from "@/components/BookDialog";
import { Book } from "@/types/models";
import { Button } from "@/components/ui/button";
import AddBookDialog from "@/components/AddBookDialog";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";

export default function Library() {
  const supabase = useMemo(() => createClient(), []);

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bookDialogOpen, setBookDialogOpen] = useState(false);
  const [addBookDialogOpen, setAddBookDialogOpen] = useState(false);

  const [query, setQuery] = useState("");

  const fetchBooks = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("books")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching books:", error.message);
    } else {
      setBooks(data || []);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  function handleBookClick(book: Book) {
    setSelectedBook(book);
    setBookDialogOpen(true);
  }

  const filteredBooks = useMemo(() => {
    if (!query.trim()) return books;
    const q = query.toLowerCase();
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q),
    );
  }, [books, query]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Library</h1>
          <p className="text-sm text-muted-foreground">
            {books.length} books in your collection
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Input
            className="w-full sm:w-[260px]"
            placeholder="Search title or author..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button onClick={() => setAddBookDialogOpen(true)}>Add Book +</Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading books…</p>
      ) : filteredBooks.length === 0 ? (
        <div className="text-sm text-muted-foreground border rounded-md p-6">
          No books found.
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onClick={() => handleBookClick(book)}
            />
          ))}
        </div>
      )}

      {/* Book Dialog */}
      {selectedBook && (
        <BookDialog
          book={selectedBook}
          open={bookDialogOpen}
          onOpenChange={setBookDialogOpen}
          onDeleted={fetchBooks}
          onUpdated={fetchBooks}
        />
      )}

      {/* Add Book Dialog */}
      <AddBookDialog
        open={addBookDialogOpen}
        onOpenChange={(open) => {
          setAddBookDialogOpen(open);
          // ✅ refresh list when dialog closes after adding a book
          if (!open) fetchBooks();
        }}
      />
    </div>
  );
}
