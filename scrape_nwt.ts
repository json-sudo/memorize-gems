// scrape-nwt.ts
import axios from "axios";
import * as cheerio from "cheerio";
import { createWriteStream } from "fs";
import { format } from "@fast-csv/format";

type Book = { name: string; slug: string; chapters: number };

const BOOKS: Book[] = [
    { name: "Genesis", slug: "genesis", chapters: 50 },
    { name: "Exodus", slug: "exodus", chapters: 40 },
    { name: "Leviticus", slug: "leviticus", chapters: 27 },
    { name: "Numbers", slug: "numbers", chapters: 36 },
    { name: "Deuteronomy", slug: "deuteronomy", chapters: 34 },
    { name: "Joshua", slug: "joshua", chapters: 24 },
    { name: "Judges", slug: "judges", chapters: 21 },
    { name: "Ruth", slug: "ruth", chapters: 4 },
    { name: "1 Samuel", slug: "1-samuel", chapters: 31 },
    { name: "2 Samuel", slug: "2-samuel", chapters: 24 },
    { name: "1 Kings", slug: "1-kings", chapters: 22 },
    { name: "2 Kings", slug: "2-kings", chapters: 25 },
    { name: "1 Chronicles", slug: "1-chronicles", chapters: 29 },
    { name: "2 Chronicles", slug: "2-chronicles", chapters: 36 },
    { name: "Ezra", slug: "ezra", chapters: 10 },
    { name: "Nehemiah", slug: "nehemiah", chapters: 13 },
    { name: "Esther", slug: "esther", chapters: 10 },
    { name: "Job", slug: "job", chapters: 42 },
    { name: "Psalms", slug: "psalms", chapters: 150 },
    { name: "Proverbs", slug: "proverbs", chapters: 31 },
    { name: "Ecclesiastes", slug: "ecclesiastes", chapters: 12 },
    { name: "Song of Solomon", slug: "song-of-solomon", chapters: 8 },
    { name: "Isaiah", slug: "isaiah", chapters: 66 },
    { name: "Jeremiah", slug: "jeremiah", chapters: 52 },
    { name: "Lamentations", slug: "lamentations", chapters: 5 },
    { name: "Ezekiel", slug: "ezekiel", chapters: 48 },
    { name: "Daniel", slug: "daniel", chapters: 12 },
    { name: "Hosea", slug: "hosea", chapters: 14 },
    { name: "Joel", slug: "joel", chapters: 3 },
    { name: "Amos", slug: "amos", chapters: 9 },
    { name: "Obadiah", slug: "obadiah", chapters: 1 },
    { name: "Jonah", slug: "jonah", chapters: 4 },
    { name: "Micah", slug: "micah", chapters: 7 },
    { name: "Nahum", slug: "nahum", chapters: 3 },
    { name: "Habakkuk", slug: "habakkuk", chapters: 3 },
    { name: "Zephaniah", slug: "zephaniah", chapters: 3 },
    { name: "Haggai", slug: "haggai", chapters: 2 },
    { name: "Zechariah", slug: "zechariah", chapters: 14 },
    { name: "Malachi", slug: "malachi", chapters: 4 },
    { name: "Matthew", slug: "matthew", chapters: 28 },
    { name: "Mark", slug: "mark", chapters: 16 },
    { name: "Luke", slug: "luke", chapters: 24 },
    { name: "John", slug: "john", chapters: 21 },
    { name: "Acts", slug: "acts", chapters: 28 },
    { name: "Romans", slug: "romans", chapters: 16 },
    { name: "1 Corinthians", slug: "1-corinthians", chapters: 16 },
    { name: "2 Corinthians", slug: "2-corinthians", chapters: 13 },
    { name: "Galatians", slug: "galatians", chapters: 6 },
    { name: "Ephesians", slug: "ephesians", chapters: 6 },
    { name: "Philippians", slug: "philippians", chapters: 4 },
    { name: "Colossians", slug: "colossians", chapters: 4 },
    { name: "1 Thessalonians", slug: "1-thessalonians", chapters: 5 },
    { name: "2 Thessalonians", slug: "2-thessalonians", chapters: 3 },
    { name: "1 Timothy", slug: "1-timothy", chapters: 6 },
    { name: "2 Timothy", slug: "2-timothy", chapters: 4 },
    { name: "Titus", slug: "titus", chapters: 3 },
    { name: "Philemon", slug: "philemon", chapters: 1 },
    { name: "Hebrews", slug: "hebrews", chapters: 13 },
    { name: "James", slug: "james", chapters: 5 },
    { name: "1 Peter", slug: "1-peter", chapters: 5 },
    { name: "2 Peter", slug: "2-peter", chapters: 3 },
    { name: "1 John", slug: "1-john", chapters: 5 },
    { name: "2 John", slug: "2-john", chapters: 1 },
    { name: "3 John", slug: "3-john", chapters: 1 },
    { name: "Jude", slug: "jude", chapters: 1 },
    { name: "Revelation", slug: "revelation", chapters: 22 },
];

// --- FULL MAP (replace the 3 lines above with full set) ---
// I’m leaving only 3 rows here to keep this snippet brief.
// I’ll include a full mapping just after this file so you can paste it in.
// ---------------------------------------------------------

// Friendly delay
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchChapter(book: Book, chapter: number): Promise<string> {
    const url = `https://www.jw.org/en/library/bible/study-bible/books/${book.slug}/${chapter}/`;
    const res = await axios.get(url, {
        headers: {
            "User-Agent": "mem-gems/1.0 (+https://example.com)",
            "Accept-Language": "en-US,en;q=0.9",
        },
        timeout: 20000,
    });
    return res.data as string;
}

function extractVerses(html: string): { v: number; text: string }[] {
    // Focus only on the main content above "Footnotes" and "Study Notes"
    const $ = cheerio.load(html);
    // Get the chapter title node and the paragraph block that follows
    // (markup occasionally shifts; so we fall back to slicing text)
    const h1 = $("h1").first().text();
    let mainText = $("main, article, body").first().text();

    // Truncate at "Footnotes" or "Study Notes" if present
    const cutAt = ["Footnotes", "Study Notes", "Media"];
    for (const marker of cutAt) {
        const idx = mainText.indexOf(marker);
        if (idx > 0) {
            mainText = mainText.slice(0, idx);
        }
    }

    // Normalize whitespace and convert any Unicode superscript digits we might keep
    const SUP: Record<string, string> = {'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9'};
    mainText = mainText.replace(/[\u00A0]/g, " ").replace(/\s+/g, " ");
    mainText = mainText.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (m) => m.split("").map(ch => SUP[ch] ?? ch).join(""));

    // Heuristic split: verses are shown as "<num> " repeatedly in sequence.
    // We force a split at the *first* " 1 " we see after the h1.
    const afterTitle = mainText.replace(h1, " ");

    // Insert a pipe before a digit that looks like a verse marker:
    // - preceded by start or space
    // - followed by space
    const piped = afterTitle.replace(/(^|\s)(\d{1,3})\s/g, (m, pre, d) => `${pre}|${d} `);

    const chunks = piped.split("|").filter(Boolean);
    const verses: { v: number; text: string }[] = [];
    let last = 0;
    for (const ch of chunks) {
        const m = ch.match(/^(\d{1,3})\s+(.*)$/);
        if (!m) continue;
        const v = parseInt(m[1], 10);
        if (!Number.isFinite(v)) continue;
        // ignore if verse numbers go backwards or jump crazy (bad split)
        if (v < last || v > last + 50) continue;
        last = v;
        let text = m[2].trim();
        if (text.length === 0) continue;
        verses.push({ v, text });
    }
    return verses;
}

async function run() {
    const out = createWriteStream("scriptures_clean.csv", { encoding: "utf-8" });
    const csv = format({ headers: true });
    csv.pipe(out);
    csv.write({ book: "book", chapter: "chapter", verse_from: "verse_from", verse_to: "verse_to", verse_content: "verse_content" });

    for (const book of BOOKS) {
        for (let c = 1; c <= book.chapters; c++) {
            try {
                const html = await fetchChapter(book, c);
                const verses = extractVerses(html);
                for (const { v, text } of verses) {
                    csv.write({ book: book.name, chapter: c, verse_from: v, verse_to: "", verse_content: text });
                }
                console.log(`OK  ${book.name} ${c} (${verses.length} verses)`);
                await sleep(500); // be polite
            } catch (err: any) {
                console.warn(`WARN ${book.name} ${c}: ${err?.message || err}`);
            }
        }
    }

    csv.end();
    console.log("Done → scriptures_clean.csv");
}

run().catch(e => { console.error(e); process.exit(1); });
