"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book } from "@/types/models";
import { getCoverUrl } from "@/helpers/coverUrl";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type ReadingRow = {
  id: string;
  book_id: string;
  year: number;
  start_month: number;
  end_month: number;
};

function getFirstThursday(year: number, monthIndex0: number) {
  // monthIndex0: 0 = Jan
  const date = new Date(year, monthIndex0, 1);
  const day = date.getDay(); // 0=Sun..4=Thu
  const diffToThu = (4 - day + 7) % 7;
  date.setDate(1 + diffToThu);
  date.setHours(20, 0, 0, 0); // 20:00
  return date;
}

function getNextMeetingDate(now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-based

  const thisMonthMeeting = getFirstThursday(year, month);

  if (now <= thisMonthMeeting) return thisMonthMeeting;

  // otherwise next month
  const nextMonthMeeting = getFirstThursday(year, month + 1);
  return nextMonthMeeting;
}

function formatDateLong(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function Home() {
  const supabase = createClient();

  const [books, setBooks] = useState<Book[]>([]);
  const [readings, setReadings] = useState<ReadingRow[]>([]);
  const [loading, setLoading] = useState(true);

  const now = useMemo(() => new Date(), []);
  const nextMeeting = useMemo(() => getNextMeetingDate(now), [now]);

  const meetingYear = nextMeeting.getFullYear();
  const meetingMonth = nextMeeting.getMonth() + 1; // 1..12

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Books
      const { data: booksData, error: booksError } = await supabase
        .from("books")
        .select("*");

      if (booksError) console.error(booksError.message);
      setBooks(booksData || []);

      // Readings for this year
      const { data: readingsData, error: readingsError } = await supabase
        .from("readings")
        .select("id, book_id, year, start_month, end_month")
        .eq("year", meetingYear);

      if (readingsError) console.error(readingsError.message);
      setReadings((readingsData as ReadingRow[]) || []);

      setLoading(false);
    };

    fetchData();
  }, [supabase, meetingYear]);

  const booksById = useMemo(
    () => new Map(books.map((b) => [b.id, b])),
    [books],
  );

  // Discussion month = end_month + 1 (wrap to Jan)
  const discussionReading = useMemo(() => {
    // Find reading whose discussion month equals meetingMonth
    // discussionMonth: (end_month % 12) + 1
    return readings.find((r) => (r.end_month % 12) + 1 === meetingMonth);
  }, [readings, meetingMonth]);

  const discussionBook = discussionReading
    ? booksById.get(discussionReading.book_id)
    : undefined;

  // Upcoming readings preview: sort by start_month, show next 3
  const upcomingReadings = useMemo(() => {
    const sorted = [...readings].sort((a, b) => a.start_month - b.start_month);

    // pick the ones that haven't fully ended before current month
    const currentMonth = now.getMonth() + 1;
    const upcoming = sorted.filter((r) => r.end_month >= currentMonth);

    return upcoming.slice(0, 3);
  }, [readings, now]);

  const coverUrl =
    discussionBook?.image_url ||
    (discussionBook?.image_path
      ? getCoverUrl(discussionBook.image_path)
      : "/no_cover_available.png");

  return (
    <div className="relative min-h-[calc(100vh-64px)]">
      {/* Background image */}
      <Image
        src="/The_School_of_Athens.jpg"
        alt="The School of Athens"
        fill
        priority
        className="object-cover"
      />

      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-16 space-y-10">
        {/* Hero */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-serif font-semibold text-white drop-shadow">
            In Vino Veritas
          </h1>
          <p className="text-white/80 max-w-xl">
            Gathered on the first Thursday of each month at 20:00 — to discuss
            literature, wine, and the truth found between pages.
          </p>
        </div>

        {/* Meeting + Book */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-background/85 backdrop-blur border-white/10">
            <CardHeader>
              <CardTitle className="text-lg">Next Meeting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xl font-semibold">
                {formatDateLong(nextMeeting)}
              </p>
              <p className="text-sm text-muted-foreground">
                20:00 — First Thursday
              </p>

              <div className="pt-3">
                <Link href={`/readingplan/${meetingYear}`}>
                  <Button size="sm">View reading plan</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/85 backdrop-blur border-white/10">
            <CardHeader>
              <CardTitle className="text-lg">Book for Discussion</CardTitle>
            </CardHeader>

            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : discussionBook ? (
                <div className="flex gap-4">
                  <div className="relative w-20 h-28 shrink-0 overflow-hidden rounded-md border">
                    <Image
                      src={coverUrl}
                      alt={discussionBook.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold truncate">
                      {discussionBook.title}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {discussionBook.author}
                    </p>

                    <p className="text-xs text-muted-foreground mt-2">
                      Discussed after the reading period ends.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No book scheduled for this meeting yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Mini timeline preview */}
        <Card className="bg-background/85 backdrop-blur border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Plan</CardTitle>
          </CardHeader>

          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : upcomingReadings.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No readings planned for this year yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-4">
                {upcomingReadings.map((r) => {
                  const book = booksById.get(r.book_id);
                  if (!book) return null;

                  const coverUrl =
                    discussionBook?.image_url ||
                    (discussionBook?.image_path
                      ? getCoverUrl(discussionBook.image_path)
                      : "/no_cover_available.png");

                  return (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 rounded-md border bg-background/70 p-3 w-full sm:w-[320px]"
                    >
                      <div className="relative w-12 h-16 shrink-0 overflow-hidden rounded-md border">
                        <Image
                          src={coverUrl}
                          alt={book.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {book.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {book.author}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Months: {r.start_month} → {r.end_month}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
