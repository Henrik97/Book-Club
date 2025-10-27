"use client";
import BookCard from "@/components/BookCard";
import { useState, useEffect } from "react";
import { supabase } from "../util/superbase/client";

interface Book {
  id: string;
  title: string;
  author: string;
  image_url: string;
  description?: string | null;
}

export default function Library() {
  const [books, setBooks] = useState<Book[]>([]);

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

  function handleClick(id: string) {
    console.log(id);
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {books.map((book) => (
        <BookCard
          key={book.id}
          title={book.title}
          author={book.author}
          imageUrl={book.image_url}
          onClick={() => handleClick(book.id)}
        />
      ))}
    </div>
  );
}
