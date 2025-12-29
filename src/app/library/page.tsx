"use client";
import BookCard from "@/components/BookCard";
import { useState, useEffect } from "react";
import { BookDialog } from "@/components/BookDialog";
import { Book } from "@/models/book";
import { Button } from "@/components/ui/button";
import AddBookDialog from "@/components/AddBookDialog";
import { createClient } from "@/lib/supabase/client";

export default function Library() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book>();
  const [bookDialogOpen, setBookDialogOpen] = useState<boolean>(false);
  const [addBookDialogOpen, setAddBookDialogOpen] = useState<boolean>(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchBooks = async () => {
      const { data, error } = await supabase.from("books").select("*");
      if (error) {
        console.error("Error fetching books:", error.message);
      } else {
        setBooks(data || []);
      }
    };

    fetchBooks();
  }, []);

  function handleClick(newSelectedBook: Book) {
    setSelectedBook(newSelectedBook);
    setBookDialogOpen(true);
  }

  function handleOpenChange() {
    setBookDialogOpen(false);
  }

  return (
    <>
      <Button onClick={() => setAddBookDialogOpen(true)}> Add Book +</Button>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onClick={() => handleClick(book)}
          />
        ))}
      </div>
      {selectedBook && (
        <BookDialog
          book={selectedBook}
          open={bookDialogOpen}
          onOpenChange={handleOpenChange}
        />
      )}
      <AddBookDialog
        open={addBookDialogOpen}
        onOpenChange={setAddBookDialogOpen}
      />
    </>
  );
}
