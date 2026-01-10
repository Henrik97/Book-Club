import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnon) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Check your .env.local",
  );
}

const supabase = createClient(supabaseUrl, supabaseAnon);

type BookRow = {
  startMonth: number;
  endMonth: number;
  title: string;
  author: string;
};

const YEAR = 2023;

const readings: BookRow[] = [
  { startMonth: 1, endMonth: 1, title: "The Odyssey", author: "Homer" },
  { startMonth: 2, endMonth: 2, title: "Exodus", author: "Moses" }, // 2nd book of Old Testament
  {
    startMonth: 3,
    endMonth: 3,
    title: "The Making of the Atomic Bomb",
    author: "Richard Rhodes",
  },
  {
    startMonth: 4,
    endMonth: 4,
    title: "The Rape of Nanking",
    author: "Iris Chang",
  },
  {
    startMonth: 5,
    endMonth: 5,
    title: "The Gallic War",
    author: "Julius Caesar",
  },
  { startMonth: 6, endMonth: 6, title: "Frankenstein", author: "Mary Shelley" },
  { startMonth: 7, endMonth: 7, title: "Catch-22", author: "Joseph Heller" },
  { startMonth: 8, endMonth: 8, title: "The Italian", author: "Ann Radcliffe" },
  {
    startMonth: 9,
    endMonth: 9,
    title: "The Metamorphosis",
    author: "Franz Kafka",
  },
  {
    startMonth: 10,
    endMonth: 10,
    title: "Demons",
    author: "Fyodor Dostoevsky",
  },
  { startMonth: 11, endMonth: 11, title: "Lolita", author: "Vladimir Nabokov" },
  {
    startMonth: 12,
    endMonth: 12,
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
  },
];

// ----------------------
// Helpers
// ----------------------

async function fetchCoverUrl(title: string, author: string) {
  try {
    const query = encodeURIComponent(`${title} ${author}`);
    const res = await fetch(
      `https://openlibrary.org/search.json?q=${query}&limit=5`,
    );

    const data = await res.json();
    const docs = data?.docs ?? [];
    if (!docs.length) return null;

    const best = docs.find((d: any) => d.cover_i) ?? docs[0];
    if (!best.cover_i) return null;

    return `https://covers.openlibrary.org/b/id/${best.cover_i}-L.jpg`;
  } catch {
    return null;
  }
}

function normalizeMonth(m: number) {
  return Math.min(12, Math.max(1, m));
}

// ----------------------
// Import script
// ----------------------

async function run() {
  console.log(`📅 Importing reading year ${YEAR}...\n`);

  for (const entry of readings) {
    const title = entry.title.trim();
    const author = entry.author.trim();
    const startMonth = normalizeMonth(entry.startMonth);
    const endMonth = normalizeMonth(entry.endMonth);

    console.log(`📚 ${title} — ${author} (${startMonth}-${endMonth})`);

    // 1) fetch cover url
    const coverUrl = await fetchCoverUrl(title, author);

    if (coverUrl) console.log(`   🖼 cover found`);
    else console.log(`   ⚠️ cover not found`);

    // 2) upsert into books
    const { data: bookRow, error: bookError } = await supabase
      .from("books")
      .upsert(
        [
          {
            title,
            author,
            image_url: coverUrl,
          },
        ],
        { onConflict: "title,author" },
      )
      .select()
      .single();

    if (bookError || !bookRow) {
      console.error(`   ❌ book upsert failed:`, bookError?.message);
      continue;
    }

    console.log(`   ✅ book saved (id: ${bookRow.id})`);

    // 3) upsert into readings
    const { error: readingError } = await supabase.from("readings").upsert(
      [
        {
          book_id: bookRow.id,
          year: YEAR,
          start_month: startMonth,
          end_month: endMonth,
        },
      ],
      { onConflict: "year,book_id" },
    );

    if (readingError) {
      console.error(`   ❌ reading upsert failed:`, readingError.message);
      continue;
    }

    console.log(`   ✅ reading saved\n`);
  }

  console.log("🎉 Finished importing reading year!");
}

run();
