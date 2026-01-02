import { NextResponse } from "next/server";

function extractMeta(html: string, propertyOrName: string) {
  // matches: <meta property="og:title" content="...">
  // OR:     <meta name="author" content="...">
  const regex = new RegExp(
    `<meta\\s+(?:property|name)=["']${propertyOrName}["']\\s+content=["']([^"']+)["']`,
    "i",
  );
  const match = html.match(regex);
  return match?.[1]?.trim() ?? null;
}

function cleanTitle(title: string) {
  return title.replace(/\s+\|\s+Goodreads$/i, "").trim();
}

function extractGoodreadsAuthorFromHtml(html: string) {
  // Most common pattern:
  // <span class="ContributorLink__name" data-testid="name">Author Name</span>
  const match = html.match(
    /ContributorLink__name[^>]*data-testid=["']name["'][^>]*>([^<]+)</i,
  );
  return match?.[1]?.trim() ?? "";
}

function parseAuthorFromDescription(desc: string | null) {
  if (!desc) return "";
  const parts = desc.split(" by ");
  if (parts.length >= 2) return parts.slice(1).join(" by ").trim();
  return "";
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; BookClubBot/1.0; +https://example.com)",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL (${res.status})` },
        { status: 400 },
      );
    }

    const html = await res.text();

    // title + cover always from OG
    const ogTitle = extractMeta(html, "og:title");
    const ogImage = extractMeta(html, "og:image");
    const ogDescription = extractMeta(html, "og:description");

    if (!ogTitle) {
      return NextResponse.json(
        { error: "Could not find og:title on this page" },
        { status: 400 },
      );
    }

    const title = cleanTitle(ogTitle);

    const metaAuthor =
      extractMeta(html, "author") ||
      extractMeta(html, "books:author") ||
      extractMeta(html, "og:book:author");

    // ✅ Goodreads fallback: parse from HTML
    const htmlAuthor = extractGoodreadsAuthorFromHtml(html);

    const author =
      metaAuthor || htmlAuthor || parseAuthorFromDescription(ogDescription);

    return NextResponse.json({
      title,
      author,
      coverUrl: ogImage,
      description: ogDescription,
      sourceUrl: url,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Unknown error parsing book metadata" },
      { status: 500 },
    );
  }
}
