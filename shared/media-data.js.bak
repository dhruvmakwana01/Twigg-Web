/* =========================================================
   TWIGG — SHARED MEDIA DATA   (shared/media-data.js)

   Temporary stand-in for the backend. Home, Loop and Reels
   all READ from this one file; each page keeps its own
   rendering and interaction logic in its own JS file.

   FEEDS (derived automatically from the media type)
     • every item (image OR video) → "home" and "loop"
     • every video                 → also "reels"

   FAIR VISIBILITY (replaces random shuffle)
     TwiggMedia.fairOrder(ids, { columns, avoid, record })
       Orders items so the ones that have had the LEAST
       exposure come first. Exposure is position-weighted:
       a top-row slot counts more than a lower slot, and a
       Loop featured slot counts the most. Scores persist in
       localStorage, so over time every item rotates through
       the best positions.
     TwiggMedia.credit(id, weight)  → add exposure manually
     TwiggMedia.columns()           → grid columns right now
     TwiggMedia.formatDuration(s)   → "1:05"

   FUTURE BACKEND
   Replace RAW below with an API response:

       const res = await fetch("/api/media");
       TwiggMedia.setItems(await res.json());

   and move the exposure map (readExposure / writeExposure)
   to the server.
========================================================= */

(() => {

    "use strict";

    const ASSET_ROOT = "../";

    function assetUrl(path) {
        if (!path) {
            return null;
        }
        return /^(https?:|data:|blob:|\/)/i.test(path)
            ? path
            : ASSET_ROOT + path;
    }

    const photo = id =>
        `https://images.unsplash.com/photo-${id}?auto=format&fit=max&w=900&q=90`;


    /* Captions: description text shown under each post. */

    const CAPTIONS = {
        0: "Fast-paced edits with clean cuts, color grading and sound design for brands, creators and ads.",
        1: "Scroll-stopping social posts designed to match your brand voice. Templates included so you can keep your feed consistent.",
        2: "Memorable logos built from scratch: concept sketches, three directions, unlimited revisions and a full brand file pack.",
        3: "Clean, modern interfaces for web and mobile. From wireframes to a polished, developer-ready design.",
        4: "Bold brand identities that look great everywhere, from business cards to billboards.",
        5: "Smooth motion graphics that bring your message to life.",
        6: "Packaging that sells itself. Structural mockups, print-ready files and eco-friendly material suggestions.",
        7: "Animated logo reveals in 5 to 10 seconds. Delivered in every format you need.",
        8: "Photoreal 3D product animations for launches, ads and online stores.",
        9: "Book interiors and covers designed for print and ebook, with typography that is a pleasure to read.",
        10: "Intro and outro videos that set the tone for your channel.",
        11: "Story-first video editing for YouTube, reels and corporate films.",
        12: "Abstract visuals and campaign-ready social graphics.",
        13: "Creative business visuals made to stand out in a crowded market.",
        14: "Mobile-first app and website design with smooth, thoughtful interactions.",
        15: "Hand-drawn illustration with a modern twist. Perfect for editorials, covers and brand mascots.",
        16: "Color-driven brand design: palettes, gradients and patterns that give your brand its own look.",
        17: "Shelf-ready packaging concepts, from first sketch to print-ready dieline.",
        18: "Animated logos for intros, social profiles and presentations.",
        19: "Workspace and interior visualisations that help clients picture the finished room.",
        20: "Beautiful book layouts, covers and series design.",
        21: "Gallery-style art direction and exhibition graphics.",
        22: "Tech-inspired visuals for startups, apps and product launches.",
        23: "Quick, punchy social edits made for short-form platforms.",
        24: "Abstract art prints and brand textures. Licence-ready and available in high resolution.",
        25: "Modern workspace and web design that helps teams get things done.",
        26: "Brand identity systems: logo, colors, type and guidelines in one tidy package.",
        27: "Illustrated motion pieces: frame-by-frame art with a human touch.",
        28: "Creative packaging for small businesses, designed to look premium on a budget.",
        29: "Logo animations with clean timing and subtle sound design.",
        30: "Packaging walkthroughs and unboxing reels: see how a design feels in the hand. Custom boxes, labels, inserts and finishing options, all explained step by step.",
        31: "Behind the scenes of a full logo design project, from the first sketch to the final lockup.",
        32: "Web and mobile design process: wireframes, prototypes and the finished interface. We design for real people first, and polish second.",
        33: "A quick tour of our book design process: layouts, typefaces and print finishing.",
        34: "Intro and outro templates that make your videos feel professionally produced.",
        35: "Kinetic type and motion graphics that make your message move.",
        36: "Product photography for catalogues, ads and online stores. Clean light, true colors and consistent style across every shot.",
        37: "Color grading for film and social: moody, warm, cinematic or clean. We match your look across every clip."
    };

    /* Every item is on Home + Loop. Every video is also on Reels. */

    function m(id, type, src, title, creator, category, rating, reviews) {

        return {
            id,
            type,
            src,
            thumbnail: null,
            title,
            creator: { name: creator, profileImage: null },
            category,
            rating,
            reviews,
            feeds:
                type === "video"
                    ? ["home", "loop", "reels"]
                    : ["home", "loop"],
            caption: CAPTIONS[id] || ""
        };
    }

    const V = "home/videos/";
    const RV = "reels/videos/";

    const RAW = [

        m(0, "video", V + "b9f4e7d4-ce0a-426a-937e-daebd25f5842.MP4", "Video", "Aarav Studio", "Video Editing", "4.9", "1,204"),
        m(1, "image", photo("1561070791-2526d30994b5"), "Creative design", "Maya Designs", "Social Media Design", "4.8", "94"),
        m(2, "image", photo("1586717791821-3f44a563fa4c"), "Graphic design", "Pixel Forge", "Logo Design", "5.0", "1,875"),
        m(3, "video", V + "d27829dc-6302-47a3-8c71-5f8a157f47e5.MP4", "Video", "Nora Creative", "Web & Mobile Design", "4.7", "2,380"),
        m(4, "image", photo("1558655146-9f40138edfeb"), "Creative branding", "Kabir Motion", "Branding", "4.6", "990"),
        m(5, "video", V + "22512-328261507_medium.mp4", "Video", "Lumen Works", "Motion Graphics", "4.9", "842"),
        m(6, "image", photo("1497366811353-6870744d04b2"), "Interior design", "Aarav Studio", "Packaging Design", "4.5", "445"),
        m(7, "video", V + "22619-328940133_medium.mp4", "Video", "Maya Designs", "Logo Animation", "4.9", "1,204"),
        m(8, "image", photo("1618005198919-d3d4b5a92ead"), "Abstract design", "Pixel Forge", "3D Product Animation", "4.8", "94"),
        m(9, "video", V + "212404_medium.mp4", "Video", "Nora Creative", "Book Design", "5.0", "1,875"),
        m(10, "image", photo("1559028012-481c04fa702d"), "Website design", "Kabir Motion", "Intro & Outro Videos", "4.7", "2,380"),
        m(11, "video", V + "338904_medium.mp4", "Video", "Lumen Works", "Video Editing", "4.6", "990"),
        m(12, "image", photo("1634017839464-5c339ebe3cb4"), "Abstract artwork", "Aarav Studio", "Social Media Design", "4.9", "842"),
        m(13, "image", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsnn_crhJrO4NbGugSy9ofq1PdH5NhJYEPwRsTaV9b6Q&s=10", "Creative business design", "Maya Designs", "Logo Design", "4.5", "445"),
        m(14, "video", V + "364783_medium.mp4", "Video", "Pixel Forge", "Web & Mobile Design", "4.9", "1,204"),
        m(15, "image", photo("1513364776144-60967b0f800f"), "Art and illustration", "Nora Creative", "Branding", "4.8", "94"),
        m(16, "image", photo("1557682250-33bd709cbe85"), "Color design", "Kabir Motion", "Motion Graphics", "5.0", "1,875"),
        m(17, "video", V + "ad509c81-b69a-4021-be22-37d432bd7531.MP4", "Video", "Lumen Works", "Packaging Design", "4.7", "2,380"),
        m(18, "image", photo("1542744095-fcf48d80b0fd"), "Business design", "Aarav Studio", "Logo Animation", "4.6", "990"),
        m(19, "image", photo("1497366754035-f200968a6e72"), "Interior design", "Maya Designs", "3D Product Animation", "4.9", "842"),
        m(20, "video", V + "21d1f8ec-5dab-476d-b3a9-16412b7745b0.MP4", "Video", "Pixel Forge", "Book Design", "4.5", "445"),
        m(21, "image", photo("1561214115-f2f134cc4912"), "Art gallery", "Nora Creative", "Intro & Outro Videos", "4.9", "1,204"),
        m(22, "image", photo("1550745165-9bc0b252726f"), "Creative technology", "Kabir Motion", "Video Editing", "4.8", "94"),
        m(23, "video", V + "6ede3033-72bb-46c7-a61c-c8eaf77445b4.MP4", "Video", "Lumen Works", "Social Media Design", "5.0", "1,875"),
        m(24, "image", photo("1634017839464-5c339ebe3cb4"), "Abstract artwork", "Aarav Studio", "Logo Design", "4.7", "2,380"),
        m(25, "image", photo("1497215728101-856f4ea42174"), "Workspace design", "Maya Designs", "Web & Mobile Design", "4.6", "990"),
        m(26, "video", V + "e75e166b-f8bc-497f-8c07-c557c8d0de77.MP4", "Video", "Pixel Forge", "Branding", "4.9", "842"),
        m(27, "image", photo("1513364776144-60967b0f800f"), "Art and illustration", "Nora Creative", "Motion Graphics", "4.5", "445"),
        m(28, "image", photo("1542744095-fcf48d80b0fd"), "Business creative", "Kabir Motion", "Packaging Design", "4.9", "1,204"),
        m(29, "video", V + "ad3b477e-ccf1-49df-8bfa-ec0b8c80965a.MP4", "Video", "Lumen Works", "Logo Animation", "4.8", "94"),

        m(30, "video", RV + "80444097-841c-4bb7-b7b1-70beedcd4240.mov", "Reel", "Studio Craft", "Packaging Design", "4.9", "1,204"),
        m(31, "video", RV + "4bf27b85-3357-40aa-93eb-759303f8ee52.mov", "Reel", "Markwell Studio", "Logo Design", "4.8", "842"),
        m(32, "video", RV + "2d83975e-223c-400b-a8ce-f30ddc591c53.mov", "Reel", "Pixel & Co", "Web & Mobile Design", "5.0", "2,380"),
        m(33, "video", RV + "75f99231-503c-4f5e-b455-f58ab5063358.MP4", "Reel", "Inkwell Press", "Book Design", "4.5", "94"),
        m(34, "video", RV + "2c8f8923-0e71-4ec0-8159-c665d9ff756e.MP4", "Reel", "Reel Intro Studio", "Intro & Outro Videos", "4.7", "445"),
        m(35, "video", RV + "c377903b-d9cd-485a-bb5b-e29ff8e0c4b5.MP4", "Reel", "Kinetic House", "Motion Graphics", "4.8", "990"),
        m(36, "video", RV + "6e7bd8c9-15be-4677-9a14-18c2cb5b14ca.MP4", "Reel", "Studio Nova", "Product Photography", "4.9", "1,875"),
        m(37, "video", RV + "27da01c8-e09c-4168-afc5-baa39d098c73.MP4", "Reel", "ColorLab Studio", "Color Grading", "5.0", "3,040")
    ];


    /* ---------- store ---------- */

    let items = [];
    let byId = new Map();

    function normalize(raw) {

        const creator = raw.creator || {};

        return Object.freeze({
            id: raw.id,
            type: raw.type === "video" ? "video" : "image",
            src: assetUrl(raw.src),
            thumbnail: assetUrl(raw.thumbnail),
            title: raw.title || "",
            creator: Object.freeze({
                name: creator.name || "Twigg Creator",
                profileImage: assetUrl(creator.profileImage)
            }),
            category: raw.category || "",
            rating: String(raw.rating ?? ""),
            reviews: String(raw.reviews ?? ""),
            feeds: Array.isArray(raw.feeds) ? raw.feeds.slice() : [],
            caption: String(raw.caption ?? "")
        });
    }

    function setItems(list) {
        items = (list || []).map(normalize);
        byId = new Map(items.map(item => [item.id, item]));
    }

    setItems(RAW);


    /* =====================================================
       FAIR VISIBILITY
    ===================================================== */

    const EXPOSURE_KEY = "twigg_exposure_v1";

    /* Random tie-breaker: keeps feeds varied when scores are close */
    const JITTER = 0.4;

    /* Extra score for items someone avoided / just left */
    const AVOID_PENALTY = 2;


    /* Swap these two for server calls once there is a backend */

    function readExposure() {
        try {
            return JSON.parse(
                localStorage.getItem(EXPOSURE_KEY) || "{}"
            ) || {};
        } catch {
            return {};
        }
    }

    function writeExposure(map) {
        try {
            localStorage.setItem(EXPOSURE_KEY, JSON.stringify(map));
        } catch { }
    }


    /* Top rows are seen by more people than lower rows */

    function rowWeight(row) {
        return 1 / Math.log2(row + 2);
    }


    /* Same breakpoints as the CSS grids (3 columns desktop, else 2) */

    function columns() {
        return window.innerWidth <= 1150 ? 2 : 3;
    }


    /*
       CSS columns fill top-to-bottom, so DOM order is
       column 1 (top→bottom), then column 2, then column 3.
       This returns how many items each column holds.
    */

    function columnSizes(n, c) {

        const perColumn = Math.ceil(n / c);
        const sizes = [];

        let left = n;

        for (let i = 0; i < c; i++) {
            const size = Math.min(perColumn, left);
            sizes.push(size);
            left -= size;
        }

        return sizes;
    }


    /*
       Take a list sorted "least exposed first" and deal it
       out ROW BY ROW, so the least-exposed items land in the
       top row of every column instead of all in column 1.
    */

    function arrange(ranked, c) {

        if (c <= 1) {
            return ranked.slice();
        }

        const n = ranked.length;
        const sizes = columnSizes(n, c);

        const starts = [];
        let total = 0;

        sizes.forEach(size => {
            starts.push(total);
            total += size;
        });

        const out = new Array(n);
        const rows = Math.max(...sizes);

        let k = 0;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < c; col++) {
                if (row < sizes[col]) {
                    out[starts[col] + row] = ranked[k++];
                }
            }
        }

        return out;
    }


    function credit(id, weight) {

        const exposure = readExposure();

        exposure[id] = (exposure[id] || 0) + weight;

        writeExposure(exposure);
    }


    function record(order, c) {

        const exposure = readExposure();
        const sizes = columnSizes(order.length, Math.max(1, c));

        let index = 0;

        sizes.forEach(size => {
            for (let row = 0; row < size; row++) {
                const id = order[index++];
                exposure[id] = (exposure[id] || 0) + rowWeight(row);
            }
        });

        writeExposure(exposure);
    }


    /*
       ids      list of media ids to order
       columns  grid columns (1 for a vertical list like Reels)
       avoid    ids to push down (e.g. the card just left)
       record   false = only peek at the order, no exposure credit
    */

    function fairOrder(ids, options = {}) {

        const c = Math.max(1, options.columns || 1);
        const avoid = new Set(options.avoid || []);
        const exposure = readExposure();

        const ranked =
            ids
                .map(id => ({
                    id,
                    score:
                        (exposure[id] || 0) +
                        Math.random() * JITTER +
                        (avoid.has(id) ? AVOID_PENALTY : 0)
                }))
                .sort((a, b) => a.score - b.score)
                .map(entry => entry.id);

        const order = arrange(ranked, c);

        if (options.record !== false) {
            record(order, c);
        }

        return order;
    }


    function formatDuration(seconds) {

        if (!Number.isFinite(seconds) || seconds <= 0) {
            return "";
        }

        const total = Math.round(seconds);
        const h = Math.floor(total / 3600);
        const mins = Math.floor((total % 3600) / 60);
        const secs = total % 60;

        const ss = String(secs).padStart(2, "0");

        return h > 0
            ? `${h}:${String(mins).padStart(2, "0")}:${ss}`
            : `${mins}:${ss}`;
    }


    window.TwiggMedia = {

        getAll: () => items.slice(),

        getById: id => byId.get(id) || null,

        getFeed: feed =>
            items.filter(item => item.feeds.includes(feed)),

        setItems,

        assetUrl,

        fairOrder,

        credit,

        columns,

        formatDuration
    };

})();