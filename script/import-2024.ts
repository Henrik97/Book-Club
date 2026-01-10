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

const YEAR = 2024;

// ✅ 13 books → last 2 books placed in December (month 12)
const readings: BookRow[] = [
  {
    startMonth: 1,
    endMonth: 1,
    title: "Les Misérables",
    author: "Victor Hugo",
  },
  { startMonth: 2, endMonth: 2, title: "The Iliad", author: "Homer" },
  {
    startMonth: 3,
    endMonth: 3,
    title: "The Idiot",
    author: "Fyodor Dostoevsky",
  },
  {
    startMonth: 4,
    endMonth: 4,
    title: "Plato: Selected Works",
    author: "Plato",
  },
  { startMonth: 5, endMonth: 5, title: "Inferno", author: "Dante Alighieri" },
  { startMonth: 6, endMonth: 6, title: "Oedipus Rex", author: "Sophocles" },
  {
    startMonth: 7,
    endMonth: 7,
    title: "A Christmas Carol",
    author: "Charles Dickens",
  },
  { startMonth: 8, endMonth: 8, title: "Lysistrata", author: "Aristophanes" },
  { startMonth: 9, endMonth: 9, title: "Birdsong", author: "Sebastian Faulks" },
  {
    startMonth: 10,
    endMonth: 10,
    title: "Liar's Poker",
    author: "Michael Lewis",
  },
  {
    startMonth: 11,
    endMonth: 11,
    title: "How Much Land Does a Man Need?",
    author: "Leo Tolstoy",
  },

  // December has two books:
  {
    startMonth: 12,
    endMonth: 12,
    title: "Kongens Fald",
    author: "Johannes V. Jensen",
  },
  {
    startMonth: 12,
    endMonth: 12,
    title: "The Scarlet Letter",
    author: "Nathaniel Hawthorne",
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

    const coverUrl = await fetchCoverUrl(title, author);

    if (coverUrl) console.log(`   🖼 cover found`);
    else console.log(`   ⚠️ cover not found`);

    // ✅ Upsert book
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

    // ✅ Upsert reading
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
