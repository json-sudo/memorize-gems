// scrape_nwt_dom.js — run with `node scrape_nwt_dom.js [options]`
// Deps: axios cheerio @fast-csv/format
const axios = require("axios");
const cheerio = require("cheerio");
const { createWriteStream, existsSync, readFileSync, writeFileSync } = require("fs");
const { format } = require("@fast-csv/format");
const path = require("path");

/** Canonical book list */
const BOOKS = [
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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parseArgs(argv) {
    const args = {};
    for (let i = 2; i < argv.length; i++) {
        const a = argv[i], next = argv[i + 1];
        if (a === "--out") { args.out = next; i++; }
        else if (a === "--books") { args.books = next; i++; }
        else if (a === "--from") { args.from = next; i++; }
        else if (a === "--to") { args.to = next; i++; }
        else if (a === "--resume") { args.resume = next; i++; }
    }
    if (!args.out) args.out = "scriptures_clean.csv";
    return args;
}

function filterBooks({ books, from, to }) {
    let list = BOOKS.slice();
    if (books) {
        const set = new Set(books.split(",").map(s => s.trim()));
        list = list.filter(b => set.has(b.name));
    } else if (from || to) {
        const idx = Object.fromEntries(list.map((b, i) => [b.name, i]));
        const start = from ? (idx[from] ?? 0) : 0;
        const end = to ? (idx[to] ?? list.length - 1) : (list.length - 1);
        list = list.slice(Math.min(start, end), Math.max(start, end) + 1);
    }
    return list;
}

async function fetchChapter(book, chapter) {
    const url = `https://www.jw.org/en/library/bible/study-bible/books/${book.slug}/${chapter}/`;
    const res = await axios.get(url, {
        headers: {
            "User-Agent": "mem-gems/1.0 (+https://example.com)",
            "Accept-Language": "en-US,en;q=0.9",
        },
        timeout: 25000,
    });
    return res.data;
}

function normalizeSpaces(s) {
    return s.replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
}

function loadCheckpoint(file) {
    if (!file || !existsSync(file)) return { completed: {} };
    try {
        const raw = JSON.parse(readFileSync(file, "utf8"));
        const completed = {};
        for (const [book, arr] of Object.entries(raw.completed || {})) {
            completed[book] = new Set(arr);
        }
        return { completed };
    } catch {
        return { completed: {} };
    }
}

function saveCheckpoint(file, data) {
    if (!file) return;
    const serializable = {};
    for (const [book, set] of Object.entries(data.completed)) {
        serializable[book] = Array.from(set);
    }
    writeFileSync(file, JSON.stringify({ completed: serializable }, null, 2));
}

/**
 * Extract verses using DOM structure:
 * - Each verse is in span.verse
 * - Verse number normally in sup.verseNum (contains <a> with the number)
 * - Verse 1 often has NO sup.verseNum → infer it from the FIRST span.verse that lacks one
 * - Verse content = text of the verse span after removing sup.verseNum and ALL <a> tags
 */
function extractVerses(html) {
    const $ = cheerio.load(html);

    let $root = $("main");
    if (!$root.length) $root = $("article");
    if (!$root.length) $root = $("body");

    const verses = [];
    let emittedV1 = false;

    $("span.verse", $root).each((_, el) => {
        const $verse = $(el);
        const $sup = $verse.find("sup.verseNum").first();

        let v = null;

        if ($sup.length) {
            const vNumText = ($sup.text() || "").replace(/[^\d]/g, "");
            if (vNumText) v = parseInt(vNumText, 10);
        } else if (!emittedV1) {
            // First verse without explicit sup.verseNum → treat as verse 1
            v = 1;
            emittedV1 = true;
        } else {
            // No number and we already emitted v1 → skip (likely a continuation wrapper)
            return;
        }

        if (!Number.isFinite(v)) return;

        const $clone = $verse.clone();
        $clone.find("sup.verseNum").remove();
        $clone.find("a").remove();

        // normalize text
        let text = normalizeSpaces($clone.text());
        // Remove leading punctuation artifacts sometimes left at the start of v1
        text = text.replace(/^[—–-]\s*/, "");

        if (text) {
            verses.push({ v, text });
        }
    });

    // Deduplicate by verse number, keeping the first occurrence
    const byV = new Map();
    for (const it of verses) {
        if (!byV.has(it.v)) byV.set(it.v, it.text);
    }
    return Array.from(byV.entries()).sort((a, b) => a[0] - b[0]).map(([v, text]) => ({ v, text }));
}

async function run() {
    const args = parseArgs(process.argv);
    const booksToDo = filterBooks(args);
    const isNew = !existsSync(args.out);
    const stream = createWriteStream(args.out, { flags: "a", encoding: "utf-8" });
    const csv = format({ headers: isNew });
    csv.pipe(stream);

    const state = loadCheckpoint(args.resume);

    for (const book of booksToDo) {
        if (!state.completed[book.name]) state.completed[book.name] = new Set();

        for (let c = 1; c <= book.chapters; c++) {
            if (state.completed[book.name].has(c)) {
                console.log(`SKIP ${book.name} ${c} (resume)`);
                continue;
            }
            try {
                const html = await fetchChapter(book, c);
                const verses = extractVerses(html);

                if (verses.length <= 2 && !["Obadiah","Philemon","2 John","3 John","Jude"].includes(book.name)) {
                    console.warn(`! Suspiciously few verses: ${book.name} ${c} → ${verses.length}`);
                }

                for (const { v, text } of verses) {
                    csv.write({ book: book.name, chapter: c, verse_from: v, verse_to: "", verse_content: text });
                }

                console.log(`OK   ${book.name} ${c} (${verses.length} verses)`);
                state.completed[book.name].add(c);
                saveCheckpoint(args.resume, state);
                await sleep(400);
            } catch (err) {
                console.warn(`WARN ${book.name} ${c}: ${err.message || err}`);
                await sleep(1000);
            }
        }
    }

    csv.end();
    console.log(`Done → ${path.resolve(args.out)}`);
    if (args.resume) console.log(`Checkpoint saved → ${path.resolve(args.resume)}`);
}

run().catch((e) => {
    console.error(e);
    process.exit(1);
});
