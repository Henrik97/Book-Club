import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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

const YEAR = 2022;

const readings: BookRow[] = [
  {
    startMonth: 1,
    endMonth: 1,
    title: "Hamlet",
    author: "William Shakespeare",
  },
  {
    startMonth: 2,
    endMonth: 2,
    title: "Crime and Punishment",
    author: "Fyodor Dostoevsky",
  },
  {
    startMonth: 3,
    endMonth: 3,
    title: "Ordinary Men",
    author: "Christopher R. Browning",
  },
  {
    startMonth: 4,
    endMonth: 4,
    title: "One Day in the Life of Ivan Denisovich",
    author: "Aleksandr Solzhenitsyn",
  },
  {
    startMonth: 5,
    endMonth: 5,
    title: "East of Eden",
    author: "John Steinbeck",
  },
  {
    startMonth: 6,
    endMonth: 6,
    title: "Beyond Good and Evil",
    author: "Friedrich Nietzsche",
  },
  {
    startMonth: 7,
    endMonth: 7,
    title: "Barbarians at the Gate",
    author: "Bryan Burrough",
  },
  {
    startMonth: 8,
    endMonth: 8,
    title: "Fahrenheit 451",
    author: "Ray Bradbury",
  },
  {
    startMonth: 9,
    endMonth: 9,
    title: "Metro 2033",
    author: "Dmitry Glukhovsky",
  },
  {
    startMonth: 10,
    endMonth: 10,
    title: "The Myth of Sisyphus",
    author: "Albert Camus",
  },
  {
    startMonth: 11,
    endMonth: 11,
    title: "Twenty Thousand Leagues Under the Sea",
    author: "Jules Verne",
  },
  {
    startMonth: 12,
    endMonth: 12,
    title: "Lord of the Flies",
    author: "William Golding",
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

    // Pick best candidate: cover + closest title
    const best = docs.find((d: any) => d.cover_i) ?? docs[0];
    if (!best.cover_i) return null;

    return `https://covers.openlibrary.org/b/id/${best.cover_i}-L.jpg`;
  } catch {
    return null;
  }
}

function normalizeMonth(m: number) {
  if (m < 1) return 1;
  if (m > 12) return 12;
  return m;
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

    if (coverUrl) {
      console.log(`   🖼️ cover found: ${coverUrl}`);
    } else {
      console.log(`   ⚠️ cover not found`);
    }

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
